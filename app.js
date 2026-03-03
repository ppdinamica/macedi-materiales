// ═══════════════════════════════════════════════════════
//  MACEDI v3
// ═══════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc, query, where, limit,
  serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkRYHgRYTX7m31umvVNH_IDrEepwKIw4I",
  authDomain: "materiales-status.firebaseapp.com",
  projectId: "materiales-status",
  storageBucket: "materiales-status.firebasestorage.app",
  messagingSenderId: "126049792327",
  appId: "1:126049792327:web:01197c9fc37d7e4b6edc62"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── FAMILIAS ─────────────────────────────────────────
const FAMILIAS = ['Melamina','Chapacinta','Triplay','MDF','Bisagra','Riel','Jaladera','Pistones','Tapones','Ménsula','Pintura','Tinta','Otro'];

// ── FLUJO DEL PROYECTO ────────────────────────────────
const FLUJO = [
  { key:'pendiente',       label:'1. Creado',          badge:'badge-pendiente' },
  { key:'fabricando',      label:'2. Fabricando',       badge:'badge-fabricando' },
  { key:'entrega-parcial', label:'3. Entrega parcial',  badge:'badge-entrega-parcial' },
  { key:'ajustes',         label:'4. Ajustes',          badge:'badge-ajustes' },
  { key:'entrega-final',   label:'5. Entrega final',    badge:'badge-entrega-final' },
  { key:'completado',      label:'6. Completado',       badge:'badge-completado' },
];

// Quién puede avanzar cada paso
const FLUJO_AVANCE = {
  'pendiente':       { roles:['admin','fabricante'], label:'Iniciar fabricación' },
  'fabricando':      { roles:['admin'],              label:'Marcar entrega parcial' },
  'entrega-parcial': { roles:['admin'],              label:'Marcar en ajustes' },
  'ajustes':         { roles:['admin'],              label:'Marcar entrega final' },
  'entrega-final':   { roles:['admin'],              label:'Marcar como completado' },
};

// ── CATÁLOGO BASE ─────────────────────────────────────
const CATALOG_DATA = [
  {familia:"Melamina",nombre:"Melamina Arauco 6x8 3/4",color:"Roble Provenzal",medida:"Hoja 6x8",proveedor:"Cualquiera",precio:1550},
  {familia:"Melamina",nombre:"Melamina Arauco 6x8 3/4",color:"Roble Mérida",medida:"Hoja 6x8",proveedor:"Cualquiera",precio:1550},
  {familia:"Melamina",nombre:"Melamina Arauco 6x8 3/4",color:"Encino Polar",medida:"Hoja 6x8",proveedor:"Cualquiera",precio:1550},
  {familia:"Melamina",nombre:"Melamina Arauco 6x8 3/4",color:"Blanco",medida:"Hoja 6x8",proveedor:"Cualquiera",precio:1550},
  {familia:"Melamina",nombre:"Melamina Blanca 5/8",color:"Blanco",medida:"Hoja 4x8",proveedor:"Cualquiera",precio:600},
  {familia:"Melamina",nombre:"Melamina Blanca 1/4 MDF",color:"Blanco",medida:"Hoja 4x8",proveedor:"Cualquiera",precio:500},
  {familia:"Melamina",nombre:"MYP",color:"Cualquier color",medida:"Hoja 4x8",proveedor:"Cualquiera",precio:1100},
  {familia:"Melamina",nombre:"TJ",color:"Cualquier color",medida:"Hoja 4x8",proveedor:"Cualquiera",precio:700},
  {familia:"Melamina",nombre:"Alto Brillo MDF 3/4",color:"Blanco",medida:"Hoja 4x8",proveedor:"Cualquiera",precio:1100},
  {familia:"Chapacinta",nombre:"Chapa plancha Arauco",color:"Roble Provenzal",medida:"100 mts",proveedor:"Cualquiera",precio:600},
  {familia:"Chapacinta",nombre:"Chapa plancha Arauco",color:"Blanco",medida:"100 mts",proveedor:"Cualquiera",precio:600},
  {familia:"Chapacinta",nombre:"Chapa madera plancha Birch",color:"Birch",medida:"mts",proveedor:"Cualquiera",precio:1200},
  {familia:"Triplay",nombre:"Birch 4x8 normal",color:"Normal",medida:"1 hoja 4x8",proveedor:"Cualquiera",precio:800},
  {familia:"Triplay",nombre:"Birch 4x8 2 caras Prefinish",color:"Prefinish",medida:"1 hoja 4x8",proveedor:"Cualquiera",precio:950},
  {familia:"MDF",nombre:"MDF 4x8 normal",color:"Normal",medida:"1 hoja 4x8",proveedor:"Cualquiera",precio:800},
  {familia:"Bisagra",nombre:"Apertura 110 cierre normal",color:"Base plana",medida:"1 par",proveedor:"Cualquiera",precio:25},
  {familia:"Bisagra",nombre:"Apertura 110 cierre suave",color:"Base plana",medida:"1 par",proveedor:"Cualquiera",precio:50},
  {familia:"Bisagra",nombre:"Apertura 110 cierre suave Blum",color:"Base plana",medida:"1 par",proveedor:"Blum",precio:150},
  {familia:"Bisagra",nombre:"Kit esquinero",color:"Base normal",medida:"1 kit",proveedor:"Cualquiera",precio:150},
  {familia:"Riel",nombre:"Extension cierre normal 20\"",color:"Satinado",medida:"20\"",proveedor:"Cualquiera",precio:80},
  {familia:"Riel",nombre:"Extension cierre normal 18\"",color:"Satinado",medida:"18\"",proveedor:"Cualquiera",precio:80},
  {familia:"Riel",nombre:"Extension cierre lento 20\"",color:"Satinado",medida:"20\"",proveedor:"Cualquiera",precio:250},
  {familia:"Jaladera",nombre:"Barra 7 pulgadas",color:"Satinada",medida:"1 pz",proveedor:"Cualquiera",precio:25},
  {familia:"Jaladera",nombre:"Barra 10 pulgadas",color:"Satinada",medida:"1 pz",proveedor:"Cualquiera",precio:25},
  {familia:"Jaladera",nombre:"Forma C delgada 5\"",color:"Satinada",medida:"1 pz",proveedor:"Cualquiera",precio:65},
  {familia:"Pistones",nombre:"Puerta push open canto",color:"Blanco",medida:"1 pz",proveedor:"Cualquiera",precio:50},
  {familia:"Pistones",nombre:"Apertura garaje",color:"Satinado",medida:"80 neutros",proveedor:"Cualquiera",precio:50},
  {familia:"Tapones",nombre:"Calcomanías",color:"Roble Provenzal",medida:"1 hoja",proveedor:"Cualquiera",precio:50},
  {familia:"Tapones",nombre:"Calcomanías",color:"Blanco",medida:"1 hoja",proveedor:"Cualquiera",precio:50},
  {familia:"Ménsula",nombre:"Paleta 1/4",color:"Satinada",medida:"1 bolsa 100 pz",proveedor:"Cualquiera",precio:130},
  {familia:"Pintura",nombre:"Poliuretano blanco semi mate",color:"Blanco",medida:"1 litro",proveedor:"Sayer",precio:300},
  {familia:"Pintura",nombre:"Poliuretano transparente",color:"Transparente",medida:"1 litro",proveedor:"Sayer",precio:300},
  {familia:"Tinta",nombre:"Tinta al aceite",color:"Cualquiera",medida:"1 ltr",proveedor:"Cualquiera",precio:250},
];

// ── ESTADO ────────────────────────────────────────────
let session        = null;
let currentProject = null;
let allUsers       = [];
let allCatalog     = [];
let editingUserId  = null;

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const saved = sessionStorage.getItem('macedi_session');
  if (saved) { session = JSON.parse(saved); await bootApp(); }

  await seedDefaultUsers();
  await seedCatalogIfEmpty();

  document.getElementById('btnLogin').addEventListener('click', doLogin);
  document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
  document.getElementById('btnLogout').addEventListener('click', doLogout);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => { if (item.dataset.view) navigateTo(item.dataset.view); });
  });

  const ham=document.getElementById('hamburger'), over=document.getElementById('overlay'), side=document.getElementById('sidebar');
  ham.addEventListener('click', ()=>{ side.classList.toggle('open'); over.classList.toggle('open'); });
  over.addEventListener('click', ()=>{ side.classList.remove('open'); over.classList.remove('open'); });
});

// ── LOGIN ─────────────────────────────────────────────
async function doLogin() {
  const userId = document.getElementById('loginUser').value.trim().toUpperCase();
  const pass   = document.getElementById('loginPass').value.trim();
  const errEl  = document.getElementById('loginError');
  errEl.textContent = '';
  if (!userId||!pass) { errEl.textContent='Ingresa usuario y contraseña.'; return; }
  try {
    const snap = await getDoc(doc(db,'users',userId));
    if (!snap.exists()) { errEl.textContent='Usuario no encontrado.'; return; }
    const u = snap.data();
    if (u.status==='inactivo') { errEl.textContent='Usuario inactivo.'; return; }
    if (u.password!==pass) { errEl.textContent='Contraseña incorrecta.'; return; }
    session = { userId, role:u.role, nombre:u.nombre||userId };
    sessionStorage.setItem('macedi_session', JSON.stringify(session));
    await bootApp();
  } catch(e) { errEl.textContent='Error de conexión.'; console.error(e); }
}

function doLogout() {
  session=null; sessionStorage.removeItem('macedi_session');
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginUser').value='';
  document.getElementById('loginPass').value='';
}

async function bootApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');
  document.getElementById('sidebarUser').textContent = `${session.nombre}\n${session.role.toUpperCase()}\n${session.userId}`;
  const isAdmin = session.role==='admin';
  document.getElementById('navCatalog').classList.toggle('hidden',!isAdmin);
  document.getElementById('navUsers').classList.toggle('hidden',!isAdmin);
  document.getElementById('btnShowCreateProject').style.display = isAdmin ? '' : 'none';
  allCatalog = await loadCatalogMemory();
  navigateTo('projects');
}

// ── NAVEGACIÓN ────────────────────────────────────────
function navigateTo(view) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('view'+view.charAt(0).toUpperCase()+view.slice(1)).classList.add('active');
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  if (view==='projects') loadProjects();
  if (view==='catalog')  loadCatalogView();
  if (view==='users')    loadUsers();
}

// ═══════════════════════════════════════════════════════
//  PROYECTOS
// ═══════════════════════════════════════════════════════
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '<div class="loading-state">Cargando proyectos...</div>';
  if (session.role==='admin') { await loadUserSelects(); setupCreateProjectBtn(); }

  try {
    let q;
    if (session.role==='admin') {
      q = collection(db,'projects');
    } else if (session.role==='fabricante') {
      q = query(collection(db,'projects'), where('fabricanteId','==',session.userId));
    } else {
      q = query(collection(db,'projects'), where('proveedorId','==',session.userId));
    }

    const snap = await getDocs(q);
    grid.innerHTML = '';
    const docs = [];
    snap.forEach(s => docs.push({id:s.id, d:s.data()}));
    docs.sort((a,b)=>(b.d.createdAt?.toMillis?.()||0)-(a.d.createdAt?.toMillis?.()||0));

    let count=0;
    docs.forEach(({id:sid,d}) => {
      if (session.role==='proveedor' && !['aprobado','fabricando','entrega-parcial','ajustes','entrega-final','completado'].includes(d.estadoFlujo)) return;
      count++;
      const card=document.createElement('div');
      card.className='project-card';
      const flujoInfo = FLUJO.find(f=>f.key===(d.estadoFlujo||'pendiente'))||FLUJO[0];
      card.innerHTML=`
        <div class="project-card-name">${esc(d.name)}</div>
        <div class="project-card-tipo">${esc(d.tipo||'Sin tipo')}</div>
        <div class="project-card-meta">
          📅 Entrega cliente: ${d.fechaCliente?fmtDate(d.fechaCliente):'—'}<br>
          🚚 Entrega mat.: ${d.fechaMat?fmtDate(d.fechaMat):'—'}<br>
          🔨 ${esc(d.fabricanteNombre||'—')} &nbsp;·&nbsp; 📦 ${esc(d.proveedorNombre||'—')}
        </div>
        <span class="badge ${flujoInfo.badge}">${flujoInfo.label.replace(/^\d\. /,'')}</span>
      `;
      card.addEventListener('click',()=>openProject(sid,d));
      grid.appendChild(card);
    });
    if (!count) grid.innerHTML='<div class="loading-state">No hay proyectos aún.</div>';
  } catch(e) {
    grid.innerHTML=`<div class="loading-state" style="color:red">Error: ${e.message}</div>`;
    console.error(e);
  }
}

function setupCreateProjectBtn() {
  document.getElementById('btnShowCreateProject').onclick = () => document.getElementById('createProjectForm').classList.toggle('open');
  document.getElementById('btnCancelCreate').onclick = () => document.getElementById('createProjectForm').classList.remove('open');
  document.getElementById('btnCreateProject').onclick = createProject;
}

async function loadUserSelects() {
  try {
    const snap=await getDocs(collection(db,'users'));
    const fabs=[],provs=[];
    allUsers=[];
    snap.forEach(s=>{ const d=s.data(); allUsers.push({id:s.id,...d});
      if (d.role==='fabricante'&&d.status==='activo') fabs.push({id:s.id,nombre:d.nombre||s.id});
      if (d.role==='proveedor'&&d.status==='activo')  provs.push({id:s.id,nombre:d.nombre||s.id});
    });
    document.getElementById('pFabricante').innerHTML = `<option value="">— Seleccionar —</option>`+fabs.map(u=>`<option value="${u.id}">${esc(u.nombre)}</option>`).join('');
    document.getElementById('pProveedor').innerHTML  = `<option value="">— Seleccionar —</option>`+provs.map(u=>`<option value="${u.id}">${esc(u.nombre)}</option>`).join('');
  } catch(e){ console.error(e); }
}

async function createProject() {
  const name=document.getElementById('pName').value.trim();
  const tipo=document.getElementById('pTipo').value.trim();
  const fabId=document.getElementById('pFabricante').value;
  const provId=document.getElementById('pProveedor').value;
  const fechaInicio=document.getElementById('pFechaInicio').value;
  const fechaMat=document.getElementById('pFechaMat').value;
  const fechaCliente=document.getElementById('pFechaCliente').value;
  const obs=document.getElementById('pObs').value.trim();
  const errEl=document.getElementById('projectError');
  errEl.textContent='';
  if (!name) { errEl.textContent='El nombre es requerido.'; return; }
  const fabUser=allUsers.find(u=>u.id===fabId);
  const provUser=allUsers.find(u=>u.id===provId);
  try {
    await addDoc(collection(db,'projects'),{
      name, tipo,
      fabricanteId:fabId||null, fabricanteNombre:fabUser?(fabUser.nombre||fabId):null,
      proveedorId:provId||null,  proveedorNombre:provUser?(provUser.nombre||provId):null,
      fechaInicio:fechaInicio||null, fechaMat:fechaMat||null, fechaCliente:fechaCliente||null,
      estadoFlujo:'pendiente',
      observaciones: obs?[{texto:obs,autor:session.userId,tipo:'nota',fecha:new Date().toISOString()}]:[],
      createdAt:serverTimestamp()
    });
    ['pName','pTipo','pObs'].forEach(id=>{document.getElementById(id).value='';});
    ['pFechaInicio','pFechaMat','pFechaCliente'].forEach(id=>{document.getElementById(id).value='';});
    document.getElementById('createProjectForm').classList.remove('open');
    loadProjects();
  } catch(e){ errEl.textContent='Error: '+e.message; }
}

// ═══════════════════════════════════════════════════════
//  DETALLE PROYECTO
// ═══════════════════════════════════════════════════════
async function openProject(id, data) {
  currentProject={id,data};
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('viewProjectDetail').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');

  document.getElementById('btnBackProjects').onclick=()=>navigateTo('projects');
  document.getElementById('projectDetailHeader').innerHTML=`
    <div>
      <h1 style="font-size:20px;font-weight:700;color:var(--dark)">${esc(data.name)}</h1>
      <div style="font-size:13px;color:var(--green);font-weight:600">${esc(data.tipo||'')}</div>
    </div>
  `;

  renderInfoBar(data);
  renderWorkflowBar(data.estadoFlujo||'pendiente');
  renderProjectActions(data);
  setupEditDates(id,data);
  await loadMateriales(id,data);
  renderObservaciones(data.observaciones||[]);
  setupObsForm(id,data);

  // Zona agregar materiales
  const canAdd = session.role==='admin' ||
    (session.role==='fabricante' && !['entrega-final','completado'].includes(data.estadoFlujo||'pendiente'));
  const addZone=document.getElementById('fabricanteAddZone');
  addZone.style.display=canAdd?'block':'none';
  if (canAdd) setupMatForm(id);
}

function renderInfoBar(data) {
  const isAdmin=session.role==='admin';
  document.getElementById('projectInfoBar').innerHTML=`
    <div class="info-bar">
      <div class="info-item"><span class="info-label">Inicio fab.</span><span class="info-value">${data.fechaInicio?fmtDate(data.fechaInicio):'—'}</span></div>
      <div class="info-divider"></div>
      <div class="info-item"><span class="info-label">Entrega mat.</span><span class="info-value">${data.fechaMat?fmtDate(data.fechaMat):'—'}</span></div>
      <div class="info-divider"></div>
      <div class="info-item"><span class="info-label">Entrega cliente</span><span class="info-value" style="color:var(--green)">${data.fechaCliente?fmtDate(data.fechaCliente):'—'}</span></div>
      <div class="info-divider"></div>
      <div class="info-item"><span class="info-label">Fabricante</span><span class="info-value">${esc(data.fabricanteNombre||'—')}</span></div>
      <div class="info-divider"></div>
      <div class="info-item"><span class="info-label">Proveedor</span><span class="info-value">${esc(data.proveedorNombre||'—')}</span></div>
      ${isAdmin?`<div class="info-divider"></div><div class="info-item" style="justify-content:flex-end"><button class="btn-edit-dates" id="btnToggleDates">✏️ Editar fechas</button></div>`:''}
    </div>
  `;
  if (isAdmin) {
    document.getElementById('btnToggleDates').onclick=()=>{
      const card=document.getElementById('editDatesCard');
      card.classList.toggle('open');
      if (card.classList.contains('open')) {
        document.getElementById('editFechaInicio').value=data.fechaInicio||'';
        document.getElementById('editFechaMat').value=data.fechaMat||'';
        document.getElementById('editFechaCliente').value=data.fechaCliente||'';
      }
    };
  }
}

function setupEditDates(projectId, data) {
  document.getElementById('btnCancelDates').onclick=()=>document.getElementById('editDatesCard').classList.remove('open');
  document.getElementById('btnSaveDates').onclick=async()=>{
    const fi=document.getElementById('editFechaInicio').value;
    const fm=document.getElementById('editFechaMat').value;
    const fc=document.getElementById('editFechaCliente').value;
    try {
      await updateDoc(doc(db,'projects',projectId),{fechaInicio:fi||null,fechaMat:fm||null,fechaCliente:fc||null});
      data.fechaInicio=fi; data.fechaMat=fm; data.fechaCliente=fc;
      currentProject.data=data;
      renderInfoBar(data);
      document.getElementById('editDatesCard').classList.remove('open');
    } catch(e){ alert('Error: '+e.message); }
  };
}

function renderWorkflowBar(estado) {
  const idx=FLUJO.findIndex(s=>s.key===estado);
  document.getElementById('wfBarContainer').innerHTML=`
    <div class="workflow-bar">
      ${FLUJO.map((s,i)=>`<div class="wf-step ${i<idx?'done':''} ${i===idx?'current':''}">${s.label}</div>`).join('')}
    </div>
  `;
}

function renderProjectActions(data) {
  const zone=document.getElementById('projectDetailActions');
  zone.innerHTML='';
  const estado=data.estadoFlujo||'pendiente';
  const avance=FLUJO_AVANCE[estado];
  if (!avance) return;
  if (!avance.roles.includes(session.role)) return;

  const btn=document.createElement('button');
  btn.className='btn-approve';
  btn.textContent='→ '+avance.label;
  btn.onclick=async()=>{
    const idx=FLUJO.findIndex(f=>f.key===estado);
    const next=FLUJO[idx+1];
    if (!next) return;
    await updateDoc(doc(db,'projects',currentProject.id),{estadoFlujo:next.key});
    // Agregar nota automática a bitácora
    const nota={texto:`Estado cambiado a: ${next.label}`,autor:session.userId,tipo:'estado',fecha:new Date().toISOString()};
    const obs=[...(data.observaciones||[]),nota];
    await updateDoc(doc(db,'projects',currentProject.id),{observaciones:obs});
    data.estadoFlujo=next.key;
    data.observaciones=obs;
    currentProject.data=data;
    renderWorkflowBar(next.key);
    renderProjectActions(data);
    renderInfoBar(data);
    renderObservaciones(obs);
    // Re-evaluar zona materiales
    const canAdd=session.role==='admin'||(session.role==='fabricante'&&!['entrega-final','completado'].includes(next.key));
    document.getElementById('fabricanteAddZone').style.display=canAdd?'block':'none';
  };
  zone.appendChild(btn);
}

// ── MATERIALES: FORMULARIO ────────────────────────────
function setupMatForm(projectId) {
  // Limpiar filas anteriores
  document.getElementById('matRows').innerHTML='';
  document.getElementById('matError').textContent='';
  document.getElementById('matOk').textContent='';
  addMatRow();

  // Búsqueda catálogo
  const searchInput=document.getElementById('catalogSearch');
  const dropdown=document.getElementById('searchDropdown');
  searchInput.oninput=()=>{
    const q=searchInput.value.toLowerCase().trim();
    dropdown.innerHTML='';
    if (q.length<2){dropdown.classList.add('hidden');return;}
    const matches=allCatalog.filter(c=>(c.nombre+' '+c.color+' '+c.familia).toLowerCase().includes(q)).slice(0,10);
    if (!matches.length){dropdown.classList.add('hidden');return;}
    dropdown.classList.remove('hidden');
    matches.forEach(c=>{
      const item=document.createElement('div');
      item.className='search-item';
      item.innerHTML=`<div class="si-name">${esc(c.nombre)}</div><div class="si-sub">${esc(c.familia)} ${c.color?'· '+esc(c.color):''}</div>`;
      item.onclick=()=>{
        addMatRow({nombre:c.nombre,familia:c.familia,color:c.color,medida:c.medida});
        dropdown.classList.add('hidden');
        searchInput.value='';
      };
      dropdown.appendChild(item);
    });
  };
  document.addEventListener('click',e=>{if(!e.target.closest('.search-wrapper'))dropdown.classList.add('hidden');});

  document.getElementById('btnAddRow').onclick=()=>addMatRow();
  document.getElementById('btnSaveMaterials').onclick=()=>saveMaterials(projectId);
}

function addMatRow(prefill=null) {
  const container=document.getElementById('matRows');
  const row=document.createElement('div');
  row.className='mat-entry-row';
  const familiaOpts=FAMILIAS.map(f=>`<option value="${f}" ${prefill?.familia===f?'selected':''}>${f}</option>`).join('');
  row.innerHTML=`
    <input type="text" class="r-nombre" placeholder="Ej: Melamina Arauco 6x8, Bisagra suave..." value="${esc(prefill?.nombre||'')}"/>
    <select class="r-familia">${familiaOpts}</select>
    <input type="number" class="r-cant" placeholder="0" min="1" value=""/>
    <input type="text" class="r-nota" placeholder="Nota opcional..."/>
    <button class="btn-del-row" title="Quitar">✕</button>
  `;
  row.querySelector('.btn-del-row').onclick=()=>row.remove();
  container.appendChild(row);
  row.querySelector('.r-nombre').focus();
}

async function saveMaterials(projectId) {
  const rows=document.querySelectorAll('.mat-entry-row');
  const errEl=document.getElementById('matError');
  const okEl=document.getElementById('matOk');
  errEl.textContent=''; okEl.textContent='';

  const items=[]; let hasError=false;
  rows.forEach((row,i)=>{
    const nombre=row.querySelector('.r-nombre').value.trim();
    const familia=row.querySelector('.r-familia').value;
    const cant=parseInt(row.querySelector('.r-cant').value)||0;
    const nota=row.querySelector('.r-nota').value.trim();
    if (!nombre){errEl.textContent=`Fila ${i+1}: escribe el nombre del material.`;hasError=true;return;}
    if (cant<=0){errEl.textContent=`Fila ${i+1} (${nombre}): la cantidad debe ser mayor a 0.`;hasError=true;return;}
    items.push({nombre,familia,cantidad:cant,nota,entregado:0,status:'pendiente'});
  });

  if (hasError||!items.length){
    if (!items.length&&!hasError) errEl.textContent='Agrega al menos un material.';
    return;
  }

  try {
    const batch=writeBatch(db);
    items.forEach(item=>{
      batch.set(doc(collection(db,'projects',projectId,'materiales')),{...item,createdAt:serverTimestamp()});
    });
    await batch.commit();
    okEl.textContent=`✓ ${items.length} material(es) guardado(s).`;
    document.getElementById('matRows').innerHTML='';
    addMatRow();
    await loadMateriales(projectId,currentProject.data);
  } catch(e){errEl.textContent='Error: '+e.message;console.error(e);}
}

// ── MATERIALES: TABLA ─────────────────────────────────
async function loadMateriales(projectId, projectData) {
  const estado=projectData.estadoFlujo||'pendiente';
  const isProve=session.role==='proveedor';
  document.getElementById('tableProveedorWrap').style.display=isProve?'block':'none';
  document.getElementById('tableAdminWrap').style.display=isProve?'none':'block';

  const tbody=document.getElementById(isProve?'matBodyProveedor':'matBodyAdmin');
  tbody.innerHTML='<tr><td colspan="8" class="loading-state">Cargando...</td></tr>';

  try {
    const snap=await getDocs(collection(db,'projects',projectId,'materiales'));
    tbody.innerHTML='';
    if (snap.empty){tbody.innerHTML='<tr><td colspan="8" class="empty-row">Sin materiales aún.</td></tr>';updateResumen([]);return;}

    const mats=[];
    snap.forEach(s=>mats.push({id:s.id,...s.data()}));
    mats.sort((a,b)=>(a.createdAt?.toMillis?.()||0)-(b.createdAt?.toMillis?.()||0));

    const canEditEntrega=(session.role==='proveedor'&&['fabricando','entrega-parcial','ajustes','entrega-final'].includes(estado))||session.role==='admin';
    const canDelete=session.role==='admin'||session.role==='fabricante';

    mats.forEach(m=>{
      const faltante=Math.max(0,(m.cantidad||0)-(m.entregado||0));
      const tr=document.createElement('tr');

      if (isProve) {
        tr.innerHTML=`
          <td><div class="td-mat">${esc(m.nombre||'—')}</div></td>
          <td>${esc(m.familia||'—')}</td>
          <td class="num">${m.cantidad||0}</td>
          <td class="num">${canEditEntrega?`<input class="entregado-input" type="number" min="0" max="${m.cantidad}" value="${m.entregado||0}" data-id="${m.id}"/>`:(m.entregado||0)}</td>
          <td class="num"><span class="faltante-cell ${faltante===0?'zero':'positive'}">${faltante===0?'✓':faltante}</span></td>
          <td>${canEditEntrega?`<select class="status-select" data-id="${m.id}">${statusOpts(m.status)}</select>`:badge(m.status||'pendiente')}</td>
          <td>${esc(m.nota||'')}</td>
        `;
      } else {
        tr.innerHTML=`
          <td><div class="td-mat">${esc(m.nombre||'—')}</div></td>
          <td>${esc(m.familia||'—')}</td>
          <td class="num">${m.cantidad||0}</td>
          <td class="num">${canEditEntrega?`<input class="entregado-input" type="number" min="0" max="${m.cantidad}" value="${m.entregado||0}" data-id="${m.id}"/>`:(m.entregado||0)}</td>
          <td class="num"><span class="faltante-cell ${faltante===0?'zero':'positive'}">${faltante===0?'✓':faltante}</span></td>
          <td>${canEditEntrega?`<select class="status-select" data-id="${m.id}">${statusOpts(m.status)}</select>`:badge(m.status||'pendiente')}</td>
          <td>${esc(m.nota||'')}</td>
          <td>${canDelete?`<button class="btn-danger btn-sm" data-del="${m.id}">✕</button>`:''}</td>
        `;
      }

      tr.querySelector(`[data-id="${m.id}"].entregado-input`)?.addEventListener('change',async e=>{
        const val=Math.min(parseInt(e.target.value)||0,m.cantidad||0);
        e.target.value=val;
        const ns=val===0?'pendiente':val>=(m.cantidad||0)?'recibido':'parcial';
        await updateDoc(doc(db,'projects',projectId,'materiales',m.id),{entregado:val,status:ns});
        await loadMateriales(projectId,projectData);
      });
      tr.querySelector(`select[data-id="${m.id}"]`)?.addEventListener('change',async e=>{
        await updateDoc(doc(db,'projects',projectId,'materiales',m.id),{status:e.target.value});
        await loadMateriales(projectId,projectData);
      });
      tr.querySelector(`[data-del="${m.id}"]`)?.addEventListener('click',async()=>{
        if (!confirm(`¿Eliminar "${m.nombre}"?`)) return;
        await deleteDoc(doc(db,'projects',projectId,'materiales',m.id));
        await loadMateriales(projectId,projectData);
      });

      tbody.appendChild(tr);
    });
    updateResumen(mats);
  } catch(e){
    tbody.innerHTML=`<tr><td colspan="8" style="color:red;text-align:center">Error: ${e.message}</td></tr>`;
    console.error(e);
  }
}

function statusOpts(current) {
  return ['pendiente','parcial','recibido','faltante']
    .map(s=>`<option value="${s}" ${current===s?'selected':''}>${s}</option>`).join('');
}

function updateResumen(mats) {
  const total=mats.length;
  const recibido=mats.filter(m=>m.status==='recibido').length;
  const parcial=mats.filter(m=>m.status==='parcial').length;
  const pendiente=mats.filter(m=>m.status==='pendiente').length;
  const pct=total?Math.round((recibido/total)*100):0;
  document.getElementById('resumenChips').innerHTML=`
    <span class="chip">Total: ${total}</span>
    <span class="chip" style="background:#dcfce7;border-color:#a7f3d0;color:#15803d">✓ ${recibido} (${pct}%)</span>
    <span class="chip" style="background:#fffbeb;border-color:#fde68a;color:#b45309">Parcial: ${parcial}</span>
    <span class="chip" style="background:#f1f5f9;border-color:#cbd5e1;color:#475569">Pendiente: ${pendiente}</span>
  `;
}

// ── BITÁCORA ──────────────────────────────────────────
function renderObservaciones(obs) {
  const el=document.getElementById('obsHistory');
  if (!obs?.length){el.innerHTML='<p style="color:var(--muted);font-size:13px;margin-bottom:12px">Sin notas aún.</p>';return;}
  el.innerHTML=`<div class="obs-list">${obs.map(o=>`
    <div class="obs-item ${o.tipo==='estado'?'obs-ajuste':''}">
      <div>${esc(o.texto)}</div>
      <div class="obs-meta">${esc(o.autor)} · ${fmtDateTime(o.fecha)}</div>
    </div>`).join('')}</div>`;
}

function setupObsForm(projectId, projectData) {
  const zone=document.getElementById('addObsZone');
  zone.style.display='block';
  document.getElementById('btnAddObs').onclick=async()=>{
    const texto=document.getElementById('newObsText').value.trim();
    if (!texto) return;
    const obs=[...(projectData.observaciones||[]),{texto,autor:session.userId,tipo:'nota',fecha:new Date().toISOString()}];
    await updateDoc(doc(db,'projects',projectId),{observaciones:obs});
    projectData.observaciones=obs;
    currentProject.data.observaciones=obs;
    document.getElementById('newObsText').value='';
    renderObservaciones(obs);
  };
}

// ═══════════════════════════════════════════════════════
//  CATÁLOGO
// ═══════════════════════════════════════════════════════
async function loadCatalogMemory() {
  try {
    const snap=await getDocs(collection(db,'catalog'));
    const list=[];
    snap.forEach(s=>list.push({id:s.id,...s.data()}));
    return list.length?list:CATALOG_DATA;
  } catch(e){return CATALOG_DATA;}
}

async function loadCatalogView() {
  allCatalog=await loadCatalogMemory();
  renderCatalogList(allCatalog);
  document.getElementById('catalogFilter').oninput=e=>{
    const q=e.target.value.toLowerCase();
    renderCatalogList(allCatalog.filter(c=>(c.nombre+c.color+c.familia+c.medida).toLowerCase().includes(q)));
  };
  document.getElementById('btnAddCatalog').onclick=async()=>{
    const familia=document.getElementById('cFamilia').value.trim();
    const nombre=document.getElementById('cNombre').value.trim();
    const color=document.getElementById('cColor').value.trim();
    const medida=document.getElementById('cMedida').value.trim();
    const proveedor=document.getElementById('cProveedorField').value.trim();
    const precio=parseFloat(document.getElementById('cPrecio').value)||0;
    const errEl=document.getElementById('catalogError'),okEl=document.getElementById('catalogOk');
    errEl.textContent='';okEl.textContent='';
    if (!nombre){errEl.textContent='El nombre es requerido.';return;}
    try {
      await addDoc(collection(db,'catalog'),{familia,nombre,color,medida,proveedor,precio,createdAt:serverTimestamp()});
      okEl.textContent=`✓ "${nombre}" agregado.`;
      ['cFamilia','cNombre','cColor','cMedida','cProveedorField','cPrecio'].forEach(id=>document.getElementById(id).value='');
      allCatalog=await loadCatalogMemory();
      renderCatalogList(allCatalog);
    } catch(e){errEl.textContent='Error: '+e.message;}
  };
}

function renderCatalogList(items) {
  const cont=document.getElementById('catalogListContainer');
  if (!items.length){cont.innerHTML='<div class="loading-state">Sin resultados.</div>';return;}
  cont.innerHTML=items.map(c=>`
    <div class="catalog-item">
      <div class="ci-main">
        <div class="ci-name">${esc(c.nombre)}${c.color?' — '+esc(c.color):''}</div>
        <div class="ci-sub">${esc(c.familia||'')} ${c.medida?'· '+esc(c.medida):''} ${c.proveedor?'· '+esc(c.proveedor):''}</div>
      </div>
      <div class="ci-price">$${fmt(c.precio||0)}</div>
      <button class="btn-danger btn-sm" data-del-cat="${c.id}">✕</button>
    </div>`).join('');
  cont.querySelectorAll('[data-del-cat]').forEach(btn=>{
    btn.onclick=async()=>{
      if (!confirm('¿Eliminar del catálogo?'))return;
      await deleteDoc(doc(db,'catalog',btn.dataset.delCat));
      allCatalog=await loadCatalogMemory();
      renderCatalogList(allCatalog);
    };
  });
}

// ═══════════════════════════════════════════════════════
//  USUARIOS
// ═══════════════════════════════════════════════════════
async function loadUsers() {
  const cont=document.getElementById('usersListContainer');
  cont.innerHTML='<div class="loading-state">Cargando...</div>';
  try {
    const snap=await getDocs(collection(db,'users'));
    allUsers=[];
    snap.forEach(s=>allUsers.push({id:s.id,...s.data()}));
    renderUsersList();
  } catch(e){cont.innerHTML=`<div class="loading-state" style="color:red">${e.message}</div>`;}

  editingUserId=null;
  document.getElementById('userFormTitle').textContent='Crear usuario';
  document.getElementById('btnSaveUser').textContent='Crear usuario';
  document.getElementById('btnCancelEdit').classList.add('hidden');
  ['uNombre','uId','uPass'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('btnSaveUser').onclick=saveUser;
  document.getElementById('btnCancelEdit').onclick=()=>loadUsers();
}

async function saveUser() {
  const nombre=document.getElementById('uNombre').value.trim();
  const id=document.getElementById('uId').value.trim().toUpperCase();
  const pass=document.getElementById('uPass').value.trim();
  const role=document.getElementById('uRole').value;
  const errEl=document.getElementById('userError'),okEl=document.getElementById('userOk');
  errEl.textContent='';okEl.textContent='';
  if (!nombre){errEl.textContent='El nombre es requerido.';return;}
  if (!editingUserId&&!id){errEl.textContent='El ID es requerido.';return;}
  if (!editingUserId&&!pass){errEl.textContent='La contraseña es requerida.';return;}
  if (pass&&pass.length<4){errEl.textContent='Contraseña muy corta.';return;}
  try {
    const uid=editingUserId||id;
    const data={nombre,role};
    if (pass) data.password=pass;
    if (!editingUserId) data.status='activo';
    await setDoc(doc(db,'users',uid),data,{merge:true});
    okEl.textContent=`✓ Usuario ${uid} ${editingUserId?'actualizado':'creado'}.`;
    await loadUsers();
  } catch(e){errEl.textContent='Error: '+e.message;}
}

function renderUsersList() {
  const cont=document.getElementById('usersListContainer');
  if (!allUsers.length){cont.innerHTML='<div class="loading-state">Sin usuarios.</div>';return;}
  cont.innerHTML=allUsers.map(u=>`
    <div class="user-card">
      <div class="user-card-name">${esc(u.nombre||u.id)}</div>
      <div class="user-card-rol">${esc(u.role)}</div>
      <div class="user-card-creds">Usuario: ${esc(u.id)} &nbsp;|&nbsp; Pass: ${esc(u.password||'••••')}</div>
      <div class="user-card-actions">
        <span class="${u.status==='activo'?'badge badge-activo':'badge badge-inactivo'}">${u.status}</span>
        <button class="btn-ghost btn-sm" data-toggle="${u.id}" data-status="${u.status}">${u.status==='activo'?'Desactivar':'Activar'}</button>
        <button class="btn-ghost btn-sm" data-edit="${u.id}">✏️ Editar</button>
        ${u.id!==session.userId?`<button class="btn-danger btn-sm" data-del-user="${u.id}">Eliminar</button>`:''}
      </div>
    </div>`).join('');

  cont.querySelectorAll('[data-toggle]').forEach(btn=>{
    btn.onclick=async()=>{
      const ns=btn.dataset.status==='activo'?'inactivo':'activo';
      await updateDoc(doc(db,'users',btn.dataset.toggle),{status:ns});
      await loadUsers();
    };
  });
  cont.querySelectorAll('[data-edit]').forEach(btn=>{
    btn.onclick=()=>{
      const u=allUsers.find(x=>x.id===btn.dataset.edit);
      if (!u) return;
      editingUserId=u.id;
      document.getElementById('userFormTitle').textContent=`Editar: ${u.nombre||u.id}`;
      document.getElementById('btnSaveUser').textContent='Guardar cambios';
      document.getElementById('btnCancelEdit').classList.remove('hidden');
      document.getElementById('uNombre').value=u.nombre||'';
      document.getElementById('uId').value=u.id;
      document.getElementById('uPass').value='';
      document.getElementById('uRole').value=u.role;
      document.getElementById('userFormCard').scrollIntoView({behavior:'smooth'});
    };
  });
  cont.querySelectorAll('[data-del-user]').forEach(btn=>{
    btn.onclick=async()=>{
      if (!confirm(`¿Eliminar usuario ${btn.dataset.delUser}?`)) return;
      await deleteDoc(doc(db,'users',btn.dataset.delUser));
      await loadUsers();
    };
  });
}

// ═══════════════════════════════════════════════════════
//  SEED
// ═══════════════════════════════════════════════════════
async function seedDefaultUsers() {
  const defaults=[
    {id:'ADMIN01',password:'Hilario123',role:'admin',nombre:'Administrador',status:'activo'},
    {id:'FABRICANTE01',password:'Fabricante123',role:'fabricante',nombre:'Fabricante 01',status:'activo'},
    {id:'PROVEEDOR01',password:'Proveedor123',role:'proveedor',nombre:'Proveedor 01',status:'activo'},
  ];
  for (const u of defaults) {
    const snap=await getDoc(doc(db,'users',u.id));
    if (!snap.exists()) await setDoc(doc(db,'users',u.id),u);
  }
}

async function seedCatalogIfEmpty() {
  try {
    const snap=await getDocs(query(collection(db,'catalog'),limit(1)));
    if (!snap.empty) return;
    const batch=writeBatch(db);
    CATALOG_DATA.forEach((item,i)=>{
      batch.set(doc(db,'catalog',String(i+1).padStart(4,'0')),{...item,createdAt:serverTimestamp()});
    });
    await batch.commit();
  } catch(e){console.error(e);}
}

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
function esc(str){ if(!str)return''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmt(n){ return Number(n).toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:2}); }
function fmtDate(str){ if(!str)return'—'; const[y,m,d]=str.split('-'); return `${d}/${m}/${y}`; }
function fmtDateTime(iso){ if(!iso)return'—'; const d=new Date(iso); return `${d.toLocaleDateString('es-MX')} ${d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}`; }
function badge(estado){
  const map={pendiente:'badge-pendiente',fabricando:'badge-fabricando','entrega-parcial':'badge-entrega-parcial',ajustes:'badge-ajustes','entrega-final':'badge-entrega-final',completado:'badge-completado',parcial:'badge-parcial',recibido:'badge-recibido',faltante:'badge-faltante',activo:'badge-activo',inactivo:'badge-inactivo','en-proceso':'badge-en-proceso',aprobado:'badge-aprobado'};
  return `<span class="badge ${map[estado]||'badge-pendiente'}">${esc(estado)}</span>`;
}
