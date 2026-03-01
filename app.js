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

// ================= LOGIN =================

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

  if (data.status !== "activo") {
    document.getElementById("loginError").innerText = "Usuario inactivo";
    return;
  }

  currentUser = { username: user, role: data.role };

  document.getElementById("loginCard").classList.add("hidden");
  document.getElementById("appCard").classList.remove("hidden");
  document.getElementById("userMeta").innerText =
    "Usuario: " + user + " | Rol: " + data.role;

  loadProjects();
});

// ================= PROYECTOS =================

function loadProjects() {
  const q =
    currentUser.role === "admin"
      ? query(collection(db, "projects"), orderBy("name"))
      : query(
          collection(db, "projects"),
          where(
            currentUser.role === "fabricante"
              ? "fabricante"
              : "proveedor",
            "==",
            currentUser.username
          )
        );

  onSnapshot(q, snap => {
    const container =
      currentUser.role === "admin"
        ? document.getElementById("projectsList")
        : document.getElementById("projectsList2");

    container.innerHTML = "";

    snap.forEach(docSnap => {
      const p = docSnap.data();
      const id = docSnap.id;

      container.innerHTML += `
        <div class="item">
          <h4>${p.name}</h4>
          <div>Entrega: ${p.entrega}</div>
          <div>Fabricante: ${p.fabricante}</div>
          <div>Proveedor: ${p.proveedor}</div>

          <div style="margin-top:10px;">
            <select id="catalog_${id}">
              <option value="">Selecciona del catálogo</option>
            </select>

            <input id="manual_${id}" placeholder="Si no está, escribe material">
            <input id="cant_${id}" type="number" placeholder="Cant.">
            <button onclick="addMaterial('${id}')">Agregar</button>
          </div>

          <div id="materials_${id}" style="margin-top:10px;"></div>
        </div>
      `;

      loadCatalogSelect(id);
      loadMaterials(id);
    });
  });
}

// ================= CARGAR CATALOGO EN SELECT =================

async function loadCatalogSelect(projectId) {
  const select = document.getElementById("catalog_" + projectId);
  select.innerHTML =
    '<option value="">Selecciona del catálogo</option>';

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

// ================= AGREGAR MATERIAL =================

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

// ================= LISTAR MATERIALES =================

function loadMaterials(projectId) {
  onSnapshot(
    collection(db, "projects", projectId, "materials"),
    snap => {
      const container = document.getElementById(
        "materials_" + projectId
      );
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
