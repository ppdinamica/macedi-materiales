import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    role: "admin"
  });

  await setDoc(doc(db, "users", "PROVEEDOR01"), {
    password: "Proveedor123",
    role: "proveedor"
  });

  await setDoc(doc(db, "users", "FABRICANTE01"), {
    password: "Fabricante123",
    role: "fabricante"
  });

  console.log("Usuarios creados automáticamente");
}

createUsers();