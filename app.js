import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, query, where, orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);
const esc = (s="") => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function setMsg(el, msg=""){ if(el) el.textContent = msg; }
function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }

let session = { user:null };

function saveSession(){ localStorage.setItem("macedi_session", JSON.stringify(session)); }
function loadSession(){
  try{
    const s = JSON.parse(localStorage.getItem("macedi_session") || "null");
    if(s?.user) session = s;
  }catch{}
}
function clearSession(){
  localStorage.removeItem("macedi_session");
  session = { user:null };
}

function isAdmin(){ return session.user?.role === "admin"; }

// UI refs
const loginCard = $("loginCard");
const appCard = $("appCard");
const loginUser = $("loginUser");
const loginPass = $("loginPass");
const loginError = $("loginError");
const btnLogin = $("btnLogin");
const btnLogout = $("btnLogout");
const userMeta = $("userMeta");

const tabCatalogBtn = $("tabCatalogBtn");
const tabUsersBtn = $("tabUsersBtn");

const adminProjectCreate = $("adminProjectCreate");
const nonAdminProjects = $("nonAdminProjects");
const projectsList = $("projectsList");
const projectsList2 = $("projectsList2");

const pName = $("pName");
const pEntrega = $("pEntrega");
const pFabricante = $("pFabricante");
const pProveedor = $("pProveedor");
const pMateriales = $("pMateriales");
const btnCreateProject = $("btnCreateProject");
const btnClearMateriales = $("btnClearMateriales");
const projectError = $("projectError");
const projectOk = $("projectOk");

// Users
const uUser = $("uUser");
const uPass = $("uPass");
const uRole = $("uRole");
const uStatus = $("uStatus");
const btnCreateUser = $("btnCreateUser");
const userError = $("userError");
const userOk = $("userOk");
const usersList = $("usersList");

// Catalog
const cName = $("cName");
const cProveedor = $("cProveedor");
const cFabricante = $("cFabricante");
const cUnidad = $("cUnidad");
const cPrecio = $("cPrecio");
const btnAddCatalog = $("btnAddCatalog");
const catalogError = $("catalogError");
const catalogOk = $("catalogOk");
const catalogList = $("catalogList");
const catalogSearch = $("catalogSearch");
const btnRefreshCatalog = $("btnRefreshCatalog");
const btnRefreshCatalog2 = $("btnRefreshCatalog2");
const incProveedor = $("incProveedor");
const incPct = $("incPct");
const btnApplyIncrease = $("btnApplyIncrease");

const btnSeedCatalog = $("btnSeedCatalog");
const seedOk = $("seedOk");
const seedErr = $("seedErr");

// Tabs
document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.dataset.tab;
    document.querySelectorAll(".tabpane").forEach(p=>p.classList.add("hidden"));
    $(target).classList.remove("hidden");
  });
});

// ---------- Auth ----------
btnLogin.addEventListener("click", login);
btnLogout.addEventListener("click", ()=>{
  clearSession();
  location.reload();
});

async function login(){
  setMsg(loginError,"");
  const u = (loginUser.value||"").trim();
  const p = (loginPass.value||"").trim();

  if(!u || !p){
    setMsg(loginError, "Escribe usuario y password.");
    return;
  }

  try{
    const ref = doc(db, "users", u);
    const snap = await getDoc(ref);
    if(!snap.exists()){
      setMsg(loginError, "Usuario no existe.");
      return;
    }

    const data = snap.data() || {};
    const passDB = String(data.password ?? "");
    const activo = (data.activo === undefined) ? true : !!data.activo;

    if(!activo){
      setMsg(loginError, "Usuario inactivo.");
      return;
    }
    if(p !== passDB){
      setMsg(loginError, "Password incorrecto.");
      return;
    }

    session.user = { username:u, role: String(data.role||"proveedor") };
    saveSession();
    await bootApp();
  }catch(e){
    console.error(e);
    setMsg(loginError, "Error al ingresar. Revisa conexión/reglas.");
  }
}

async function bootApp(){
  hide(loginCard);
  show(appCard);

  userMeta.textContent = `Usuario: ${session.user.username} | Rol: ${session.user.role}`;

  // Permisos UI
  if(isAdmin()){
    tabCatalogBtn.classList.remove("hidden");
    tabUsersBtn.classList.remove("hidden");
    show(adminProjectCreate);
    hide(nonAdminProjects);
  }else{
    // no admin: ocultar tabs admin
    tabCatalogBtn.classList.add("hidden");
    tabUsersBtn.classList.add("hidden");
    hide(adminProjectCreate);
    show(nonAdminProjects);
  }

  await fillUserDropdowns();
  await renderUsers();
  await renderProjects();
  await renderCatalog();
}

// ---------- Users ----------
btnCreateUser?.addEventListener("click", createUser);

async function createUser(){
  setMsg(userError,""); setMsg(userOk,"");
  if(!isAdmin()){
    setMsg(userError,"Solo admin.");
    return;
  }

  const username = (uUser.value||"").trim();
  const password = (uPass.value||"").trim();
  const role = (uRole.value||"proveedor").trim();
  const status = (uStatus.value||"activo").trim();

  if(!username || !password){
    setMsg(userError,"Falta usuario o password.");
    return;
  }

  try{
    await setDoc(doc(db,"users",username), {
      password,
      role,
      activo: status === "activo",
      createdAt: serverTimestamp()
    }, { merge:true });

    uUser.value=""; uPass.value="";
    setMsg(userOk,"Usuario creado/actualizado.");
    await fillUserDropdowns();
    await renderUsers();
  }catch(e){
    console.error(e);
    setMsg(userError,"Error guardando usuario.");
  }
}

async function renderUsers(){
  if(!isAdmin()) return;
  usersList.innerHTML = "";
  try{
    const snaps = await getDocs(collection(db,"users"));
    snaps.forEach(s=>{
      const d = s.data()||{};
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <div class="title">${esc(s.id)} <span class="muted small">(${esc(d.role||"")})</span></div>
        <div class="muted small">Activo: ${d.activo === false ? "No" : "Sí"}</div>
      `;
      usersList.appendChild(item);
    });
  }catch(e){
    console.error(e);
  }
}

async function fillUserDropdowns(){
  // llenar fabricantes y proveedores para proyectos
  pFabricante.innerHTML = "";
  pProveedor.innerHTML = "";
  try{
    const snaps = await getDocs(collection(db,"users"));
    const fabricantes = [];
    const proveedores = [];
    snaps.forEach(s=>{
      const d = s.data()||{};
      if(d.activo === false) return;
      if(d.role === "fabricante") fabricantes.push(s.id);
      if(d.role === "proveedor") proveedores.push(s.id);
    });

    // defaults
    pFabricante.appendChild(new Option("Seleccionar...", ""));
    pProveedor.appendChild(new Option("Seleccionar...", ""));

    fabricantes.sort().forEach(u=>pFabricante.appendChild(new Option(u,u)));
    proveedores.sort().forEach(u=>pProveedor.appendChild(new Option(u,u)));
  }catch(e){
    console.error(e);
  }
}

// ---------- Projects ----------
btnClearMateriales.addEventListener("click", ()=>{ pMateriales.value=""; });
btnCreateProject.addEventListener("click", createProject);

function parseMaterialsText(txt){
  // line: Material | Proveedor | Cantidad | Precio
  const out = [];
  const lines = (txt||"").split("\n").map(l=>l.trim()).filter(Boolean);
  for(const line of lines){
    const parts = line.split("|").map(x=>x.trim());
    if(parts.length < 1) continue;
    const material = parts[0] || "";
    const proveedor = parts[1] || "";
    const cantidad = parts[2] ? Number(String(parts[2]).replace(/,/g,"")) : null;
    const precio = parts[3] ? Number(String(parts[3]).replace(/,/g,"")) : null;
    if(material) out.push({ material, proveedor, cantidad, precio, status:"pendiente" });
  }
  return out;
}

async function createProject(){
  setMsg(projectError,""); setMsg(projectOk,"");
  if(!isAdmin()){
    setMsg(projectError,"Solo admin.");
    return;
  }

  const name = (pName.value||"").trim();
  const entrega = (pEntrega.value||"").trim();
  const fabricante = (pFabricante.value||"").trim();
  const proveedor = (pProveedor.value||"").trim();
  const materialesTxt = (pMateriales.value||"").trim();

  if(!name){
    setMsg(projectError,"Falta nombre del proyecto.");
    return;
  }
  if(!fabricante || !proveedor){
    setMsg(projectError,"Asigna fabricante y proveedor.");
    return;
  }

  const materiales = parseMaterialsText(materialesTxt);

  try{
    const id = `${name}-${Date.now()}`;
    await setDoc(doc(db,"projects",id), {
      name,
      entrega: entrega || null,
      fabricante,
      proveedor,
      estado: "abierto",
      materiales,
      createdAt: serverTimestamp()
    });

    pName.value=""; pEntrega.value=""; pMateriales.value="";
    setMsg(projectOk,"Proyecto creado.");
    await renderProjects();
  }catch(e){
    console.error(e);
    setMsg(projectError,"Error creando proyecto.");
  }
}

async function renderProjects(){
  const isA = isAdmin();
  if(isA) projectsList.innerHTML = "";
  else projectsList2.innerHTML = "";

  try{
    const snaps = await getDocs(collection(db,"projects"));
    const items = [];
    snaps.forEach(s=>{
      const d = s.data()||{};
      // filtro por rol
      if(!isA){
        const u = session.user.username;
        if(d.fabricante !== u && d.proveedor !== u) return;
      }
      items.push({ id:s.id, ...d });
    });

    items.sort((a,b)=> String(b.createdAt?.seconds||0) - String(a.createdAt?.seconds||0));

    const target = isA ? projectsList : projectsList2;

    items.forEach(p=>{
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <div class="title">${esc(p.name)} <span class="muted small">(${esc(p.estado||"")})</span></div>
        <div class="muted small">Entrega: ${esc(p.entrega || "—")}</div>
        <div class="muted small">Fabricante: ${esc(p.fabricante || "")} | Proveedor: ${esc(p.proveedor || "")}</div>
        <div class="muted small">Materiales: ${Array.isArray(p.materiales) ? p.materiales.length : 0}</div>
      `;
      target.appendChild(item);
    });

    if(items.length === 0){
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "Sin proyectos aún.";
      target.appendChild(empty);
    }
  }catch(e){
    console.error(e);
  }
}

// ---------- Catalog ----------
btnAddCatalog.addEventListener("click", addCatalogItem);
btnRefreshCatalog?.addEventListener("click", renderCatalog);
btnRefreshCatalog2?.addEventListener("click", renderCatalog);
catalogSearch?.addEventListener("input", ()=>renderCatalog(true));
btnApplyIncrease?.addEventListener("click", applyIncrease);
btnSeedCatalog?.addEventListener("click", seedCatalogFromCSV);

function makeIdSafe(s){
  return String(s||"")
    .toLowerCase()
    .trim()
    .replace(/\s+/g,"-")
    .replace(/[^a-z0-9\-áéíóúñü]/gi,"")
    .slice(0,120);
}

async function addCatalogItem(){
  setMsg(catalogError,""); setMsg(catalogOk,"");
  if(!isAdmin()){
    setMsg(catalogError,"Solo admin.");
    return;
  }

  const name = (cName.value||"").trim();
  const proveedor = (cProveedor.value||"").trim();
  const fabricante = (cFabricante.value||"").trim();
  const unidad = (cUnidad.value||"").trim();
  const precio = (cPrecio.value||"").trim();

  if(!name){
    setMsg(catalogError,"Falta nombre.");
    return;
  }

  const id = makeIdSafe([name, proveedor, fabricante, unidad].filter(Boolean).join("-"));

  try{
    await setDoc(doc(db,"catalog",id), {
      name,
      proveedor: proveedor || "Cualquiera",
      fabricante: fabricante || "",
      unidad: unidad || "",
      precio: precio ? Number(precio) : null,
      updatedAt: serverTimestamp()
    }, { merge:true });

    cName.value=""; cProveedor.value=""; cFabricante.value=""; cUnidad.value=""; cPrecio.value="";
    setMsg(catalogOk,"Agregado/actualizado.");
    await renderCatalog();
  }catch(e){
    console.error(e);
    setMsg(catalogError,"Error guardando catálogo.");
  }
}

async function renderCatalog(fromSearch=false){
  catalogList.innerHTML = "";
  setMsg(catalogError,""); setMsg(catalogOk,"");
  const term = (catalogSearch?.value||"").trim().toLowerCase();

  try{
    const snaps = await getDocs(collection(db,"catalog"));
    let rows = [];
    snaps.forEach(s=>{
      const d = s.data()||{};
      rows.push({ id:s.id, ...d });
    });

    // search filter
    if(term){
      rows = rows.filter(r=>{
        const blob = `${r.name||""} ${r.proveedor||""} ${r.fabricante||""} ${r.unidad||""} ${r.precio||""}`.toLowerCase();
        return blob.includes(term);
      });
    }

    // order
    rows.sort((a,b)=> (a.name||"").localeCompare(b.name||"", "es"));

    if(rows.length === 0){
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "Sin catálogo aún.";
      catalogList.appendChild(empty);
      return;
    }

    rows.forEach(r=>{
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <div class="title">${esc(r.name||"")}</div>
        <div class="muted small">Proveedor: ${esc(r.proveedor||"")}</div>
        <div class="muted small">Fabricante: ${esc(r.fabricante||"")}</div>
        <div class="muted small">Unidad: ${esc(r.unidad||"")} | Precio: ${r.precio==null ? "—" : esc(r.precio)}</div>
      `;
      catalogList.appendChild(item);
    });
  }catch(e){
    console.error(e);
    setMsg(catalogError,"Error cargando catálogo (revisa reglas).");
  }
}

async function applyIncrease(){
  setMsg(catalogError,""); setMsg(catalogOk,"");
  if(!isAdmin()){
    setMsg(catalogError,"Solo admin.");
    return;
  }

  const prov = (incProveedor.value||"").trim().toLowerCase();
  const pct = Number((incPct.value||"").trim());
  if(!prov || !Number.isFinite(pct)){
    setMsg(catalogError,"Falta proveedor o %.");
    return;
  }

  try{
    const snaps = await getDocs(collection(db,"catalog"));
    const updates = [];
    snaps.forEach(s=>{
      const d = s.data()||{};
      if(String(d.proveedor||"").toLowerCase() === prov && d.precio != null){
        const nuevo = Number(d.precio) * (1 + pct/100);
        updates.push(updateDoc(doc(db,"catalog",s.id), { precio: Math.round(nuevo*100)/100, updatedAt: serverTimestamp() }));
      }
    });

    await Promise.all(updates);
    setMsg(catalogOk, `Aumento aplicado a ${updates.length} productos.`);
    await renderCatalog();
  }catch(e){
    console.error(e);
    setMsg(catalogError,"Error aplicando aumento.");
  }
}

// ---- CSV Seed ----
// CSV esperado: Familia,Material,Color,Medida,Proveedor,Precio Unitario
function parseCSV(text){
  // parser simple con soporte de comillas
  const rows = [];
  let i = 0, field = "", row = [], inQuotes = false;

  const pushField = ()=>{ row.push(field); field=""; };
  const pushRow = ()=>{ rows.push(row); row=[]; };

  while(i < text.length){
    const c = text[i];

    if(c === '"'){
      if(inQuotes && text[i+1] === '"'){ field += '"'; i+=2; continue; }
      inQuotes = !inQuotes; i++; continue;
    }
    if(!inQuotes && (c === ",")){
      pushField(); i++; continue;
    }
    if(!inQuotes && (c === "\n" || c === "\r")){
      // handle CRLF
      if(c === "\r" && text[i+1] === "\n") i++;
      pushField(); pushRow(); i++; continue;
    }
    field += c;
    i++;
  }
  // last
  if(field.length || row.length){
    pushField(); pushRow();
  }
  return rows.map(r=>r.map(x=>String(x||"").trim()));
}

async function seedCatalogFromCSV(){
  setMsg(seedOk,""); setMsg(seedErr,"");
  if(!isAdmin()){
    setMsg(seedErr,"Solo admin.");
    return;
  }

  try{
    const res = await fetch("./Catalogo.csv", { cache:"no-store" });
    if(!res.ok){
      setMsg(seedErr, "No encuentro Catalogo.csv en tu repo. Súbelo con ese nombre exacto.");
      return;
    }

    const text = await res.text();
    const table = parseCSV(text);
    if(table.length < 2){
      setMsg(seedErr, "CSV vacío o inválido.");
      return;
    }

    const headers = table[0].map(h=>h.toLowerCase());
    const idx = (name)=> headers.indexOf(name.toLowerCase());

    const iMaterial = idx("material");
    const iColor = idx("color");
    const iMedida = idx("medida");
    const iProveedor = idx("proveedor");
    const iPrecio = idx("precio unitario");

    if(iMaterial === -1){
      setMsg(seedErr, "CSV no trae columna 'Material'.");
      return;
    }

    let count = 0;
    for(let r=1; r<table.length; r++){
      const row = table[r];
      const material = row[iMaterial] || "";
      if(!material) continue;

      const color = iColor>-1 ? (row[iColor]||"") : "";
      const medida = iMedida>-1 ? (row[iMedida]||"") : "";
      const proveedor = iProveedor>-1 ? (row[iProveedor]||"Cualquiera") : "Cualquiera";
      const precioRaw = iPrecio>-1 ? (row[iPrecio]||"") : "";
      const precio = precioRaw ? Number(String(precioRaw).replace(/,/g,"")) : null;

      const name = [material, color].filter(Boolean).join(" - ").trim();
      const unidad = medida || "Hoja";
      const id = makeIdSafe([name, proveedor, unidad].join("-"));

      await setDoc(doc(db,"catalog",id), {
        name,
        proveedor: proveedor || "Cualquiera",
        fabricante: "",      // si luego quieres, lo llenamos
        unidad,
        precio: (Number.isFinite(precio) ? precio : null),
        updatedAt: serverTimestamp()
      }, { merge:true });

      count++;
    }

    setMsg(seedOk, `Catálogo base cargado/actualizado: ${count} productos.`);
    await renderCatalog();
  }catch(e){
    console.error(e);
    setMsg(seedErr, "Error cargando CSV. Revisa reglas o que exista Catalogo.csv.");
  }
}

// ---------- Start ----------
(async function init(){
  loadSession();

  if(session.user){
    await bootApp();
  }else{
    show(loginCard);
    hide(appCard);
  }
})();
