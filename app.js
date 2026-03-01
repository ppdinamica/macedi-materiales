import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const btn = document.getElementById("btnLogin");

btn.addEventListener("click", async () => {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  const snap = await getDoc(doc(db, "users", user));

  if (!snap.exists()) {
    alert("Usuario no existe");
    return;
  }

  const data = snap.data();

  if (data.password !== pass) {
    alert("Password incorrecto");
    return;
  }

  alert("Login correcto");
});
