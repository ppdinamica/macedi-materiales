import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./firebase-config.js";

const db = getFirestore(app);

const projectsContainer = document.getElementById("projectsList");
const createProjectBtn = document.getElementById("createProjectBtn");


/* ============================
   CREAR PROYECTO
============================ */

createProjectBtn.addEventListener("click", async ()=>{

  const name = document.getElementById("projectName").value.trim();
  const date = document.getElementById("projectDate").value;

  if(!name) return alert("Nombre requerido");

  await setDoc(doc(collection(db,"projects")),{
    name,
    date,
    materiales:[],
    createdAt: new Date()
  });

  document.getElementById("projectName").value="";
  loadProjects();
});


/* ============================
   LISTAR PROYECTOS
============================ */

async function loadProjects(){

  projectsContainer.innerHTML="";

  const snap = await getDocs(collection(db,"projects"));

  snap.forEach((s)=>{

    const d = s.data();

    const item = document.createElement("div");
    item.className="item";
    item.style.cursor="pointer";

    item.innerHTML=`
      <div><b>${d.name}</b></div>
      <div>Entrega: ${d.date || "-"}</div>
    `;

    item.addEventListener("click",()=>{
      openProjectDetail(s.id);
    });

    projectsContainer.appendChild(item);

  });

}

loadProjects();



/* ============================
   DETALLE PROYECTO
============================ */

async function openProjectDetail(projectId){

  const snap = await getDoc(doc(db,"projects",projectId));
  if(!snap.exists()) return;

  const data = snap.data();

  // Eliminar detalle anterior
  const oldDetail = document.getElementById("projectDetail");
  if(oldDetail) oldDetail.remove();

  const container = document.createElement("div");
  container.className="card";
  container.id="projectDetail";
  container.style.marginTop="20px";

  const materiales = Array.isArray(data.materiales) ? data.materiales : [];

  container.innerHTML=`
    <h3>Proyecto: ${data.name}</h3>
    <p>Entrega: ${data.date || "-"}</p>

    <hr/>

    <h4>Materiales</h4>
    <div id="materialsList"></div>

    <hr/>

    <h4>Agregar material</h4>
    <input id="newMatName" placeholder="Material" />
    <input id="newMatQty" placeholder="Cantidad" />
    <button id="addMaterialBtn">Agregar</button>
  `;

  projectsContainer.parentNode.appendChild(container);

  const matList = container.querySelector("#materialsList");

  function renderMaterials(){
    matList.innerHTML="";
    materiales.forEach((m)=>{
      const div = document.createElement("div");
      div.className="item";
      div.innerHTML=`
        <b>${m.material}</b> - Cantidad: ${m.cantidad || "-"} - Estado: ${m.status || "pendiente"}
      `;
      matList.appendChild(div);
    });
  }

  renderMaterials();

  container.querySelector("#addMaterialBtn")
    .addEventListener("click", async ()=>{

      const name = container.querySelector("#newMatName").value.trim();
      const qty = container.querySelector("#newMatQty").value.trim();

      if(!name) return;

      materiales.push({
        material: name,
        cantidad: qty ? Number(qty) : null,
        status: "pendiente"
      });

      await setDoc(doc(db,"projects",projectId),{
        materiales
      },{ merge:true });

      container.querySelector("#newMatName").value="";
      container.querySelector("#newMatQty").value="";

      renderMaterials();
  });

}
