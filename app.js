import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("btnLogin").addEventListener("click", async () => {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  if (!user || !pass) {
    document.getElementById("loginError").innerText = "Completa usuario y password";
    return;
  }

  try {
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

    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("appCard").classList.remove("hidden");
    document.getElementById("userMeta").innerText =
      "Usuario: " + user + " | Rol: " + data.role;

  } catch (err) {
    console.error(err);
    document.getElementById("loginError").innerText = "Error de conexión";
  }
});
