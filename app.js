import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser = null;

/* ================= LOGIN ================= */

document.getElementById("btnLogin").addEventListener("click", async () => {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  const snap = await getDoc(doc(db, "users", user));

  if (!snap.exists()) {
    document.getElementById("loginError").innerText = "Usuario no existe";
    return;
  }

  const data = snap.data();

  if (data.password !== pass) {
    document.getElementById("loginError").innerText = "Password incorrecto";
    return;
  }

  if (data.status && data.status !== "activo") {
    document.getElementById("loginError").innerText = "Usuario inactivo";
    return;
  }

  currentUser = { username: user, role: data.role };

  document.getElementById("loginCard").classList.add("hidden");
  document.getElementById("appCard").classList.remove("hidden");
  document.getElementById("userMeta").innerText =
    "Usuario: " + user + " | Rol: " + data.role;

  initTabs();
  loadCatalog();
  loadProjects();
});

/* ================= TABS ================= */

function initTabs() {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".tabpane").forEach(p => p.classList.add("hidden"));
      document.getElementById(btn.dataset.tab).classList.remove("hidden");
    });
  });
}

/* ================= CATALOGO ================= */

document.getElementById("btnAddCatalog").addEventListener("click", async () => {
  const name = document.getElementById("cName").value.trim();
  const proveedor = document.getElementById("cProveedor").value.trim();
  const fabricante = document.getElementById("cFabricante").value.trim();
  const unidad = document.getElementById("cUnidad").value.trim();
  const precio = parseFloat(document.getElementById("cPrecio").value);

  if (!name) return;

  await addDoc(collection(db, "catalog"), {
    name,
    proveedor,
    fabricante,
    unidad,
    precio: precio || 0,
    createdAt: serverTimestamp()
  });

  loadCatalog();
});

async function loadCatalog() {
  const container = document.getElementById("catalogList");
  container.innerHTML = "";

  const snap = await getDocs(collection(db, "catalog"));

  snap.forEach(docSnap => {
    const c = docSnap.data();
    container.innerHTML += `
      <div class="item">
        ${c.name} - $${c.precio}
      </div>
    `;
  });
}

/* ================= PROYECTOS ================= */

function loadProjects() {
  const container = document.getElementById("projectsList");
  container.innerHTML = "";

  onSnapshot(collection(db, "projects"), snap => {
    container.innerHTML = "";

    snap.forEach(docSnap => {
      const p = docSnap.data();
      const id = docSnap.id;

      container.innerHTML += `
        <div class="item">
          <h4>${p.name}</h4>

          <select id="catalog_${id}">
            <option value="">Selecciona del catálogo</option>
          </select>

          <input id="manual_${id}" placeholder="Si no está, escribe material">
          <input id="cant_${id}" type="number" placeholder="Cant.">
          <button onclick="addMaterial('${id}')">Agregar</button>

          <div id="materials_${id}"></div>
        </div>
      `;

      loadCatalogSelect(id);
      loadMaterials(id);
    });
  });
}

async function loadCatalogSelect(projectId) {
  const select = document.getElementById("catalog_" + projectId);
  select.innerHTML = '<option value="">Selecciona del catálogo</option>';

  const snap = await getDocs(collection(db, "catalog"));

  snap.forEach(d => {
    const data = d.data();
    select.innerHTML += `
      <option value="${data.name}|${data.precio}">
        ${data.name} - $${data.precio}
      </option>
    `;
  });
}

window.addMaterial = async function (projectId) {
  const select = document.getElementById("catalog_" + projectId);
  const manual = document.getElementById("manual_" + projectId).value;
  const cant =
    parseFloat(document.getElementById("cant_" + projectId).value) || 1;

  let name = "";
  let price = 0;

  if (select.value) {
    const parts = select.value.split("|");
    name = parts[0];
    price = parseFloat(parts[1]);
  } else if (manual) {
    name = manual;
    price = 0;
  } else {
    return;
  }

  await addDoc(collection(db, "projects", projectId, "materials"), {
    name,
    cantidad: cant,
    precio: price,
    estado: "pendiente",
    createdAt: serverTimestamp()
  });

  document.getElementById("manual_" + projectId).value = "";
  document.getElementById("cant_" + projectId).value = "";
};

function loadMaterials(projectId) {
  onSnapshot(
    collection(db, "projects", projectId, "materials"),
    snap => {
      const container = document.getElementById("materials_" + projectId);
      container.innerHTML = "";

      snap.forEach(docSnap => {
        const m = docSnap.data();
        container.innerHTML += `
          <div>
            ${m.name} | Cant: ${m.cantidad} | $${m.precio}
          </div>
        `;
      });
    }
  );
}

