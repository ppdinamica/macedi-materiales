// ====== CONFIG ======
const API_URL = "https://materiales-status.firebaseio.com"; 
// Si luego quieres conectar Firebase real lo cambiamos.
// Por ahora trabajamos en memoria.

// ====== VARIABLES ======
let currentUser = null;
let users = [
  { user: "ADMIN01", pass: "1234", role: "admin" },
  { user: "Cesar", pass: "1234", role: "admin" }
];

let projects = [];

// ====== LOGIN ======
window.login = function () {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  const found = users.find(u => u.user === user && u.pass === pass);

  if (!found) {
    document.getElementById("loginError").innerText = "Usuario o password incorrecto";
    return;
  }

  currentUser = found;

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("adminPanel").classList.remove("hidden");

  renderProjects();
};

// ====== LOGOUT ======
window.logout = function () {
  currentUser = null;
  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("adminPanel").classList.add("hidden");
};

// ====== CREAR USUARIO ======
window.createUser = function () {
  if (currentUser.role !== "admin") return;

  const newUser = document.getElementById("newUser").value;
  const newPass = document.getElementById("newPass").value;
  const newRole = document.getElementById("newRole").value;

  users.push({ user: newUser, pass: newPass, role: newRole });

  alert("Usuario creado");
};

// ====== CREAR PROYECTO ======
window.createProject = function () {
  if (currentUser.role !== "admin") return;

  const name = prompt("Nombre del proyecto");
  const date = prompt("Fecha entrega (aaaa-mm-dd)");
  const fabricante = prompt("Asignar fabricante (usuario exacto)");

  projects.push({
    id: Date.now(),
    name,
    date,
    fabricante,
    status: "abierto",
    materials: []
  });

  renderProjects();
};

// ====== RENDER PROYECTOS ======
function renderProjects() {
  const container = document.getElementById("userList");
  container.innerHTML = "";

  let filtered = projects;

  if (currentUser.role === "fabricante") {
    filtered = projects.filter(p => p.fabricante === currentUser.user);
  }

  filtered.forEach(p => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.marginTop = "10px";

    div.innerHTML = `
      <strong>${p.name}</strong><br>
      Entrega: ${p.date}<br>
      Estado: ${p.status}<br>
      <button onclick="addMaterial(${p.id})">Agregar Material</button>
      <button onclick="closeProject(${p.id})">Cerrar</button>
      <button onclick="deleteProject(${p.id})">Eliminar</button>
      <div id="mat-${p.id}"></div>
    `;

    container.appendChild(div);

    renderMaterials(p);
  });
}

// ====== AGREGAR MATERIAL ======
window.addMaterial = function (projectId) {
  const name = prompt("Nombre material");
  const proveedor = prompt("Proveedor");
  const cantidad = prompt("Cantidad");

  const project = projects.find(p => p.id === projectId);

  project.materials.push({
    id: Date.now(),
    name,
    proveedor,
    cantidad,
    estado: "pendiente"
  });

  renderProjects();
};

// ====== RENDER MATERIALES ======
function renderMaterials(project) {
  const container = document.getElementById(`mat-${project.id}`);
  container.innerHTML = "";

  project.materials.forEach(m => {
    const div = document.createElement("div");
    div.innerHTML = `
      - ${m.name} (${m.proveedor}) x ${m.cantidad} - ${m.estado}
    `;
    container.appendChild(div);
  });
}

// ====== CERRAR PROYECTO ======
window.closeProject = function (id) {
  const project = projects.find(p => p.id === id);
  project.status = "cerrado";
  renderProjects();
};

// ====== ELIMINAR PROYECTO ======
window.deleteProject = function (id) {
  projects = projects.filter(p => p.id !== id);
  renderProjects();
};