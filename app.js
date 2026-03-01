import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, addDoc,
  collection, getDocs, query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const esc = (s="") => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function setMsg(el, msg=""){ if(el) el.textContent = msg; }
function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }
function isAdmin(){ return session.user?.role === "admin"; }

let session = { user:null };

// ---------- UI refs ----------
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

// Admin create project
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
const incProveedor = $("incProveedor");
const incPct = $("incPct");
const btnApplyIncrease = $("btnApplyIncrease");

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

// ---------- Session ----------
function saveSession(){
  localStorage.setItem("macedi_session", JSON.stringify(session));
}
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

// ---------- Login ----------
btnLogin.addEventListener("click", login);
btnLogout.addEventListener("click", ()=>{
  clearSession();
  location.reload();
});

async function login(){
  setMsg(loginError,"");
  const user = (loginUser.value || "").trim();
  const pass = (loginPass.value || "").trim();

  if(!user || !pass){
    setMsg(loginError, "Escribe usuario y password.");
    return;
  }

  const ref = doc(db, "users", user);
  const snap = await getDoc(ref);

  if(!snap.exists()){
    setMsg(loginError, "Usuario no existe.");
    return;
  }

  const data = snap.data();
  if((data.status || "activo") !== "activo"){
    setMsg(loginError, "Usuario inactivo.");
    return;
  }

  if(String(data.password||"") !== pass){
    setMsg(loginError, "Password incorrecto.");
    return;
  }

  session.user = { username:user, role:data.role || "proveedor" };
  saveSession();
  boot();
}

// ---------- Boot ----------
loadSession();
if(session.user) boot();

async function boot(){
  hide(loginCard);
  show(appCard);

  userMeta.textContent = `Usuario: ${session.user.username} | Rol: ${session.user.role}`;

  // Admin-only tabs
  if(!isAdmin()){
    hide(tabCatalogBtn);
    hide(tabUsersBtn);
    hide(adminProjectCreate);
    show(nonAdminProjects);
  }else{
    show(tabCatalogBtn);
    show(tabUsersBtn);
    show(adminProjectCreate);
    hide(nonAdminProjects);
  }

  await fillUserSelectors();
  listenUsers();
  listenCatalog();
  listenProjects();
}

// ---------- Users ----------
btnCreateUser.addEventListener("click", createUser);

async function createUser(){
  setMsg(userError,""); setMsg(userOk,"");

  const username = (uUser.value||"").trim();
  const password = (uPass.value||"").trim();
  const role = uRole.value;
  const status = uStatus.value;

  if(!username || !password){
    setMsg(userError,"Falta usuario o password.");
    return;
  }

  await setDoc(doc(db,"users", username), {
    password,
    role,
    status,
    updatedAt: serverTimestamp()
  }, { merge:true });

  setMsg(userOk, "Usuario creado/actualizado.");
  uUser.value=""; uPass.value="";
}

function listenUsers(){
  if(!isAdmin()) return;
  const qy = query(collection(db,"users"), orderBy("role","asc"));
  onSnapshot(qy, (snap)=>{
    const arr=[];
    snap.forEach(d=>{
      const u = d.id;
      const x = d.data();
      arr.push({ id:u, ...x });
    });

    usersList.innerHTML = arr.map(u=>`
      <div class="item">
        <div><b>${esc(u.id)}</b> <span class="badge">${esc(u.role||"")}</span> <span class="badge">${esc(u.status||"")}</span></div>
        <div class="muted small">Para cambiar password: crea el mismo usuario y pon nuevo password.</div>
      </div>
    `).join("");

    // refresh selectors
    fillUserSelectors(arr).catch(()=>{});
  });
}

async function fillUserSelectors(usersCache=null){
  // Fill fabricante/proveedor selects using role
  const users = usersCache || await (async()=>{
    const snap = await getDocs(collection(db,"users"));
    const arr=[];
    snap.forEach(d=>arr.push({id:d.id, ...d.data()}));
    return arr;
  })();

  const fabricantes = users.filter(u=>u.role==="fabricante" && (u.status||"activo")==="activo");
  const proveedores = users.filter(u=>u.role==="proveedor" && (u.status||"activo")==="activo");

  const opt = (arr, placeholder) => {
    if(arr.length===0) return `<option value="">${placeholder}</option>`;
    return `<option value="">${placeholder}</option>` + arr.map(u=>`<option value="${esc(u.id)}">${esc(u.id)}</option>`).join("");
  };

  if(pFabricante) pFabricante.innerHTML = opt(fabricantes, "Selecciona fabricante");
  if(pProveedor) pProveedor.innerHTML = opt(proveedores, "Selecciona proveedor");
}

// ---------- Projects ----------
btnClearMateriales.addEventListener("click", ()=> pMateriales.value="");
btnCreateProject.addEventListener("click", createProject);

async function createProject(){
  setMsg(projectError,""); setMsg(projectOk,"");

  const name = (pName.value||"").trim();
  const entrega = (pEntrega.value||"").trim();
  const fabricante = (pFabricante.value||"").trim();
  const proveedor = (pProveedor.value||"").trim();

  if(!name || !entrega || !fabricante || !proveedor){
    setMsg(projectError, "Falta: nombre, entrega, fabricante o proveedor.");
    return;
  }

  // Create project
  const projRef = await addDoc(collection(db,"projects"), {
    name,
    entrega,
    fabricante,
    proveedor,
    status: "abierto",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Materials: parse textarea lines
  const lines = (pMateriales.value||"")
    .split("\n")
    .map(l=>l.trim())
    .filter(Boolean);

  for(const line of lines){
    // "Material | Proveedor | Cantidad | Precio"
    const parts = line.split("|").map(x=>x.trim());
    const mName = parts[0] || "";
    const mProv = parts[1] || proveedor; // default
    const mCant = parts[2] ? Number(parts[2]) : 1;
    const mPrecio = parts[3] ? Number(parts[3]) : null;

    if(!mName) continue;

    await addDoc(collection(db,"projects", projRef.id, "materials"), {
      name: mName,
      proveedor: mProv,
      cantidad: Number.isFinite(mCant) ? mCant : 1,
      price: (mPrecio === null || Number.isNaN(mPrecio)) ? null : mPrecio,
      estado: "pendiente",
      note: "",
      updatedAt: serverTimestamp()
    });
  }

  setMsg(projectOk, "Proyecto creado con materiales.");
  pName.value=""; pEntrega.value=""; pFabricante.value=""; pProveedor.value=""; pMateriales.value="";
}

function listenProjects(){
  const role = session.user.role;
  const username = session.user.username;

  let qy;
  if(role === "admin"){
    qy = query(collection(db,"projects"), orderBy("updatedAt","desc"));
  }else if(role === "fabricante"){
    qy = query(collection(db,"projects"), where("fabricante","==", username));
  }else{
    qy = query(collection(db,"projects"), where("proveedor","==", username));
  }

  onSnapshot(qy, (snap)=>{
    const arr=[];
    snap.forEach(d=>arr.push({id:d.id, ...d.data()}));

    const target = isAdmin() ? projectsList : projectsList2;
    target.innerHTML = arr.map(p=>projectCard(p)).join("");

    // Hook events per card
    arr.forEach(p=>{
      const btnClose = document.querySelector(`[data-close="${p.id}"]`);
      const btnDel = document.querySelector(`[data-del="${p.id}"]`);
      const btnAddOne = document.querySelector(`[data-addone="${p.id}"]`);

      if(btnClose) btnClose.onclick = ()=> toggleProjectStatus(p.id, p.status);
      if(btnDel) btnDel.onclick = ()=> deleteProject(p.id);
      if(btnAddOne) btnAddOne.onclick = ()=> addOneMaterial(p.id);
      listenMaterials(p.id);
    });
  });
}

function projectCard(p){
  const st = (p.status||"abierto");
  const badge = st === "cerrado" ? "closed" : "open";

  const canAdmin = isAdmin();

  return `
    <div class="item">
      <h4>${esc(p.name)} <span class="badge ${badge}">${esc(st)}</span></h4>
      <div class="muted small">Entrega: <b>${esc(p.entrega||"")}</b> | Fabricante: <b>${esc(p.fabricante||"")}</b> | Proveedor: <b>${esc(p.proveedor||"")}</b></div>

      <div class="panel" style="margin-top:10px">
        <div class="row">
          <input id="mName_${p.id}" placeholder="Material (si falta, escríbelo aquí)" />
          <input id="mProv_${p.id}" placeholder="Proveedor (texto)" />
          <input id="mCant_${p.id}" type="number" step="1" placeholder="Cant." />
          <button data-addone="${p.id}" class="btn-outline">Agregar</button>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Proveedor</th>
              <th>Cant.</th>
              <th>Estado</th>
              <th>Nota</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody id="mt_${p.id}">
            <tr><td colspan="6" class="muted">Cargando...</td></tr>
          </tbody>
        </table>

        <div class="row">
          ${canAdmin ? `<button data-close="${p.id}">${st==="cerrado" ? "Reabrir" : "Cerrar"}</button>` : `<div></div>`}
          ${canAdmin ? `<button data-del="${p.id}" class="btn-outline">Eliminar</button>` : `<div></div>`}
        </div>
      </div>
    </div>
  `;
}

async function toggleProjectStatus(projectId, current){
  const next = current === "cerrado" ? "abierto" : "cerrado";
  await updateDoc(doc(db,"projects", projectId), { status: next, updatedAt: serverTimestamp() });
}

async function deleteProject(projectId){
  // Simple: marca como eliminado (no borrado físico)
  await updateDoc(doc(db,"projects", projectId), { status: "eliminado", updatedAt: serverTimestamp() });
}

async function addOneMaterial(projectId){
  const name = ($(`mName_${projectId}`).value||"").trim();
  const prov = ($(`mProv_${projectId}`).value||"").trim();
  const cant = Number(($(`mCant_${projectId}`).value||"").trim() || 1);

  if(!name) return;

  await addDoc(collection(db,"projects", projectId, "materials"), {
    name,
    proveedor: prov || "",
    cantidad: Number.isFinite(cant) ? cant : 1,
    price: null,
    estado: "pendiente",
    note: "",
    updatedAt: serverTimestamp()
  });

  $(`mName_${projectId}`).value="";
  $(`mProv_${projectId}`).value="";
  $(`mCant_${projectId}`).value="";
}

function listenMaterials(projectId){
  const tbody = document.getElementById(`mt_${projectId}`);
  if(!tbody) return;

  const role = session.user.role;
  const username = session.user.username;

  // Admin ve todo en el proyecto.
  // Fabricante/Proveedor ven todo lo del proyecto asignado (ya filtramos por proyecto).
  const qy = query(collection(db,"projects", projectId, "materials"), orderBy("name","asc"));

  onSnapshot(qy, (snap)=>{
    const mats=[];
    snap.forEach(d=>mats.push({id:d.id, ...d.data()}));

    tbody.innerHTML = mats.map(m=>{
      return `
        <tr>
          <td>${esc(m.name||"")}</td>
          <td>${esc(m.proveedor||"")}</td>
          <td>${esc(m.cantidad ?? "")}</td>
          <td>
            <select data-st="${projectId}|${m.id}">
              ${optEstado(m.estado)}
            </select>
          </td>
          <td>
            <input data-note="${projectId}|${m.id}" value="${esc(m.note||"")}" placeholder="nota..." />
          </td>
          <td>
            <button class="btn-outline" data-save="${projectId}|${m.id}">Guardar</button>
          </td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="6" class="muted">Sin materiales.</td></tr>`;

    // Bind save buttons
    tbody.querySelectorAll("[data-save]").forEach(btn=>{
      btn.onclick = async ()=>{
        const key = btn.dataset.save;
        const [pid, mid] = key.split("|");
        const stSel = tbody.querySelector(`[data-st="${key}"]`);
        const noteIn = tbody.querySelector(`[data-note="${key}"]`);
        await updateDoc(doc(db,"projects", pid, "materials", mid), {
          estado: stSel.value,
          note: noteIn.value || "",
          updatedAt: serverTimestamp()
        });
      };
    });
  });
}

function optEstado(current){
  const v = (current||"pendiente");
  const opts = ["pendiente","pedido","en_camino","entregado"];
  return opts.map(o=>`<option value="${o}" ${o===v?"selected":""}>${o.replace("_"," ")}</option>`).join("");
}

// ---------- Catalog ----------
btnAddCatalog.addEventListener("click", addCatalogItem);
btnRefreshCatalog.addEventListener("click", ()=> listenCatalog(true));
catalogSearch.addEventListener("input", ()=> renderCatalog(lastCatalog));
btnApplyIncrease.addEventListener("click", applyIncrease);

let unsubCatalog = null;
let lastCatalog = [];

function listenCatalog(force=false){
  if(!isAdmin()) return;
  if(unsubCatalog && !force) return;

  if(unsubCatalog) unsubCatalog();
  const qy = query(collection(db,"catalog"), orderBy("name","asc"));
  unsubCatalog = onSnapshot(qy, (snap)=>{
    const arr=[];
    snap.forEach(d=>arr.push({id:d.id, ...d.data()}));
    lastCatalog = arr;
    renderCatalog(arr);
  });
}

function renderCatalog(arr){
  const q = (catalogSearch.value||"").trim().toLowerCase();
  const filtered = q ? arr.filter(x =>
    (x.name||"").toLowerCase().includes(q) ||
    (x.proveedor||"").toLowerCase().includes(q) ||
    (x.fabricante||"").toLowerCase().includes(q)
  ) : arr;

  catalogList.innerHTML = filtered.map(x=>`
    <div class="item">
      <div><b>${esc(x.name||"")}</b> <span class="badge">${esc(x.unidad||"")}</span></div>
      <div class="muted small">Proveedor: <b>${esc(x.proveedor||"")}</b> | Fabricante: <b>${esc(x.fabricante||"")}</b></div>
      <div class="muted small">Precio: <b>${esc(x.precio ?? "")}</b></div>
      <div class="muted small">Para modificar: vuelve a agregar el mismo producto (mismo nombre) y se actualiza.</div>
    </div>
  `).join("") || `<div class="muted">Sin catálogo aún.</div>`;
}

async function addCatalogItem(){
  if(!isAdmin()) return;

  setMsg(catalogError,""); setMsg(catalogOk,"");

  const name = (cName.value||"").trim();
  if(!name){ setMsg(catalogError,"Falta nombre."); return; }

  const proveedor = (cProveedor.value||"").trim();
  const fabricante = (cFabricante.value||"").trim();
  const unidad = (cUnidad.value||"").trim();
  const precio = Number((cPrecio.value||"").trim() || 0);

  // Usamos doc ID = name (simple)
  await setDoc(doc(db,"catalog", name), {
    name, proveedor, fabricante, unidad,
    precio: Number.isFinite(precio) ? precio : 0,
    updatedAt: serverTimestamp()
  }, { merge:true });

  setMsg(catalogOk,"Agregado/actualizado.");
  cName.value=""; cProveedor.value=""; cFabricante.value=""; cUnidad.value=""; cPrecio.value="";
}

async function applyIncrease(){
  if(!isAdmin()) return;

  const prov = (incProveedor.value||"").trim();
  const pct = Number((incPct.value||"").trim() || 0);

  if(!prov || !Number.isFinite(pct)){
    setMsg(catalogError,"Falta proveedor o %.");
    return;
  }

  const snap = await getDocs(query(collection(db,"catalog"), where("proveedor","==", prov)));
  const updates = [];
  snap.forEach(d=>{
    const x = d.data();
    const old = Number(x.precio||0);
    const neu = old * (1 + (pct/100));
    updates.push(updateDoc(doc(db,"catalog", d.id), { precio: Math.round(neu*100)/100, updatedAt: serverTimestamp() }));
  });

  await Promise.all(updates);
  setMsg(catalogOk, `Aumento aplicado a ${updates.length} productos.`);
}