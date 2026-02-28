import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp
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
const db = getFirestore(app);

let currentUser = null;
let currentRole = null;

// ================= LOGIN =================
window.login = async function () {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;

  const ref = doc(db, "users", user);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    document.getElementById("loginError").innerText = "Usuario no existe";
    return;
  }

  const data = snap.data();
  if (!data.activo || data.password !== pass) {
    document.getElementById("loginError").innerText = "Password incorrecto";
    return;
  }

  currentUser = user;
  currentRole = data.role;

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("adminPanel").classList.remove("hidden");

  await loadUsers();
  await loadUsersDropdowns();
  await loadProjects();
};

window.logout = function () {
  location.reload();
};

// ================= USUARIOS =================
window.createUser = async function () {
  const user = document.getElementById("newUser").value.trim();
  const pass = document.getElementById("newPass").value.trim();
  const role = document.getElementById("newRole").value;

  if (!user || !pass) return;

  await setDoc(doc(db, "users", user), {
    password: pass,
    role,
    activo: true,
    createdAt: serverTimestamp()
  });

  document.getElementById("newUser").value = "";
  document.getElementById("newPass").value = "";

  await loadUsers();
  await loadUsersDropdowns();
};

async function loadUsers() {
  const snap = await getDocs(collection(db, "users"));
  let html = "";
  snap.forEach(d => {
    const u = d.data();
    html += `<div class="small">${d.id} (${u.role}) - ${u.activo ? "Activo" : "Inactivo"}</div>`;
  });
  document.getElementById("userList").innerHTML = html || "<div class='small'>Sin usuarios</div>";
}

async function loadUsersDropdowns() {
  const snap = await getDocs(collection(db, "users"));
  const fabricantes = [];
  const proveedores = [];

  snap.forEach(d => {
    const u = d.data();
    if (!u.activo) return;
    if (u.role === "fabricante") fabricantes.push(d.id);
    if (u.role === "proveedor") proveedores.push(d.id);
  });

  const fabSel = document.getElementById("projectFabricante");
  const provSel = document.getElementById("projectProveedor");

  fabSel.innerHTML = `<option value="">Asignar Fabricante</option>` +
    fabricantes.map(x => `<option value="${x}">${x}</option>`).join("");

  provSel.innerHTML = `<option value="">Asignar Proveedor</option>` +
    proveedores.map(x => `<option value="${x}">${x}</option>`).join("");
}

// ================= PROYECTOS =================
window.createProject = async function () {
  const name = document.getElementById("projectName").value.trim();
  const dueDate = document.getElementById("projectDate").value;
  const fabricante = document.getElementById("projectFabricante").value;
  const proveedor = document.getElementById("projectProveedor").value;

  if (!name || !dueDate) return;

  await addDoc(collection(db, "projects"), {
    name,
    dueDate,
    status: "abierto",
    fabricante: fabricante || "",
    proveedor: proveedor || "",
    createdAt: serverTimestamp()
  });

  document.getElementById("projectName").value = "";
  document.getElementById("projectDate").value = "";
  document.getElementById("projectFabricante").value = "";
  document.getElementById("projectProveedor").value = "";

  await loadProjects();
};

async function loadProjects() {
  const snap = await getDocs(collection(db, "projects"));
  const today = new Date().toISOString().split("T")[0];

  let html = "";
  for (const d of snap.docs) {
    const p = d.data();
    let estado = p.status;

    if (estado === "abierto" && p.dueDate && p.dueDate < today) estado = "retrasado";

    const fab = p.fabricante ? `Fabricante: <b>${p.fabricante}</b>` : "Fabricante: -";
    const prov = p.proveedor ? `Proveedor: <b>${p.proveedor}</b>` : "Proveedor: -";

    // cargar pedidos (fabricante y admin) para mostrar resumen rápido
    const pfRef = doc(db, "projects", d.id, "pedido_fabricante", "data");
    const paRef = doc(db, "projects", d.id, "pedido_admin", "data");
    const pfSnap = await getDoc(pfRef);
    const paSnap = await getDoc(paRef);

    const pfCount = pfSnap.exists() ? (pfSnap.data().linesCount || 0) : 0;
    const paCount = paSnap.exists() ? (paSnap.data().linesCount || 0) : 0;

    html += `
      <div class="item">
        <div>
          <b>${p.name}</b>
          <span class="badge">${estado}</span>
        </div>
        <div class="small">Entrega: ${p.dueDate || "-"}</div>
        <div class="small">${fab} | ${prov}</div>
        <div class="small">Pedido fabricante: <b>${pfCount}</b> líneas | Pedido admin: <b>${paCount}</b> líneas</div>

        <hr />

        <div class="small"><b>Pedido Fabricante (pegar lista)</b></div>
        <textarea id="pf-${d.id}" placeholder="cantidad | material | color | notas"></textarea>
        <button onclick="savePedido('${d.id}', 'fabricante')">Guardar Pedido Fabricante</button>

        <div class="small" style="margin-top:10px;"><b>Pedido Admin (pegar lista)</b></div>
        <textarea id="pa-${d.id}" placeholder="cantidad | material | color | notas"></textarea>
        <button onclick="savePedido('${d.id}', 'admin')">Guardar Pedido Admin</button>

        <hr />

        <button onclick="closeProject('${d.id}')">Cerrar</button>
        <button class="secondary" onclick="deleteProject('${d.id}')">Eliminar</button>
      </div>
    `;
  }

  document.getElementById("projectList").innerHTML = html || "<div class='small'>Sin proyectos</div>";
}

window.closeProject = async function (id) {
  await updateDoc(doc(db, "projects", id), { status: "cerrado" });
  await loadProjects();
};

window.deleteProject = async function (id) {
  await deleteDoc(doc(db, "projects", id));
  await loadProjects();
};

// ================= PEDIDOS (EN BLOQUE) =================
// Formato: cantidad | material | color | notas
function parseLines(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const parsed = [];

  for (const line of lines) {
    const parts = line.split("|").map(x => x.trim());
    const qty = parts[0] || "";
    const material = parts[1] || "";
    const color = parts[2] || "";
    const notas = parts[3] || "";

    if (!qty || !material) continue;

    parsed.push({ qty, material, color, notas });
  }
  return parsed;
}

window.savePedido = async function (projectId, tipo) {
  const textareaId = tipo === "fabricante" ? `pf-${projectId}` : `pa-${projectId}`;
  const text = document.getElementById(textareaId).value;

  const items = parseLines(text);

  const sub = tipo === "fabricante" ? "pedido_fabricante" : "pedido_admin";
  await setDoc(doc(db, "projects", projectId, sub, "data"), {
    rawText: text,
    linesCount: items.length,
    items,
    updatedAt: serverTimestamp(),
    updatedBy: currentUser || ""
  });

  await loadProjects();
};