// ═══════════════════════════════════════════════════════
//  MACEDI v2 — Control de Materiales
// ═══════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc, query, where, orderBy,
  limit, serverTimestamp, writeBatch
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

// ── CATÁLOGO BASE ─────────────────────────────────────
const CATALOG_DATA = [{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Roble Provenzal","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Roble Mérida","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Encino Polar","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Cendra Escandinavo","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Aserrado Nórdico","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Nogal Terracota","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Ébano Indi","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Fresno Bruma","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Wengué","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Linosa Ceniza","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Seda Giorno","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Toscana","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Riviera","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Nativa","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Alaska","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Avella","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Cocoa","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Nougat","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Moscato","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Espresso","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Mármara","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Arauco 6x8 de 3/4","color":"Vizcaya","medida":"Hoja 6x8","proveedor":"Cualquiera","precio":1550},{"familia":"Melamina","nombre":"Melamina Blanca aglomerado 5/8","color":"Blanco","medida":"Hoja 4x8","proveedor":"Cualquiera","precio":600},{"familia":"Melamina","nombre":"Melamina Blanca 2 caras 1/4 MDF","color":"Blanco","medida":"Hoja 1/4","proveedor":"Cualquiera","precio":500},{"familia":"Melamina","nombre":"MYP","color":"Cualquier color","medida":"Hoja 4x8","proveedor":"Cualquiera","precio":1100},{"familia":"Melamina","nombre":"TJ","color":"Cualquier color","medida":"Hoja 4x8","proveedor":"Cualquiera","precio":700},{"familia":"Melamina","nombre":"Otro","color":"Cualquier color","medida":"Hoja 4x8","proveedor":"Cualquiera","precio":700},{"familia":"Melamina","nombre":"Blanca Alto Brillo MDF 3/4","color":"Blanco Alto Brillo","medida":"Hoja 4x8","proveedor":"Cualquiera","precio":1100},{"familia":"Chapacinta","nombre":"Chapa plancha Arauco","color":"Roble Provenzal","medida":"100 mts","proveedor":"Cualquiera","precio":600},{"familia":"Chapacinta","nombre":"Chapa plancha Arauco","color":"Wengué","medida":"108 mts","proveedor":"Cualquiera","precio":600},{"familia":"Chapacinta","nombre":"Chapa plancha Arauco","color":"Alaska","medida":"114 mts","proveedor":"Cualquiera","precio":600},{"familia":"Chapacinta","nombre":"Chapa madera plancha","color":"Birch","medida":"mts","proveedor":"Cualquiera","precio":1200},{"familia":"Chapacinta","nombre":"Chapa madera plancha","color":"Encino","medida":"mts","proveedor":"Cualquiera","precio":1200},{"familia":"Chapacinta","nombre":"Chapa madera plancha","color":"Maple","medida":"mts","proveedor":"Cualquiera","precio":1200},{"familia":"Pintura","nombre":"Poliuretano","color":"Blanco semi mate","medida":"1 litro","proveedor":"Sayer","precio":300},{"familia":"Pintura","nombre":"Poliuretano","color":"Fondo blanco","medida":"1 litro","proveedor":"Sayer","precio":300},{"familia":"Pintura","nombre":"Poliuretano","color":"Transparente","medida":"1 litro","proveedor":"Sayer","precio":300},{"familia":"Pintura","nombre":"Poliuretano","color":"Blanco semi mate","medida":"1 Galón","proveedor":"Sayer","precio":1300},{"familia":"Pintura","nombre":"Poliuretano","color":"Transparente","medida":"1 Galón","proveedor":"Sayer","precio":800},{"familia":"Pintura","nombre":"Kit líquidos (catal, diluy, endure)","color":"Líquidos","medida":"1 Galón","proveedor":"Sayer","precio":800},{"familia":"Bisagra","nombre":"Apertura 110 cierre normal","color":"Base plana","medida":"1 par","proveedor":"Cualquiera","precio":25},{"familia":"Bisagra","nombre":"Apertura 110 cierre normal","color":"Base avión","medida":"1 par","proveedor":"Cualquiera","precio":25},{"familia":"Bisagra","nombre":"Apertura 110 cierre suave","color":"Base plana","medida":"1 par","proveedor":"Cualquiera","precio":50},{"familia":"Bisagra","nombre":"Apertura 110 cierre suave","color":"Base avión","medida":"1 par","proveedor":"Cualquiera","precio":50},{"familia":"Bisagra","nombre":"Apertura 110 cierre suave Blum","color":"Base plana","medida":"1 par","proveedor":"Blum","precio":150},{"familia":"Bisagra","nombre":"Kit esquinero","color":"Base normal","medida":"1 kit","proveedor":"Cualquiera","precio":150},{"familia":"Bisagra","nombre":"Kit esquinero Blum","color":"Base normal","medida":"1 kit","proveedor":"Blum","precio":215},{"familia":"Bisagra","nombre":"Pata corta","color":"Base normal","medida":"1 par","proveedor":"Cualquiera","precio":35},{"familia":"Pistones","nombre":"Puerta push open canto","color":"Blanco","medida":"1 pz","proveedor":"Cualquiera","precio":50},{"familia":"Pistones","nombre":"Puerta push open canto","color":"Negro","medida":"1 pz","proveedor":"Cualquiera","precio":50},{"familia":"Pistones","nombre":"Puerta push en mueble","color":"Gris","medida":"1 pz","proveedor":"Cualquiera","precio":50},{"familia":"Pistones","nombre":"Apertura garaje","color":"Satinado","medida":"80 neutros","proveedor":"Cualquiera","precio":50},{"familia":"Jaladera","nombre":"Barra 7 pulgadas","color":"Satinada","medida":"1 pz","proveedor":"Cualquiera","precio":25},{"familia":"Jaladera","nombre":"Barra 10 pulgadas","color":"Satinada","medida":"1 pz","proveedor":"Cualquiera","precio":25},{"familia":"Jaladera","nombre":"Forma C delgada 5\"","color":"Satinada","medida":"1 pz","proveedor":"Cualquiera","precio":65},{"familia":"Jaladera","nombre":"Forma C delgada 7\"","color":"Satinada","medida":"1 pz","proveedor":"Cualquiera","precio":85},{"familia":"Riel","nombre":"Extension cierre normal 20\"","color":"Satinado","medida":"20\"","proveedor":"Cualquiera","precio":80},{"familia":"Riel","nombre":"Extension cierre normal 18\"","color":"Satinado","medida":"18\"","proveedor":"Cualquiera","precio":80},{"familia":"Riel","nombre":"Extension cierre normal 16\"","color":"Satinado","medida":"16\"","proveedor":"Cualquiera","precio":80},{"familia":"Riel","nombre":"Extension cierre lento 20\"","color":"Satinado","medida":"20\"","proveedor":"Cualquiera","precio":250},{"familia":"Tapones","nombre":"Calcomanías","color":"Roble Provenzal","medida":"1 hoja","proveedor":"Cualquiera","precio":50},{"familia":"Tapones","nombre":"Calcomanías","color":"Blanco","medida":"1 hoja","proveedor":"Cualquiera","precio":50},{"familia":"Ménsula","nombre":"Paleta 1/4","color":"Satinada","medida":"1 bolsa 100 pz","proveedor":"Cualquiera","precio":130},{"familia":"Triplay","nombre":"Birch 4x8 normal","color":"Normal","medida":"1 hoja 4x8","proveedor":"Cualquiera","precio":800},{"familia":"Triplay","nombre":"Birch 4x8 2 caras Prefinish","color":"Prefinish","medida":"1 hoja 4x8","proveedor":"Cualquiera","precio":950},{"familia":"Triplay","nombre":"Birch 4x8 1 cara Prefinish","color":"Prefinish","medida":"1 hoja 4x8","proveedor":"Cualquiera","precio":890},{"familia":"MDF","nombre":"MDF 4x8 normal","color":"Normal","medida":"1 hoja 4x8","proveedor":"Cualquiera","precio":800},{"familia":"Tinta","nombre":"Tinta al aceite","color":"Cualquiera","medida":"1 ltr","proveedor":"Cualquiera","precio":250}];

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
  document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('btnLogout').addEventListener('click', doLogout);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => { if (item.dataset.view) navigateTo(item.dataset.view); });
  });

  // Hamburger
  const ham  = document.getElementById('hamburger');
  const over = document.getElementById('overlay');
  const side = document.getElementById('sidebar');
  ham.addEventListener('click', () => { side.classList.toggle('open'); over.classList.toggle('open'); });
  over.addEventListener('click', () => { side.classList.remove('open'); over.classList.remove('open'); });
});

// ── LOGIN ─────────────────────────────────────────────
async function doLogin() {
  const userId = document.getElementById('loginUser').value.trim().toUpperCase();
  const pass   = document.getElementById('loginPass').value.trim();
  const errEl  = document.getElementById('loginError');
  errEl.textContent = '';
  if (!userId || !pass) { errEl.textContent = 'Ingresa usuario y contraseña.'; return; }
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists())           { errEl.textContent = 'Usuario no encontrado.'; return; }
    const u = snap.data();
    if (u.status === 'inactivo')  { errEl.textContent = 'Usuario inactivo. Contacta al administrador.'; return; }
    if (u.password !== pass)      { errEl.textContent = 'Contraseña incorrecta.'; return; }
    session = { userId, role: u.role, nombre: u.nombre || userId };
    sessionStorage.setItem('macedi_session', JSON.stringify(session));
    await bootApp();
  } catch(e) { errEl.textContent = 'Error de conexión.'; console.error(e); }
}

function doLogout() {
  session = null;
  sessionStorage.removeItem('macedi_session');
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

async function bootApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');

  document.getElementById('sidebarUser').textContent =
    `${session.nombre}\n${session.role.toUpperCase()}\n${session.userId}`;

  const isAdmin = session.role === 'admin';
  document.getElementById('navCatalog').classList.toggle('hidden', !isAdmin);
  document.getElementById('navUsers').classList.toggle('hidden', !isAdmin);
  document.getElementById('btnShowCreateProject').style.display = isAdmin ? '' : 'none';

  allCatalog = await loadCatalogMemory();
  navigateTo('projects');
}

// ── NAVEGACIÓN ────────────────────────────────────────
function navigateTo(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view' + view.charAt(0).toUpperCase() + view.slice(1)).classList.add('active');
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  if (view === 'projects') loadProjects();
  if (view === 'catalog')  loadCatalogView();
  if (view === 'users')    loadUsers();
}

// ═══════════════════════════════════════════════════════
//  PROYECTOS
// ═══════════════════════════════════════════════════════
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '<div class="loading-state">Cargando proyectos...</div>';

  if (session.role === 'admin') {
    await loadUserSelects();
    setupCreateProjectBtn();
  }

  try {
    let q;
    if (session.role === 'admin') {
      q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    } else if (session.role === 'fabricante') {
      q = query(collection(db, 'projects'), where('fabricanteId', '==', session.userId), orderBy('createdAt', 'desc'));
    } else {
      // proveedor — solo ve proyectos aprobados+
      q = query(collection(db, 'projects'), where('proveedorId', '==', session.userId), orderBy('createdAt', 'desc'));
    }

    const snap = await getDocs(q);
    grid.innerHTML = '';

    if (snap.empty) { grid.innerHTML = '<div class="loading-state">No hay proyectos aún.</div>'; return; }

    let count = 0;
    snap.forEach(s => {
      const d = s.data();
      // Proveedor solo ve aprobados en adelante
      if (session.role === 'proveedor' && !['aprobado','en-entrega','completado'].includes(d.estadoFlujo)) return;

      count++;
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card-name">${esc(d.name)}</div>
        <div class="project-card-tipo">${esc(d.tipo || 'Sin tipo')}</div>
        <div class="project-card-meta">
          📅 Proyecto: ${d.fechaProyecto ? fmtDate(d.fechaProyecto) : '—'}<br>
          🚚 Mat. listos: ${d.fechaMateriales ? fmtDate(d.fechaMateriales) : '—'}<br>
          🔨 Fabricante: ${esc(d.fabricanteNombre || '—')}<br>
          📦 Proveedor: ${esc(d.proveedorNombre || '—')}
        </div>
        <div>${badge(d.estadoFlujo || 'pendiente')}</div>
      `;
      card.addEventListener('click', () => openProject(s.id, d));
      grid.appendChild(card);
    });

    if (!count) grid.innerHTML = '<div class="loading-state">No hay proyectos visibles para tu rol.</div>';
  } catch(e) {
    grid.innerHTML = `<div class="loading-state" style="color:red">Error: ${e.message}</div>`;
    console.error(e);
  }
}

function setupCreateProjectBtn() {
  const btn    = document.getElementById('btnShowCreateProject');
  const form   = document.getElementById('createProjectForm');
  const cancel = document.getElementById('btnCancelCreate');
  const create = document.getElementById('btnCreateProject');
  btn.onclick    = () => form.classList.toggle('open');
  cancel.onclick = () => form.classList.remove('open');
  create.onclick = createProject;
}

async function loadUserSelects() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const fabs = []; const provs = [];
    allUsers = [];
    snap.forEach(s => {
      const d = s.data();
      allUsers.push({ id: s.id, ...d });
      if (d.role === 'fabricante' && d.status === 'activo') fabs.push({ id: s.id, nombre: d.nombre || s.id });
      if (d.role === 'proveedor'  && d.status === 'activo') provs.push({ id: s.id, nombre: d.nombre || s.id });
    });
    const fabSel  = document.getElementById('pFabricante');
    const provSel = document.getElementById('pProveedor');
    fabSel.innerHTML  = `<option value="">— Seleccionar —</option>` + fabs.map(u => `<option value="${u.id}">${esc(u.nombre)}</option>`).join('');
    provSel.innerHTML = `<option value="">— Seleccionar —</option>` + provs.map(u => `<option value="${u.id}">${esc(u.nombre)}</option>`).join('');
  } catch(e) { console.error(e); }
}

async function createProject() {
  const name    = document.getElementById('pName').value.trim();
  const tipo    = document.getElementById('pTipo').value.trim();
  const fabId   = document.getElementById('pFabricante').value;
  const provId  = document.getElementById('pProveedor').value;
  const fechaP  = document.getElementById('pFechaProyecto').value;
  const fechaM  = document.getElementById('pFechaMateriales').value;
  const obs     = document.getElementById('pObs').value.trim();
  const errEl   = document.getElementById('projectError');
  errEl.textContent = '';

  if (!name) { errEl.textContent = 'El nombre del proyecto es requerido.'; return; }

  const fabUser  = allUsers.find(u => u.id === fabId);
  const provUser = allUsers.find(u => u.id === provId);

  try {
    await addDoc(collection(db, 'projects'), {
      name, tipo,
      fabricanteId:     fabId || null,
      fabricanteNombre: fabUser ? (fabUser.nombre || fabId) : null,
      proveedorId:      provId || null,
      proveedorNombre:  provUser ? (provUser.nombre || provId) : null,
      fechaProyecto:    fechaP || null,
      fechaMateriales:  fechaM || null,
      estadoFlujo:      'pendiente',
      observaciones:    obs ? [{ texto: obs, autor: session.userId, fecha: new Date().toISOString() }] : [],
      createdAt:        serverTimestamp()
    });
    ['pName','pTipo','pFecha','pObs'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    document.getElementById('pFechaProyecto').value  = '';
    document.getElementById('pFechaMateriales').value = '';
    document.getElementById('createProjectForm').classList.remove('open');
    loadProjects();
  } catch(e) { errEl.textContent = 'Error: ' + e.message; }
}

// ═══════════════════════════════════════════════════════
//  DETALLE PROYECTO
// ═══════════════════════════════════════════════════════
async function openProject(id, data) {
  currentProject = { id, data };

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('viewProjectDetail').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');

  document.getElementById('btnBackProjects').onclick = () => navigateTo('projects');
  document.getElementById('projectDetailHeader').innerHTML = `
    <h1>${esc(data.name)} <span style="font-size:15px;color:var(--green);font-weight:600">${esc(data.tipo || '')}</span></h1>
  `;

  renderInfoBar(data);
  renderWorkflowBar(data.estadoFlujo || 'pendiente');
  renderProjectActions(data);
  await loadMateriales(id, data);
  renderObservaciones(data.observaciones || []);
  setupObsForm(id, data);

  // Zona agregar materiales: fabricante cuando no está aprobado, admin siempre
  const canAdd = session.role === 'admin' ||
    (session.role === 'fabricante' && ['pendiente','en-proceso'].includes(data.estadoFlujo || 'pendiente'));

  const addZone = document.getElementById('fabricanteAddZone');
  addZone.style.display = canAdd ? 'block' : 'none';
  if (canAdd) setupAddMaterialZone(id);
}

function renderInfoBar(data) {
  document.getElementById('projectInfoBar').innerHTML = `
    <div class="info-bar">
      <div class="info-item"><span class="info-label">Fecha proyecto</span><span class="info-value">${data.fechaProyecto ? fmtDate(data.fechaProyecto) : '—'}</span></div>
      <div class="info-divider"></div>
      <div class="info-item"><span class="info-label">Entrega materiales</span><span class="info-value">${data.fechaMateriales ? fmtDate(data.fechaMateriales) : '—'}</span></div>
      <div class="info-divider"></div>
      <div class="info-item"><span class="info-label">Fabricante</span><span class="info-value">${esc(data.fabricanteNombre || '—')}</span></div>
      <div class="info-divider"></div>
      <div class="info-item"><span class="info-label">Proveedor</span><span class="info-value">${esc(data.proveedorNombre || '—')}</span></div>
      <div class="info-divider"></div>
      <div class="info-item"><span class="info-label">Estado</span><span class="info-value">${badge(data.estadoFlujo || 'pendiente')}</span></div>
    </div>
  `;
}

function renderWorkflowBar(estado) {
  const steps = [
    { key:'pendiente',   label:'1. Creado' },
    { key:'en-proceso',  label:'2. Lista lista' },
    { key:'aprobado',    label:'3. Aprobado ✓' },
    { key:'en-entrega',  label:'4. En entrega' },
    { key:'completado',  label:'5. Completado' }
  ];
  const idx = steps.findIndex(s => s.key === estado);
  const cont = document.getElementById('wfBarContainer');
  cont.innerHTML = `
    <div class="workflow-bar">
      ${steps.map((s,i) => `<div class="wf-step ${i < idx ? 'done' : ''} ${i === idx ? 'current' : ''}">${s.label}</div>`).join('')}
    </div>
  `;
}

function renderProjectActions(data) {
  const zone  = document.getElementById('projectDetailActions');
  zone.innerHTML = '';
  const estado = data.estadoFlujo || 'pendiente';

  if (session.role === 'fabricante' && estado === 'pendiente') {
    const btn = makeBtn('btn-approve', 'Enviar lista al Admin ✓', () => cambiarEstado('en-proceso'));
    zone.appendChild(btn);
  }
  if (session.role === 'admin' && estado === 'en-proceso') {
    const btn = makeBtn('btn-approve', '✓ Aprobar — Luz verde al proveedor', () => cambiarEstado('aprobado'));
    zone.appendChild(btn);
  }
  if (session.role === 'admin' && estado === 'aprobado') {
    const btn = makeBtn('btn-approve', '📦 Marcar en entrega', () => cambiarEstado('en-entrega'));
    zone.appendChild(btn);
  }
  if (session.role === 'admin' && estado === 'en-entrega') {
    const btn = makeBtn('btn-approve', '✅ Marcar completado', () => cambiarEstado('completado'));
    zone.appendChild(btn);
  }
}

async function cambiarEstado(nuevoEstado) {
  if (!currentProject) return;
  try {
    await updateDoc(doc(db, 'projects', currentProject.id), { estadoFlujo: nuevoEstado });
    currentProject.data.estadoFlujo = nuevoEstado;
    renderInfoBar(currentProject.data);
    renderWorkflowBar(nuevoEstado);
    renderProjectActions(currentProject.data);
    // Ocultar zona agregar si ya fue aprobado
    const canAdd = session.role === 'admin' ||
      (session.role === 'fabricante' && ['pendiente','en-proceso'].includes(nuevoEstado));
    document.getElementById('fabricanteAddZone').style.display = canAdd ? 'block' : 'none';
  } catch(e) { alert('Error: ' + e.message); }
}

// ── AGREGAR MATERIALES (entrada rápida por filas) ─────
function setupAddMaterialZone(projectId) {
  // Toggle abrir/cerrar
  const toggle  = document.getElementById('toggleMatForm');
  const content = document.getElementById('matFormContent');
  const icon    = document.getElementById('toggleMatIcon');

  toggle.onclick = () => {
    const open = content.style.display !== 'none';
    content.style.display = open ? 'none' : 'block';
    icon.classList.toggle('open', !open);
    document.getElementById('toggleMatForm').querySelector('.toggle-hint').textContent =
      open ? 'Clic para abrir' : 'Clic para cerrar';
    if (!open && document.getElementById('quickEntryRows').children.length === 0) addRow();
  };

  // Búsqueda catálogo
  const searchInput = document.getElementById('catalogSearch');
  const dropdown    = document.getElementById('searchDropdown');

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    dropdown.innerHTML = '';
    if (q.length < 2) { dropdown.classList.add('hidden'); return; }
    const matches = allCatalog.filter(c =>
      (c.nombre + ' ' + c.color + ' ' + c.familia).toLowerCase().includes(q)
    ).slice(0, 10);
    if (!matches.length) { dropdown.classList.add('hidden'); return; }
    dropdown.classList.remove('hidden');
    matches.forEach(c => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `<div class="si-name">${esc(c.nombre)} — ${esc(c.color)}</div><div class="si-sub">${esc(c.familia)} | ${esc(c.medida)} | $${fmt(c.precio)}</div>`;
      item.onclick = () => {
        // Agrega una fila pre-llenada
        addRow(c);
        dropdown.classList.add('hidden');
        searchInput.value = '';
      };
      dropdown.appendChild(item);
    });
  };
  document.addEventListener('click', e => { if (!e.target.closest('.search-wrapper')) dropdown.classList.add('hidden'); });

  document.getElementById('btnAddRow').onclick = () => addRow();
  document.getElementById('btnClearAllRows').onclick = () => {
    document.getElementById('quickEntryRows').innerHTML = '';
    addRow();
  };
  document.getElementById('btnSaveAllMaterials').onclick = () => saveAllMaterials(projectId);
}

function addRow(prefill = null) {
  const container = document.getElementById('quickEntryRows');
  const row = document.createElement('div');
  row.className = 'quick-entry-row';
  row.innerHTML = `
    <input type="text"   class="r-nombre"   placeholder="Material / nombre" value="${esc(prefill?.nombre || '')}"/>
    <input type="text"   class="r-familia"  placeholder="Familia"           value="${esc(prefill?.familia || '')}"/>
    <input type="text"   class="r-color"    placeholder="Color / desc."     value="${esc(prefill?.color || '')}"/>
    <input type="text"   class="r-medida"   placeholder="Medida"            value="${esc(prefill?.medida || '')}"/>
    <input type="number" class="r-cantidad" placeholder="Cant." min="1" value=""/>
    <input type="date"   class="r-fecha"    value=""/>
    <input type="text"   class="r-obs"      placeholder="Observación"/>
    <button class="btn-del-row" title="Eliminar fila">✕</button>
  `;
  row.querySelector('.btn-del-row').onclick = () => row.remove();
  container.appendChild(row);
}

async function saveAllMaterials(projectId) {
  const rows    = document.querySelectorAll('.quick-entry-row');
  const errEl   = document.getElementById('matError');
  const okEl    = document.getElementById('matOk');
  errEl.textContent = '';
  okEl.textContent  = '';

  const items = [];
  let hasError = false;

  rows.forEach((row, i) => {
    const nombre   = row.querySelector('.r-nombre').value.trim();
    const familia  = row.querySelector('.r-familia').value.trim();
    const color    = row.querySelector('.r-color').value.trim();
    const medida   = row.querySelector('.r-medida').value.trim();
    const cantidad = parseInt(row.querySelector('.r-cantidad').value) || 0;
    const fecha    = row.querySelector('.r-fecha').value || null;
    const obs      = row.querySelector('.r-obs').value.trim();

    if (!nombre) { errEl.textContent = `Fila ${i+1}: el nombre del material es requerido.`; hasError = true; return; }
    if (cantidad <= 0) { errEl.textContent = `Fila ${i+1} (${nombre}): la cantidad debe ser mayor a 0.`; hasError = true; return; }

    items.push({ nombre, familia, color, medida, cantidad, fechaEsperada: fecha, observaciones: obs });
  });

  if (hasError || !items.length) {
    if (!items.length && !hasError) errEl.textContent = 'Agrega al menos un material.';
    return;
  }

  try {
    const batch = writeBatch(db);
    items.forEach(item => {
      const ref = doc(collection(db, 'projects', projectId, 'materiales'));
      batch.set(ref, { ...item, entregado: 0, status: 'pendiente', createdAt: serverTimestamp() });
    });
    await batch.commit();

    okEl.textContent = `✓ ${items.length} material(es) guardado(s).`;
    document.getElementById('quickEntryRows').innerHTML = '';
    addRow();
    await loadMateriales(projectId, currentProject.data);
  } catch(e) { errEl.textContent = 'Error al guardar: ' + e.message; console.error(e); }
}

// ── TABLA MATERIALES ──────────────────────────────────
async function loadMateriales(projectId, projectData) {
  const estado   = projectData.estadoFlujo || 'pendiente';
  const isProve  = session.role === 'proveedor';

  document.getElementById('tableProveedorWrap').style.display = isProve ? 'block' : 'none';
  document.getElementById('tableAdminWrap').style.display     = isProve ? 'none'  : 'block';

  const tbody = document.getElementById(isProve ? 'matBodyProveedor' : 'matBodyAdmin');
  tbody.innerHTML = '<tr><td colspan="12" class="loading-state">Cargando...</td></tr>';

  try {
    const snap = await getDocs(collection(db, 'projects', projectId, 'materiales'));
    tbody.innerHTML = '';

    if (snap.empty) {
      tbody.innerHTML = `<tr><td colspan="12" class="empty-row">Sin materiales aún.</td></tr>`;
      updateResumen([]);
      return;
    }

    const mats = [];
    snap.forEach(s => mats.push({ id: s.id, ...s.data() }));
    mats.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));

    // Puede el proveedor editar entregado?
    const canEditEntrega = session.role === 'proveedor' && ['aprobado','en-entrega'].includes(estado)
      || session.role === 'admin';
    const canDelete = session.role === 'admin';

    mats.forEach(m => {
      const faltante = Math.max(0, (m.cantidad || 0) - (m.entregado || 0));
      const tr = document.createElement('tr');

      if (isProve) {
        // Vista proveedor — sin precios
        tr.innerHTML = `
          <td><div class="td-mat">${esc(m.nombre || '—')}</div></td>
          <td>${esc(m.color || '—')}</td>
          <td>${esc(m.medida || '—')}</td>
          <td class="num">${m.cantidad || 0}</td>
          <td class="num">${canEditEntrega
            ? `<input class="entregado-input" type="number" min="0" max="${m.cantidad}" value="${m.entregado || 0}" data-id="${m.id}"/>`
            : (m.entregado || 0)}</td>
          <td class="num"><span class="faltante-cell ${faltante === 0 ? 'zero' : 'positive'}">${faltante === 0 ? '✓ Completo' : faltante}</span></td>
          <td>${m.fechaEsperada ? fmtDate(m.fechaEsperada) : '—'}</td>
          <td>${canEditEntrega
            ? `<select class="status-select" data-id="${m.id}">${statusOptions(m.status)}</select>`
            : badge(m.status || 'pendiente')}</td>
          <td>${esc(m.observaciones || '')}</td>
        `;
      } else {
        // Vista admin / fabricante — con precios
        tr.innerHTML = `
          <td><div class="td-mat">${esc(m.nombre || '—')}</div><div class="td-sub">${esc(m.familia || '')}</div></td>
          <td>${esc(m.familia || '—')}</td>
          <td>${esc(m.color || '—')}</td>
          <td>${esc(m.medida || '—')}</td>
          <td class="num">${m.precio ? '$' + fmt(m.precio) : '—'}</td>
          <td class="num">${m.cantidad || 0}</td>
          <td class="num">${canEditEntrega
            ? `<input class="entregado-input" type="number" min="0" max="${m.cantidad}" value="${m.entregado || 0}" data-id="${m.id}"/>`
            : (m.entregado || 0)}</td>
          <td class="num"><span class="faltante-cell ${faltante === 0 ? 'zero' : 'positive'}">${faltante === 0 ? '✓' : faltante}</span></td>
          <td>${m.fechaEsperada ? fmtDate(m.fechaEsperada) : '—'}</td>
          <td>${canEditEntrega
            ? `<select class="status-select" data-id="${m.id}">${statusOptions(m.status)}</select>`
            : badge(m.status || 'pendiente')}</td>
          <td>${esc(m.observaciones || '')}</td>
          <td>${canDelete ? `<button class="btn-danger btn-sm" data-del="${m.id}">✕</button>` : ''}</td>
        `;
      }

      // Listeners
      tr.querySelector(`[data-id="${m.id}"].entregado-input`)?.addEventListener('change', async e => {
        const val = Math.min(parseInt(e.target.value) || 0, m.cantidad || 0);
        e.target.value = val;
        let newStatus = val === 0 ? 'pendiente' : val >= (m.cantidad || 0) ? 'recibido' : 'parcial';
        await updateDoc(doc(db, 'projects', projectId, 'materiales', m.id), { entregado: val, status: newStatus });
        await loadMateriales(projectId, projectData);
      });

      tr.querySelector(`select[data-id="${m.id}"]`)?.addEventListener('change', async e => {
        await updateDoc(doc(db, 'projects', projectId, 'materiales', m.id), { status: e.target.value });
        await loadMateriales(projectId, projectData);
      });

      tr.querySelector(`[data-del="${m.id}"]`)?.addEventListener('click', async () => {
        if (!confirm(`¿Eliminar "${m.nombre}"?`)) return;
        await deleteDoc(doc(db, 'projects', projectId, 'materiales', m.id));
        await loadMateriales(projectId, projectData);
      });

      tbody.appendChild(tr);
    });

    updateResumen(mats);
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="12" style="color:red;text-align:center">Error: ${e.message}</td></tr>`;
    console.error(e);
  }
}

function statusOptions(current) {
  return ['pendiente','parcial','recibido','faltante']
    .map(s => `<option value="${s}" ${current === s ? 'selected' : ''}>${s}</option>`).join('');
}

function updateResumen(mats) {
  const total    = mats.length;
  const recibido = mats.filter(m => m.status === 'recibido').length;
  const parcial  = mats.filter(m => m.status === 'parcial').length;
  const pendiente= mats.filter(m => m.status === 'pendiente').length;
  const faltante = mats.filter(m => m.status === 'faltante').length;
  const pct      = total ? Math.round((recibido / total) * 100) : 0;

  document.getElementById('resumenChips').innerHTML = `
    <span class="chip">Total: ${total}</span>
    <span class="chip" style="background:#dcfce7;border-color:#a7f3d0;color:#15803d">✓ Recibidos: ${recibido} (${pct}%)</span>
    <span class="chip" style="background:#fffbeb;border-color:#fde68a;color:#b45309">Parcial: ${parcial}</span>
    <span class="chip" style="background:#f1f5f9;border-color:#cbd5e1;color:#475569">Pendiente: ${pendiente}</span>
    ${faltante > 0 ? `<span class="chip" style="background:#fef2f2;border-color:#fca5a5;color:#b91c1c">⚠ Faltante: ${faltante}</span>` : ''}
  `;
}

// ── OBSERVACIONES ─────────────────────────────────────
function renderObservaciones(obs) {
  const list = document.getElementById('obsHistory');
  if (!obs?.length) { list.innerHTML = '<p style="color:var(--muted);font-size:13px;margin-bottom:12px">Sin observaciones.</p>'; return; }
  list.innerHTML = `<div class="obs-list">${obs.map(o => `
    <div class="obs-item">
      <div>${esc(o.texto)}</div>
      <div class="obs-meta">${esc(o.autor)} — ${fmtDateTime(o.fecha)}</div>
    </div>`).join('')}</div>`;
}

function setupObsForm(projectId, projectData) {
  const zone = document.getElementById('addObsZone');
  zone.style.display = session.role !== 'proveedor' ? 'block' : 'none';
  if (session.role === 'proveedor') return;

  document.getElementById('btnAddObs').onclick = async () => {
    const texto = document.getElementById('newObsText').value.trim();
    if (!texto) return;
    const obs = [...(projectData.observaciones || []), { texto, autor: session.userId, fecha: new Date().toISOString() }];
    await updateDoc(doc(db, 'projects', projectId), { observaciones: obs });
    projectData.observaciones = obs;
    currentProject.data.observaciones = obs;
    document.getElementById('newObsText').value = '';
    renderObservaciones(obs);
  };
}

// ═══════════════════════════════════════════════════════
//  CATÁLOGO
// ═══════════════════════════════════════════════════════
async function loadCatalogMemory() {
  try {
    const snap = await getDocs(collection(db, 'catalog'));
    const list = [];
    snap.forEach(s => list.push({ id: s.id, ...s.data() }));
    return list.length ? list : CATALOG_DATA;
  } catch(e) { return CATALOG_DATA; }
}

async function loadCatalogView() {
  allCatalog = await loadCatalogMemory();
  renderCatalogList(allCatalog);

  document.getElementById('catalogFilter').oninput = e => {
    const q = e.target.value.toLowerCase();
    renderCatalogList(allCatalog.filter(c => (c.nombre + c.color + c.familia + c.medida).toLowerCase().includes(q)));
  };

  document.getElementById('btnAddCatalog').onclick = async () => {
    const familia  = document.getElementById('cFamilia').value.trim();
    const nombre   = document.getElementById('cNombre').value.trim();
    const color    = document.getElementById('cColor').value.trim();
    const medida   = document.getElementById('cMedida').value.trim();
    const proveedor= document.getElementById('cProveedorField').value.trim();
    const precio   = parseFloat(document.getElementById('cPrecio').value) || 0;
    const errEl    = document.getElementById('catalogError');
    const okEl     = document.getElementById('catalogOk');
    errEl.textContent = ''; okEl.textContent = '';
    if (!nombre) { errEl.textContent = 'El nombre es requerido.'; return; }
    try {
      await addDoc(collection(db, 'catalog'), { familia, nombre, color, medida, proveedor, precio, createdAt: serverTimestamp() });
      okEl.textContent = `✓ "${nombre}" agregado.`;
      ['cFamilia','cNombre','cColor','cMedida','cProveedorField','cPrecio'].forEach(id => document.getElementById(id).value = '');
      allCatalog = await loadCatalogMemory();
      renderCatalogList(allCatalog);
    } catch(e) { errEl.textContent = 'Error: ' + e.message; }
  };
}

function renderCatalogList(items) {
  const cont = document.getElementById('catalogListContainer');
  if (!items.length) { cont.innerHTML = '<div class="loading-state">Sin resultados.</div>'; return; }
  cont.innerHTML = items.map(c => `
    <div class="catalog-item">
      <div class="ci-main">
        <div class="ci-name">${esc(c.nombre)} — ${esc(c.color || '')}</div>
        <div class="ci-sub">${esc(c.familia || '')} | ${esc(c.medida || '')} | ${esc(c.proveedor || '')}</div>
      </div>
      <div class="ci-price">$${fmt(c.precio || 0)}</div>
      <button class="btn-danger btn-sm" data-del-cat="${c.id}">✕</button>
    </div>
  `).join('');
  cont.querySelectorAll('[data-del-cat]').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('¿Eliminar del catálogo?')) return;
      await deleteDoc(doc(db, 'catalog', btn.dataset.delCat));
      allCatalog = await loadCatalogMemory();
      renderCatalogList(allCatalog);
    };
  });
}

// ═══════════════════════════════════════════════════════
//  USUARIOS
// ═══════════════════════════════════════════════════════
async function loadUsers() {
  const cont = document.getElementById('usersListContainer');
  cont.innerHTML = '<div class="loading-state">Cargando...</div>';
  try {
    const snap = await getDocs(collection(db, 'users'));
    allUsers = [];
    snap.forEach(s => allUsers.push({ id: s.id, ...s.data() }));
    renderUsersList();
  } catch(e) { cont.innerHTML = `<div class="loading-state" style="color:red">${e.message}</div>`; }

  // Reset form
  editingUserId = null;
  document.getElementById('userFormTitle').textContent = 'Crear usuario';
  document.getElementById('btnSaveUser').textContent   = 'Crear usuario';
  document.getElementById('btnCancelEdit').classList.add('hidden');
  document.getElementById('uNombre').value = '';
  document.getElementById('uId').value     = '';
  document.getElementById('uPass').value   = '';

  document.getElementById('btnSaveUser').onclick = saveUser;
  document.getElementById('btnCancelEdit').onclick = () => loadUsers();
}

async function saveUser() {
  const nombre = document.getElementById('uNombre').value.trim();
  const id     = document.getElementById('uId').value.trim().toUpperCase();
  const pass   = document.getElementById('uPass').value.trim();
  const role   = document.getElementById('uRole').value;
  const errEl  = document.getElementById('userError');
  const okEl   = document.getElementById('userOk');
  errEl.textContent = ''; okEl.textContent = '';

  if (!nombre) { errEl.textContent = 'El nombre es requerido.'; return; }
  if (!editingUserId && !id) { errEl.textContent = 'El ID de usuario es requerido.'; return; }
  if (!editingUserId && !pass) { errEl.textContent = 'La contraseña es requerida.'; return; }
  if (pass && pass.length < 4) { errEl.textContent = 'Contraseña muy corta (mín 4 caracteres).'; return; }

  try {
    const uid = editingUserId || id;
    const data = { nombre, role };
    if (pass) data.password = pass;
    if (!editingUserId) data.status = 'activo';
    await setDoc(doc(db, 'users', uid), data, { merge: true });
    okEl.textContent = editingUserId ? `✓ Usuario ${uid} actualizado.` : `✓ Usuario ${uid} creado.`;
    await loadUsers();
  } catch(e) { errEl.textContent = 'Error: ' + e.message; }
}

function renderUsersList() {
  const cont = document.getElementById('usersListContainer');
  if (!allUsers.length) { cont.innerHTML = '<div class="loading-state">Sin usuarios.</div>'; return; }

  cont.innerHTML = allUsers.map(u => `
    <div class="user-card">
      <div class="user-card-name">${esc(u.nombre || u.id)}</div>
      <div class="user-card-rol">${esc(u.role)}</div>
      <div class="user-card-creds">Usuario: ${esc(u.id)} &nbsp;|&nbsp; Contraseña: ${esc(u.password || '••••')}</div>
      <div class="user-card-actions">
        <span class="${u.status === 'activo' ? 'badge badge-activo' : 'badge badge-inactivo'}">${u.status}</span>
        <button class="btn-ghost btn-sm" data-toggle="${u.id}" data-status="${u.status}">
          ${u.status === 'activo' ? 'Desactivar' : 'Activar'}
        </button>
        <button class="btn-ghost btn-sm" data-edit="${u.id}">✏️ Editar</button>
        ${u.id !== session.userId ? `<button class="btn-danger btn-sm" data-del-user="${u.id}">Eliminar</button>` : ''}
      </div>
    </div>
  `).join('');

  cont.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.onclick = async () => {
      const ns = btn.dataset.status === 'activo' ? 'inactivo' : 'activo';
      await updateDoc(doc(db, 'users', btn.dataset.toggle), { status: ns });
      await loadUsers();
    };
  });

  cont.querySelectorAll('[data-edit]').forEach(btn => {
    btn.onclick = () => {
      const u = allUsers.find(x => x.id === btn.dataset.edit);
      if (!u) return;
      editingUserId = u.id;
      document.getElementById('userFormTitle').textContent = `Editar: ${u.nombre || u.id}`;
      document.getElementById('btnSaveUser').textContent   = 'Guardar cambios';
      document.getElementById('btnCancelEdit').classList.remove('hidden');
      document.getElementById('uNombre').value = u.nombre || '';
      document.getElementById('uId').value     = u.id;
      document.getElementById('uPass').value   = '';
      document.getElementById('uRole').value   = u.role;
      // Scroll al form
      document.getElementById('userFormCard').scrollIntoView({ behavior: 'smooth' });
    };
  });

  cont.querySelectorAll('[data-del-user]').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm(`¿Eliminar usuario ${btn.dataset.delUser}?`)) return;
      await deleteDoc(doc(db, 'users', btn.dataset.delUser));
      await loadUsers();
    };
  });
}

// ═══════════════════════════════════════════════════════
//  SEED
// ═══════════════════════════════════════════════════════
async function seedDefaultUsers() {
  const defaults = [
    { id:'ADMIN01',      password:'Hilario123',    role:'admin',      nombre:'Administrador', status:'activo' },
    { id:'FABRICANTE01', password:'Fabricante123', role:'fabricante', nombre:'Fabricante 01', status:'activo' },
    { id:'PROVEEDOR01',  password:'Proveedor123',  role:'proveedor',  nombre:'Proveedor 01',  status:'activo' },
  ];
  for (const u of defaults) {
    const snap = await getDoc(doc(db, 'users', u.id));
    if (!snap.exists()) await setDoc(doc(db, 'users', u.id), u);
  }
}

async function seedCatalogIfEmpty() {
  try {
    const snap = await getDocs(query(collection(db, 'catalog'), limit(1)));
    if (!snap.empty) return;
    const batch = writeBatch(db);
    CATALOG_DATA.forEach((item, i) => {
      batch.set(doc(db, 'catalog', String(i+1).padStart(4,'0')), { ...item, createdAt: serverTimestamp() });
    });
    await batch.commit();
  } catch(e) { console.error('seedCatalog:', e); }
}

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmt(n) { return Number(n).toLocaleString('es-MX', { minimumFractionDigits:0, maximumFractionDigits:2 }); }
function fmtDate(str) {
  if (!str) return '—';
  const [y,m,d] = str.split('-');
  return `${d}/${m}/${y}`;
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('es-MX')} ${d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}`;
}
function badge(estado) {
  const map = { pendiente:'badge-pendiente', 'en-proceso':'badge-en-proceso', aprobado:'badge-aprobado', 'en-entrega':'badge-en-entrega', completado:'badge-completado', parcial:'badge-parcial', recibido:'badge-recibido', faltante:'badge-faltante', activo:'badge-activo', inactivo:'badge-inactivo' };
  return `<span class="badge ${map[estado]||'badge-pendiente'}">${esc(estado)}</span>`;
}
function makeBtn(cls, text, fn) {
  const b = document.createElement('button');
  b.className = cls; b.textContent = text; b.onclick = fn;
  return b;
}
