import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, onSnapshot, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentUser = null;

/* LOGIN */
document.getElementById("btnLogin").onclick = async () => {
const user = loginUser.value.trim();
const pass = loginPass.value.trim();

const snap = await getDoc(doc(db,"users",user));

if(!snap.exists()){ loginError.innerText="No existe"; return; }

const data = snap.data();
if(data.password!==pass){ loginError.innerText="Password incorrecto"; return; }

currentUser=user;
loginBox.classList.add("hidden");
appBox.classList.remove("hidden");
userInfo.innerText="Usuario: "+user;

loadProjects();
loadCatalog();
loadUsers();
};

/* LOGOUT */
btnLogout.onclick=()=>location.reload();

/* TABS */
document.querySelectorAll(".tabs button").forEach(btn=>{
btn.onclick=()=>{
document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
document.querySelectorAll(".tab").forEach(t=>t.classList.add("hidden"));
document.getElementById(btn.dataset.tab).classList.remove("hidden");
};
});

/* CATALOG */
btnAddCatalog.onclick=async ()=>{
if(!cName.value)return;
await addDoc(collection(db,"catalog"),{
name:cName.value,
price:parseFloat(cPrice.value)||0,
createdAt:serverTimestamp()
});
cName.value="";
cPrice.value="";
};

function loadCatalog(){
onSnapshot(collection(db,"catalog"),snap=>{
catalogList.innerHTML="";
snap.forEach(d=>{
const c=d.data();
catalogList.innerHTML+=`<div class="card">${c.name} - $${c.price}</div>`;
});
});
}

/* PROJECTS */
btnCreateProject.onclick=async ()=>{
if(!pName.value)return;
await addDoc(collection(db,"projects"),{
name:pName.value,
date:pDate.value,
createdAt:serverTimestamp()
});
pName.value="";
};

function loadProjects(){
onSnapshot(collection(db,"projects"),snap=>{
projectList.innerHTML="";
snap.forEach(d=>{
const p=d.data();
projectList.innerHTML+=`<div class="card">${p.name} - ${p.date}</div>`;
});
});
}

/* USERS */
btnCreateUser.onclick=async ()=>{
await addDoc(collection(db,"users"),{
password:uPass.value,
role:uRole.value,
createdAt:serverTimestamp()
});
};

function loadUsers(){
onSnapshot(collection(db,"users"),snap=>{
userList.innerHTML="";
snap.forEach(d=>{
const u=d.data();
userList.innerHTML+=`<div class="card">${d.id} - ${u.role}</div>`;
});
});
}
