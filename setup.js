import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  limit,
  query,
  writeBatch,
  serverTimestamp
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

async function createUsers() {
  await setDoc(doc(db, "users", "ADMIN01"), {
    password: "Hilario123",
    role: "admin",
    status: "activo"
  });

  await setDoc(doc(db, "users", "PROVEEDOR01"), {
    password: "Proveedor123",
    role: "proveedor",
    status: "activo"
  });

  await setDoc(doc(db, "users", "FABRICANTE01"), {
    password: "Fabricante123",
    role: "fabricante",
    status: "activo"
  });

  console.log("Usuarios creados");
}

const CATALOGO_BASE = [
  { name: "Melamina 6x8 3/4 Blanco", proveedor: "Cualquiera", fabricante: "Melamina", unidad: "Hoja 6x8", precio: 1550 },
  { name: "Melamina 4x8 3/4 Blanco", proveedor: "Cualquiera", fabricante: "Melamina", unidad: "Hoja 4x8", precio: 1200 },
  { name: "Melamina 4x8 1/4 Blanco", proveedor: "Cualquiera", fabricante: "Melamina", unidad: "Hoja 4x8", precio: 450 },
  { name: "Birch 3/4 4x8", proveedor: "Cualquiera", fabricante: "Plywood", unidad: "Hoja 4x8", precio: 2000 },
  { name: "Birch 1/2 4x8", proveedor: "Cualquiera", fabricante: "Plywood", unidad: "Hoja 4x8", precio: 1600 },
  { name: "Birch 1/4 4x8", proveedor: "Cualquiera", fabricante: "Plywood", unidad: "Hoja 4x8", precio: 850 },
  { name: "Corredera 45cm", proveedor: "Cualquiera", fabricante: "Herrajes", unidad: "Pieza", precio: 180 },
  { name: "Bisagra cierre suave", proveedor: "Cualquiera", fabricante: "Herrajes", unidad: "Pieza", precio: 35 },
  { name: "Jaladera base", proveedor: "Cualquiera", fabricante: "Herrajes", unidad: "Pieza", precio: 60 },
  { name: "Canto PVC Blanco", proveedor: "Cualquiera", fabricante: "Consumibles", unidad: "Metro", precio: 6 },
  { name: "Tornillo caja", proveedor: "Cualquiera", fabricante: "Consumibles", unidad: "Caja", precio: 95 }
];

async function seedCatalogIfEmpty() {
  const colRef = collection(db, "catalog");
  const snap = await getDocs(query(colRef, limit(1)));

  if (!snap.empty) {
    console.log("Catálogo ya existe");
    return;
  }

  const batch = writeBatch(db);

  CATALOGO_BASE.forEach((item, i) => {
    const ref = doc(db, "catalog", String(i + 1));
    batch.set(ref, {
      ...item,
      createdAt: serverTimestamp()
    });
  });

  await batch.commit();
  console.log("Catálogo precargado");
}

async function initSetup() {
  await createUsers();
  await seedCatalogIfEmpty();
}

initSetup();
  console.log("Usuarios creados automáticamente");
}


createUsers();
