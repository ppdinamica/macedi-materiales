// ═══════════════════════════════════════════════════════
//  MACEDI — Control de Materiales
//  app.js — Lógica completa de la aplicación
// ═══════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection, doc, setDoc, getDoc, getDocs, addDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── FIREBASE CONFIG ──────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCkRYHgRYTX7m31umvVNH_IDrEepwKIw4I",
  authDomain: "materiales-status.firebaseapp.com",
  projectId: "materiales-status",
  storageBucket: "materiales-status.firebasestorage.app",
  messagingSenderId: "126049792327",
  appId: "1:126049792327:web:01197c9fc37d7e4b6edc62"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);

// ── CATÁLOGO BASE (119 materiales del CSV) ───────────
const CATALOG_DATA = [{"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Roble Provenzal", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Roble Mérida", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Encino Polar", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Cendra Escandinavo", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Aserrado Nórdico", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Nogal Terracota", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Ébano Indi", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Fresno Bruma", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Wengué", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Linosa Ceniza", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Seda Giorno", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Toscana", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Riviera", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Nativa", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Alaska", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Avella", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Cocoa", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Nougat", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Moscato", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Espresso", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Mármara", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Arauco  6x8  de 3/4", "color": "Vizcaya", "medida": "Hoja 6x8", "proveedor": "Cualquiera", "precio": 1550.0}, {"familia": "Melamina", "nombre": "Melamina Blanca aglomerado 5/8", "color": "Blanco", "medida": "Hoja 4x8", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Melamina", "nombre": "Melamina Blanca 2 caras de  1/4 MDF", "color": "Blanco", "medida": "Hoja 1/4", "proveedor": "Cualquiera", "precio": 500.0}, {"familia": "Melamina", "nombre": "MYP", "color": "Cualquier color", "medida": "Hoja 4x8", "proveedor": "Cualquiera", "precio": 1100.0}, {"familia": "Melamina", "nombre": "TJ", "color": "Cualquier color", "medida": "Hoja 4x8", "proveedor": "Cualquiera", "precio": 700.0}, {"familia": "Melamina", "nombre": "Otro", "color": "Cualquier color", "medida": "Hoja 4x8", "proveedor": "Cualquiera", "precio": 700.0}, {"familia": "Melamina", "nombre": "Blanca  Alto Brillo MDF 3/4", "color": "Blanco Alto Brillo", "medida": "Hoja 4x8", "proveedor": "Cualquiera", "precio": 1100.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Roble Provenzal", "medida": "100 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Roble Mérida", "medida": "101 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Encino Polar", "medida": "102 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Cendra Escandinavo", "medida": "103 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Aserrado Nórdico", "medida": "104 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Nogal Terracota", "medida": "105 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Ébano Indi", "medida": "106 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Fresno Bruma", "medida": "107 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Wengué", "medida": "108 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Linosa Ceniza", "medida": "109 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Seda Giorno", "medida": "110 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Toscana", "medida": "111 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Riviera", "medida": "112 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Nativa", "medida": "113 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Alaska", "medida": "114 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Avella", "medida": "115 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Cocoa", "medida": "116 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Nougat", "medida": "117 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Moscato", "medida": "118 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Espresso", "medida": "119 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Mármara", "medida": "120 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa plancha Arauco", "color": "Vizcaya", "medida": "121 mts", "proveedor": "Cualquiera", "precio": 600.0}, {"familia": "Chapacinta", "nombre": "Chapa madera plancha", "color": "Birch", "medida": "122 mts", "proveedor": "Cualquiera", "precio": 1200.0}, {"familia": "Chapacinta", "nombre": "Chapa madera plancha", "color": "Encino", "medida": "123 mts", "proveedor": "Cualquiera", "precio": 1200.0}, {"familia": "Chapacinta", "nombre": "Chapa madera plancha", "color": "Maple", "medida": "124 mts", "proveedor": "Cualquiera", "precio": 1200.0}, {"familia": "Pintura", "nombre": "Poliuretano", "color": "Blanco semi  mate", "medida": "1 litro", "proveedor": "Sayer", "precio": 300.0}, {"familia": "Pintura", "nombre": "Poliuretano", "color": "Fondo blanco", "medida": "1 litro", "proveedor": "Sayer", "precio": 300.0}, {"familia": "Pintura", "nombre": "Poliuretano", "color": "Transp. semi-mate", "medida": "1 litro", "proveedor": "Sayer", "precio": 300.0}, {"familia": "Pintura", "nombre": "Poliuretano", "color": "Transparente", "medida": "1 litro", "proveedor": "Sayer", "precio": 300.0}, {"familia": "Pintura", "nombre": "Kit líquidos (catal, diluy, endure)", "color": "Líquidos", "medida": "1 litro", "proveedor": "Sayer", "precio": 400.0}, {"familia": "Pintura", "nombre": "Poliuretano", "color": "Blanco semi  mate", "medida": "1 Galón", "proveedor": "Sayer", "precio": 1300.0}, {"familia": "Pintura", "nombre": "Poliuretano", "color": "Fondo blanco", "medida": "1 Galón", "proveedor": "Sayer", "precio": 1300.0}, {"familia": "Pintura", "nombre": "Poliuretano", "color": "Transp. semi-mate", "medida": "1 Galón", "proveedor": "Sayer", "precio": 800.0}, {"familia": "Pintura", "nombre": "Poliuretano", "color": "Transparente", "medida": "1 Galón", "proveedor": "Sayer", "precio": 800.0}, {"familia": "Pintura", "nombre": "Kit líquidos (catal, diluy, endure)", "color": "Líquidos", "medida": "1 Galón", "proveedor": "Sayer", "precio": 800.0}, {"familia": "Bisagra", "nombre": "Apertura 110 cierre normal", "color": "Base plana", "medida": "1 par", "proveedor": "Cualquiera", "precio": 25.0}, {"familia": "Bisagra", "nombre": "Apertura 110 cierre normal", "color": "Base avión", "medida": "1 par", "proveedor": "Cualquiera", "precio": 25.0}, {"familia": "Bisagra", "nombre": "Apertura 110 cierre suave", "color": "Base plana", "medida": "1 par", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Bisagra", "nombre": "Apertura 110 cierre  suave", "color": "Base avión", "medida": "1 par", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Bisagra", "nombre": "Apertura 110 cierre suave", "color": "Base plana", "medida": "1 par", "proveedor": "Blum", "precio": 150.0}, {"familia": "Bisagra", "nombre": "Apertura 110 cierre  suave", "color": "Base avión", "medida": "1 par", "proveedor": "Blum", "precio": 150.0}, {"familia": "Bisagra", "nombre": "Kit esquinero", "color": "Base normal", "medida": "1 kit", "proveedor": "Cualquiera", "precio": 150.0}, {"familia": "Bisagra", "nombre": "Kit esquinero", "color": "Base normal", "medida": "1 kit", "proveedor": "Blum", "precio": 215.0}, {"familia": "Bisagra", "nombre": "Pata corta", "color": "Base normal", "medida": "1 par", "proveedor": "Cualquiera", "precio": 35.0}, {"familia": "Pistones", "nombre": "Puerta push open canto", "color": "Blanco", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Pistones", "nombre": "Puerta push open canto", "color": "Negro", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Pistones", "nombre": "Puerta push open canto", "color": "Gris", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Pistones", "nombre": "Puerta push en mueble", "color": "Gris", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Jaladera", "nombre": "Barra 7 pulgadas", "color": "Satinada", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 25.0}, {"familia": "Jaladera", "nombre": "Barra 10 pulgadas", "color": "Satinada", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 25.0}, {"familia": "Jaladera", "nombre": "Forma C delgada 5\"", "color": "Satinada", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 65.0}, {"familia": "Jaladera", "nombre": "Forma C delgada 7\"", "color": "Satinada", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 85.0}, {"familia": "Jaladera", "nombre": "Forma C cuadro 5\"", "color": "Satinada", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 65.0}, {"familia": "Jaladera", "nombre": "Forma C cuadro 7\"", "color": "Satinada", "medida": "1 pz", "proveedor": "Cualquiera", "precio": 85.0}, {"familia": "Riel", "nombre": "Extension cierre normal", "color": "Satinado", "medida": "20\"", "proveedor": "Cualquiera", "precio": 80.0}, {"familia": "Riel", "nombre": "Extension cierre normal", "color": "Satinado", "medida": "18\"", "proveedor": "Cualquiera", "precio": 80.0}, {"familia": "Riel", "nombre": "Extension cierre normal", "color": "Satinado", "medida": "16\"", "proveedor": "Cualquiera", "precio": 80.0}, {"familia": "Riel", "nombre": "Extension cierre normal", "color": "Satinado", "medida": "14\"", "proveedor": "Cualquiera", "precio": 80.0}, {"familia": "Riel", "nombre": "Extension cierre normal", "color": "Satinado", "medida": "12\"", "proveedor": "Cualquiera", "precio": 80.0}, {"familia": "Riel", "nombre": "Extension cierre lento", "color": "Satinado", "medida": "20\"", "proveedor": "Cualquiera", "precio": 250.0}, {"familia": "Piston", "nombre": "Apertura garaje", "color": "Satinado", "medida": "80 neutros", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Roble Provenzal", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Roble Mérida", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Encino Polar", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Cendra Escandinavo", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Aserrado Nórdico", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Nogal Terracota", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Ébano Indi", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Fresno Bruma", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Wengué", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Linosa Ceniza", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Seda Giorno", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Toscana", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Riviera", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Nativa", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Alaska", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Avella", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Cocoa", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Nougat", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Moscato", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Espresso", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Mármara", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Vizcaya", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Tapones", "nombre": "Calcomanías", "color": "Blanco", "medida": "1 hoja", "proveedor": "Cualquiera", "precio": 50.0}, {"familia": "Ménsula", "nombre": "Paleta 1/4", "color": "Satinada", "medida": "1 bolsa 100 pz", "proveedor": "Cualquiera", "precio": 130.0}, {"familia": "Triplay", "nombre": "Birch 4x8 normal", "color": "Normal", "medida": "1 hoja 4x8", "proveedor": "cualquiera", "precio": 800.0}, {"familia": "Triplay", "nombre": "Birch 4x8 2 caras", "color": "Prefinish", "medida": "1 hoja 4x8", "proveedor": "cualquiera", "precio": 950.0}, {"familia": "Triplay", "nombre": "Birch 4x8 1 cara", "color": "Prefinish", "medida": "1 hoja 4x8", "proveedor": "cualquiera", "precio": 890.0}, {"familia": "Triplay", "nombre": "Birch 4x8 1 cara B", "color": "Prefinish", "medida": "1 hoja 4x8", "proveedor": "cualquiera", "precio": 500.0}, {"familia": "MDF", "nombre": "MDF 4x8 normal", "color": "Normal", "medida": "1 hoja 4x8", "proveedor": "cualquiera", "precio": 800.0}, {"familia": "Tinta", "nombre": "Tinta al aceite", "color": "Cualquiera", "medida": "1 ltr", "proveedor": "cualquiera", "precio": 250.0}];

// ── ESTADO GLOBAL ─────────────────────────────────────
let session = null;       // { userId, role, nombre }
let currentProject = null; // { id, data }
let allUsers = [];
let allCatalog = [];

// ── INICIALIZACIÓN ────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Restaurar sesión
  const saved = sessionStorage.getItem('macedi_session');
  if (saved) {
    session = JSON.parse(saved);
    await bootApp();
  }

  // Seed catálogo si está vacío
  await seedCatalogIfEmpty();

  // Seed usuarios base si no existen
  await seedDefaultUsers();

  // ── Login
  document.getElementById('btnLogin').addEventListener('click', doLogin);
  document.getElementById('loginPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  // ── Logout
  document.getElementById('btnLogout').addEventListener('click', doLogout);

  // ── Sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const v = item.dataset.view;
      if (v) navigateTo(v);
    });
  });

  // ── Hamburger mobile
  const ham  = document.getElementById('hamburger');
  const over = document.getElementById('overlay');
  const side = document.getElementById('sidebar');
  ham.addEventListener('click', () => {
    side.classList.toggle('open');
    over.classList.toggle('open');
  });
  over.addEventListener('click', () => {
    side.classList.remove('open');
    over.classList.remove('open');
  });
});

// ── LOGIN ─────────────────────────────────────────────
async function doLogin() {
  const userId = document.getElementById('loginUser').value.trim().toUpperCase();
  const pass   = document.getElementById('loginPass').value.trim();
  const errEl  = document.getElementById('loginError');
  errEl.textContent = '';

  if (!userId || !pass) { errEl.textContent = 'Completa usuario y contraseña.'; return; }

  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) { errEl.textContent = 'Usuario no encontrado.'; return; }
    const u = snap.data();
    if (u.status === 'inactivo') { errEl.textContent = 'Usuario inactivo. Contacta al administrador.'; return; }
    if (u.password !== pass) { errEl.textContent = 'Contraseña incorrecta.'; return; }

    session = { userId, role: u.role, nombre: u.nombre || userId };
    sessionStorage.setItem('macedi_session', JSON.stringify(session));
    await bootApp();
  } catch(e) {
    errEl.textContent = 'Error de conexión. Intenta de nuevo.';
    console.error(e);
  }
}

function doLogout() {
  session = null;
  sessionStorage.removeItem('macedi_session');
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

// ── BOOT APP ──────────────────────────────────────────
async function bootApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');

  // Sidebar user info
  document.getElementById('sidebarUser').textContent =
    `${session.userId}\n${session.role.toUpperCase()}`;

  // Permisos por rol
  const isAdmin = session.role === 'admin';
  document.getElementById('navCatalog').style.display = isAdmin ? '' : 'none';
  document.getElementById('navUsers').style.display   = isAdmin ? '' : 'none';
  document.getElementById('adminCreateZone').style.display = isAdmin ? '' : 'none';

  // Cargar catálogo en memoria
  allCatalog = await loadCatalogMemory();

  // Navegar a proyectos
  navigateTo('projects');
}

// ── NAVEGACIÓN ────────────────────────────────────────
function navigateTo(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('view' + cap(view)).classList.add('active');
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');

  if (view === 'projects')    loadProjects();
  if (view === 'catalog')     loadCatalogView();
  if (view === 'users')       loadUsers();
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ═══════════════════════════════════════════════════════
//  PROYECTOS
// ═══════════════════════════════════════════════════════
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '<div class="loading-state">Cargando proyectos...</div>';

  // Cargar selectores de fabricante/proveedor para admin
  if (session.role === 'admin') {
    await loadUserSelects();
    setupCreateProjectBtn();
  }

  try {
    let q;
    if (session.role === 'admin') {
      q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    } else if (session.role === 'fabricante') {
      q = query(collection(db, 'projects'), where('fabricanteId', '==', session.userId), orderBy('createdAt', 'desc'));
    } else {
      // proveedor
      q = query(collection(db, 'projects'), where('proveedorId', '==', session.userId), orderBy('createdAt', 'desc'));
    }

    const snap = await getDocs(q);
    grid.innerHTML = '';

    if (snap.empty) {
      grid.innerHTML = '<div class="loading-state">No hay proyectos aún.</div>';
      return;
    }

    snap.forEach(s => {
      const d = s.data();
      // Proveedor solo ve proyectos aprobados
      if (session.role === 'proveedor' && d.estadoFlujo !== 'aprobado' && d.estadoFlujo !== 'en-entrega' && d.estadoFlujo !== 'completado') return;

      const card = document.createElement('div');
      card.className = 'project-card';

      const fechaStr = d.fechaEntrega ? formatDate(d.fechaEntrega) : '—';
      const badge = badgeHtml(d.estadoFlujo || 'pendiente');

      card.innerHTML = `
        <div class="project-card-name">${escHtml(d.name)}</div>
        <div class="project-card-meta">
          📅 Entrega: ${fechaStr}<br>
          🔨 Fabricante: ${escHtml(d.fabricanteNombre || d.fabricanteId || '—')}<br>
          📦 Proveedor: ${escHtml(d.proveedorNombre || d.proveedorId || '—')}
        </div>
        <div>${badge}</div>
      `;
      card.addEventListener('click', () => openProject(s.id, d));
      grid.appendChild(card);
    });

    if (!grid.innerHTML.trim()) {
      grid.innerHTML = '<div class="loading-state">No hay proyectos visibles para tu rol aún.</div>';
    }

  } catch(e) {
    grid.innerHTML = `<div class="loading-state" style="color:red">Error cargando proyectos: ${e.message}</div>`;
    console.error(e);
  }
}

function setupCreateProjectBtn() {
  const btn    = document.getElementById('btnShowCreateProject');
  const form   = document.getElementById('createProjectForm');
  const cancel = document.getElementById('btnCancelCreate');
  const create = document.getElementById('btnCreateProject');

  // Evitar duplicar listeners
  btn.replaceWith(btn.cloneNode(true));
  cancel.replaceWith(cancel.cloneNode(true));
  create.replaceWith(create.cloneNode(true));

  document.getElementById('btnShowCreateProject').addEventListener('click', () => {
    form.classList.toggle('open');
  });
  document.getElementById('btnCancelCreate').addEventListener('click', () => {
    form.classList.remove('open');
  });
  document.getElementById('btnCreateProject').addEventListener('click', createProject);
}

async function loadUserSelects() {
  const fabSel  = document.getElementById('pFabricante');
  const provSel = document.getElementById('pProveedor');

  try {
    const snap = await getDocs(collection(db, 'users'));
    const fabs  = [{ id: '', nombre: '— Seleccionar —' }];
    const provs = [{ id: '', nombre: '— Seleccionar —' }];

    allUsers = [];
    snap.forEach(s => {
      const d = s.data();
      allUsers.push({ id: s.id, ...d });
      if (d.role === 'fabricante' && d.status === 'activo') fabs.push({ id: s.id, nombre: d.nombre || s.id });
      if (d.role === 'proveedor'  && d.status === 'activo') provs.push({ id: s.id, nombre: d.nombre || s.id });
    });

    fabSel.innerHTML  = fabs.map(u => `<option value="${u.id}">${escHtml(u.nombre)}</option>`).join('');
    provSel.innerHTML = provs.map(u => `<option value="${u.id}">${escHtml(u.nombre)}</option>`).join('');
  } catch(e) { console.error('loadUserSelects:', e); }
}

async function createProject() {
  const name     = document.getElementById('pName').value.trim();
  const fecha    = document.getElementById('pFecha').value;
  const fabId    = document.getElementById('pFabricante').value;
  const provId   = document.getElementById('pProveedor').value;
  const obs      = document.getElementById('pObs').value.trim();
  const errEl    = document.getElementById('projectError');

  errEl.textContent = '';
  if (!name) { errEl.textContent = 'El nombre del proyecto es requerido.'; return; }

  const fabUser  = allUsers.find(u => u.id === fabId);
  const provUser = allUsers.find(u => u.id === provId);

  try {
    await addDoc(collection(db, 'projects'), {
      name,
      fechaEntrega:    fecha || null,
      fabricanteId:    fabId || null,
      fabricanteNombre: fabUser ? (fabUser.nombre || fabId) : null,
      proveedorId:     provId || null,
      proveedorNombre: provUser ? (provUser.nombre || provId) : null,
      estadoFlujo:     'pendiente',   // pendiente > en-proceso > aprobado > en-entrega > completado
      observaciones:   obs ? [{ texto: obs, autor: session.userId, fecha: new Date().toISOString() }] : [],
      createdAt:       serverTimestamp()
    });

    document.getElementById('pName').value  = '';
    document.getElementById('pFecha').value = '';
    document.getElementById('pObs').value   = '';
    document.getElementById('createProjectForm').classList.remove('open');
    loadProjects();
  } catch(e) {
    errEl.textContent = 'Error al crear proyecto: ' + e.message;
    console.error(e);
  }
}

// ═══════════════════════════════════════════════════════
//  DETALLE PROYECTO
// ═══════════════════════════════════════════════════════
async function openProject(id, data) {
  currentProject = { id, data };

  navigateToDetail();
  renderProjectHeader(data);
  renderInfoBar(data);
  renderWorkflowBar(data.estadoFlujo || 'pendiente');
  renderProjectActions(data);

  await loadMateriales(id, data);
  renderObservaciones(data.observaciones || []);

  // Mostrar zona de agregar para fabricante (cuando puede editar)
  const canAdd = session.role === 'admin' ||
    (session.role === 'fabricante' && (data.estadoFlujo === 'pendiente' || data.estadoFlujo === 'en-proceso'));
  const addZone = document.getElementById('fabricanteAddZone');
  addZone.style.display = canAdd ? 'block' : 'none';

  if (canAdd) setupAddMaterialForm(id);
  setupObsForm(id, data);
}

function navigateToDetail() {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('viewProjectDetail').classList.add('active');
  document.getElementById('btnBackProjects').onclick = () => navigateTo('projects');
}

function renderProjectHeader(data) {
  document.getElementById('projectDetailHeader').innerHTML =
    `<h1>${escHtml(data.name)}</h1>`;
}

function renderInfoBar(data) {
  const bar = document.getElementById('projectInfoBar');
  bar.innerHTML = `
    <div class="info-bar">
      <div class="info-item">
        <span class="info-label">Entrega</span>
        <span class="info-value">${data.fechaEntrega ? formatDate(data.fechaEntrega) : '—'}</span>
      </div>
      <div class="info-divider"></div>
      <div class="info-item">
        <span class="info-label">Fabricante</span>
        <span class="info-value">${escHtml(data.fabricanteNombre || data.fabricanteId || '—')}</span>
      </div>
      <div class="info-divider"></div>
      <div class="info-item">
        <span class="info-label">Proveedor</span>
        <span class="info-value">${escHtml(data.proveedorNombre || data.proveedorId || '—')}</span>
      </div>
      <div class="info-divider"></div>
      <div class="info-item">
        <span class="info-label">Estado</span>
        <span class="info-value">${badgeHtml(data.estadoFlujo || 'pendiente')}</span>
      </div>
    </div>
  `;
}

function renderWorkflowBar(estado) {
  const steps = [
    { key: 'pendiente',   label: '1. Creado' },
    { key: 'en-proceso',  label: '2. Fab. lista' },
    { key: 'aprobado',    label: '3. Aprobado' },
    { key: 'en-entrega',  label: '4. En entrega' },
    { key: 'completado',  label: '5. Completado' }
  ];
  const order = steps.map(s => s.key);
  const idx   = order.indexOf(estado);

  const existing = document.getElementById('wfBar');
  if (existing) existing.remove();

  const bar = document.createElement('div');
  bar.className = 'workflow-bar';
  bar.id = 'wfBar';

  steps.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'wf-step';
    if (i < idx) div.classList.add('done');
    if (i === idx) div.classList.add('current');
    div.textContent = s.label;
    bar.appendChild(div);
  });

  document.getElementById('projectInfoBar').after(bar);
}

function renderProjectActions(data) {
  const zone = document.getElementById('projectDetailActions');
  zone.innerHTML = '';

  if (session.role !== 'admin' && session.role !== 'fabricante') return;

  const estado = data.estadoFlujo || 'pendiente';

  // Fabricante: puede marcar "lista enviada al admin"
  if (session.role === 'fabricante' && estado === 'pendiente') {
    const btn = document.createElement('button');
    btn.className = 'btn-approve';
    btn.textContent = 'Enviar lista al Admin ✓';
    btn.addEventListener('click', () => cambiarEstado('en-proceso'));
    zone.appendChild(btn);
  }

  // Admin: puede aprobar la lista (dar luz verde al proveedor)
  if (session.role === 'admin' && estado === 'en-proceso') {
    const btn = document.createElement('button');
    btn.className = 'btn-approve';
    btn.textContent = '✓ Aprobar — Dar luz verde al proveedor';
    btn.addEventListener('click', () => cambiarEstado('aprobado'));
    zone.appendChild(btn);
  }

  // Admin: marcar en entrega
  if (session.role === 'admin' && estado === 'aprobado') {
    const btn = document.createElement('button');
    btn.className = 'btn-approve';
    btn.textContent = '📦 Marcar en entrega';
    btn.addEventListener('click', () => cambiarEstado('en-entrega'));
    zone.appendChild(btn);
  }

  // Admin: marcar completado
  if (session.role === 'admin' && estado === 'en-entrega') {
    const btn = document.createElement('button');
    btn.className = 'btn-approve';
    btn.textContent = '✅ Marcar completado';
    btn.addEventListener('click', () => cambiarEstado('completado'));
    zone.appendChild(btn);
  }
}

async function cambiarEstado(nuevoEstado) {
  if (!currentProject) return;
  try {
    await updateDoc(doc(db, 'projects', currentProject.id), {
      estadoFlujo: nuevoEstado
    });
    currentProject.data.estadoFlujo = nuevoEstado;
    renderInfoBar(currentProject.data);
    renderWorkflowBar(nuevoEstado);
    renderProjectActions(currentProject.data);

    // Re-evaluar zona de agregar
    const canAdd = session.role === 'admin' ||
      (session.role === 'fabricante' && (nuevoEstado === 'pendiente' || nuevoEstado === 'en-proceso'));
    document.getElementById('fabricanteAddZone').style.display = canAdd ? 'block' : 'none';
  } catch(e) { alert('Error al cambiar estado: ' + e.message); }
}

// ── MATERIALES ────────────────────────────────────────
async function loadMateriales(projectId, projectData) {
  const tbody = document.getElementById('materialesBody');
  tbody.innerHTML = '<tr><td colspan="12" class="loading-state">Cargando...</td></tr>';

  try {
    const snap = await getDocs(collection(db, 'projects', projectId, 'materiales'));
    tbody.innerHTML = '';

    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="12" class="empty-row">Sin materiales. Agrega el primero.</td></tr>';
      updateResumen([]);
      return;
    }

    const mats = [];
    snap.forEach(s => mats.push({ id: s.id, ...s.data() }));
    mats.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));

    mats.forEach(m => {
      tbody.appendChild(buildMatRow(m, projectId, projectData));
    });

    updateResumen(mats);
  } catch(e) {
    tbody.innerHTML = `<tr><td colspan="12" style="color:red;text-align:center">Error: ${e.message}</td></tr>`;
    console.error(e);
  }
}

function buildMatRow(m, projectId, projectData) {
  const tr = document.createElement('tr');
  const faltante = Math.max(0, (m.cantidad || 0) - (m.entregado || 0));
  const estado   = projectData.estadoFlujo || 'pendiente';

  // Quién puede editar entregado y status
  const canEditEntrega = session.role === 'admin' ||
    (session.role === 'proveedor' && (estado === 'aprobado' || estado === 'en-entrega'));
  const canDelete = session.role === 'admin';

  const statuses = ['pendiente', 'parcial', 'recibido', 'faltante'];

  tr.innerHTML = `
    <td><div class="td-mat">${escHtml(m.nombre || '—')}</div><div class="td-sub">${escHtml(m.familia || '')}</div></td>
    <td>${escHtml(m.color || '—')}</td>
    <td>${escHtml(m.medida || '—')}</td>
    <td>${escHtml(m.proveedor || '—')}</td>
    <td class="num">$${fmt(m.precio || 0)}</td>
    <td class="num">${m.cantidad || 0}</td>
    <td class="num">
      ${canEditEntrega
        ? `<input class="entregado-input" type="number" min="0" value="${m.entregado || 0}" data-id="${m.id}" data-field="entregado"/>`
        : (m.entregado || 0)
      }
    </td>
    <td class="num">
      <span class="faltante-cell ${faltante === 0 ? 'zero' : 'positive'}">${faltante}</span>
    </td>
    <td>${m.fechaEsperada ? formatDate(m.fechaEsperada) : '—'}</td>
    <td>
      ${canEditEntrega
        ? `<select class="status-select" data-id="${m.id}" data-field="status">
            ${statuses.map(s => `<option value="${s}" ${m.status === s ? 'selected' : ''}>${s}</option>`).join('')}
           </select>`
        : badgeHtml(m.status || 'pendiente')
      }
    </td>
    <td>${escHtml(m.observaciones || '')}</td>
    <td>
      ${canDelete ? `<button class="btn-danger btn-sm" data-del="${m.id}">✕</button>` : ''}
    </td>
  `;

  // Listeners inline
  if (canEditEntrega) {
    tr.querySelector(`[data-field="entregado"]`)?.addEventListener('change', async (e) => {
      const val = parseInt(e.target.value) || 0;
      await updateMatField(projectId, m.id, 'entregado', val, m.cantidad || 0);
      await loadMateriales(projectId, projectData);
    });

    tr.querySelector(`[data-field="status"]`)?.addEventListener('change', async (e) => {
      await updateDoc(doc(db, 'projects', projectId, 'materiales', m.id), { status: e.target.value });
      await loadMateriales(projectId, projectData);
    });
  }

  if (canDelete) {
    tr.querySelector(`[data-del]`)?.addEventListener('click', async () => {
      if (!confirm(`¿Eliminar "${m.nombre}"?`)) return;
      await deleteDoc(doc(db, 'projects', projectId, 'materiales', m.id));
      await loadMateriales(projectId, projectData);
    });
  }

  return tr;
}

async function updateMatField(projectId, matId, field, val, cantidad) {
  const update = { [field]: val };
  // Auto-actualizar status según entregado
  if (field === 'entregado') {
    if (val === 0) update.status = 'pendiente';
    else if (val >= cantidad) update.status = 'recibido';
    else update.status = 'parcial';
  }
  await updateDoc(doc(db, 'projects', projectId, 'materiales', matId), update);
}

function updateResumen(mats) {
  const total    = mats.length;
  const recibido = mats.filter(m => m.status === 'recibido').length;
  const parcial  = mats.filter(m => m.status === 'parcial').length;
  const faltante = mats.filter(m => m.status === 'faltante').length;
  const pct      = total ? Math.round((recibido / total) * 100) : 0;

  document.getElementById('resumenChips').innerHTML = `
    <span class="chip">Total: ${total}</span>
    <span class="chip" style="background:#dcfce7;border-color:#a7f3d0;color:#15803d">Recibidos: ${recibido}</span>
    <span class="chip" style="background:#fffbeb;border-color:#fde68a;color:#b45309">Parciales: ${parcial}</span>
    <span class="chip" style="background:#fef2f2;border-color:#fca5a5;color:#b91c1c">Faltantes: ${faltante}</span>
    <span class="chip">Avance: ${pct}%</span>
  `;
}

// ── AGREGAR MATERIAL ──────────────────────────────────
function setupAddMaterialForm(projectId) {
  // Catalog search
  const searchInput = document.getElementById('catalogSearch');
  const dropdown    = document.getElementById('searchDropdown');

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    dropdown.innerHTML = '';
    if (q.length < 2) { dropdown.classList.add('hidden'); return; }

    const matches = allCatalog.filter(c =>
      (c.nombre + ' ' + c.color + ' ' + c.familia).toLowerCase().includes(q)
    ).slice(0, 12);

    if (!matches.length) { dropdown.classList.add('hidden'); return; }

    dropdown.classList.remove('hidden');
    matches.forEach(c => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `
        <div class="si-name">${escHtml(c.nombre)} — ${escHtml(c.color)}</div>
        <div class="si-sub">${escHtml(c.familia)} | ${escHtml(c.medida)} | $${fmt(c.precio)}</div>
      `;
      item.addEventListener('click', () => {
        fillMatForm(c);
        dropdown.classList.add('hidden');
        searchInput.value = '';
      });
      dropdown.appendChild(item);
    });
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) dropdown.classList.add('hidden');
  });

  // Clear form btn
  document.getElementById('btnClearMatForm').onclick = () => clearMatForm();

  // Agregar material
  const btn = document.getElementById('btnAddMaterial');
  btn.replaceWith(btn.cloneNode(true));
  document.getElementById('btnAddMaterial').addEventListener('click', async () => {
    const nombre   = document.getElementById('matNombre').value.trim();
    const familia  = document.getElementById('matFamilia').value.trim();
    const color    = document.getElementById('matColor').value.trim();
    const medida   = document.getElementById('matMedida').value.trim();
    const proveedor= document.getElementById('matProveedor').value.trim();
    const precio   = parseFloat(document.getElementById('matPrecio').value) || 0;
    const cantidad = parseInt(document.getElementById('matCantidad').value) || 0;
    const fechaEsp = document.getElementById('matFechaEsperada').value || null;
    const obs      = document.getElementById('matObs').value.trim();
    const errEl    = document.getElementById('matError');
    const okEl     = document.getElementById('matOk');

    errEl.textContent = '';
    okEl.textContent  = '';

    if (!nombre) { errEl.textContent = 'El nombre del material es requerido.'; return; }
    if (cantidad <= 0) { errEl.textContent = 'La cantidad debe ser mayor a 0.'; return; }

    try {
      await addDoc(collection(db, 'projects', projectId, 'materiales'), {
        nombre, familia, color, medida, proveedor, precio, cantidad,
        entregado:     0,
        status:        'pendiente',
        fechaEsperada: fechaEsp,
        observaciones: obs,
        createdAt:     serverTimestamp()
      });
      okEl.textContent = `✓ "${nombre}" agregado`;
      clearMatForm();
      await loadMateriales(projectId, currentProject.data);
    } catch(e) {
      errEl.textContent = 'Error: ' + e.message;
      console.error(e);
    }
  });
}

function fillMatForm(c) {
  document.getElementById('matNombre').value   = c.nombre || '';
  document.getElementById('matFamilia').value  = c.familia || '';
  document.getElementById('matColor').value    = c.color || '';
  document.getElementById('matMedida').value   = c.medida || '';
  document.getElementById('matProveedor').value= c.proveedor || '';
  document.getElementById('matPrecio').value   = c.precio || '';
}

function clearMatForm() {
  ['matNombre','matFamilia','matColor','matMedida','matProveedor',
   'matPrecio','matCantidad','matFechaEsperada','matObs'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ── OBSERVACIONES ─────────────────────────────────────
function renderObservaciones(obs) {
  const list = document.getElementById('obsHistory');
  if (!obs || !obs.length) {
    list.innerHTML = '<p class="muted" style="font-size:13px">Sin observaciones aún.</p>';
    return;
  }
  list.innerHTML = `<div class="obs-list">
    ${obs.map(o => `
      <div class="obs-item">
        <div>${escHtml(o.texto)}</div>
        <div class="obs-meta">${escHtml(o.autor)} — ${formatDateTime(o.fecha)}</div>
      </div>
    `).join('')}
  </div>`;
}

function setupObsForm(projectId, projectData) {
  const canObs = session.role !== 'proveedor';
  document.getElementById('addObsZone').style.display = canObs ? 'block' : 'none';
  if (!canObs) return;

  const btn = document.getElementById('btnAddObs');
  btn.replaceWith(btn.cloneNode(true));
  document.getElementById('btnAddObs').addEventListener('click', async () => {
    const texto = document.getElementById('newObsText').value.trim();
    if (!texto) return;

    const nueva = { texto, autor: session.userId, fecha: new Date().toISOString() };
    const obs   = [...(projectData.observaciones || []), nueva];

    await updateDoc(doc(db, 'projects', projectId), { observaciones: obs });
    projectData.observaciones = obs;
    currentProject.data.observaciones = obs;

    document.getElementById('newObsText').value = '';
    renderObservaciones(obs);
  });
}

// ═══════════════════════════════════════════════════════
//  CATÁLOGO
// ═══════════════════════════════════════════════════════
async function loadCatalogMemory() {
  try {
    const snap = await getDocs(collection(db, 'catalog'));
    const list = [];
    snap.forEach(s => list.push({ id: s.id, ...s.data() }));
    return list;
  } catch(e) { console.error('loadCatalogMemory:', e); return CATALOG_DATA; }
}

async function loadCatalogView() {
  allCatalog = await loadCatalogMemory();
  renderCatalogList(allCatalog);

  // Filter
  document.getElementById('catalogFilter').oninput = (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = allCatalog.filter(c =>
      (c.nombre + c.color + c.familia + c.medida).toLowerCase().includes(q)
    );
    renderCatalogList(filtered);
  };

  // Agregar
  document.getElementById('btnAddCatalog').onclick = async () => {
    const familia   = document.getElementById('cFamilia').value.trim();
    const nombre    = document.getElementById('cNombre').value.trim();
    const color     = document.getElementById('cColor').value.trim();
    const medida    = document.getElementById('cMedida').value.trim();
    const proveedor = document.getElementById('cProveedorField').value.trim();
    const precio    = parseFloat(document.getElementById('cPrecio').value) || 0;
    const errEl     = document.getElementById('catalogError');
    const okEl      = document.getElementById('catalogOk');
    errEl.textContent = ''; okEl.textContent = '';

    if (!nombre) { errEl.textContent = 'El nombre es requerido.'; return; }

    try {
      await addDoc(collection(db, 'catalog'), { familia, nombre, color, medida, proveedor, precio, createdAt: serverTimestamp() });
      okEl.textContent = `✓ "${nombre}" agregado al catálogo.`;
      ['cFamilia','cNombre','cColor','cMedida','cProveedorField','cPrecio'].forEach(id => document.getElementById(id).value = '');
      allCatalog = await loadCatalogMemory();
      renderCatalogList(allCatalog);
    } catch(e) { errEl.textContent = 'Error: ' + e.message; }
  };
}

function renderCatalogList(items) {
  const cont = document.getElementById('catalogListContainer');
  if (!items.length) { cont.innerHTML = '<div class="loading-state">Sin resultados.</div>'; return; }

  cont.innerHTML = items.map(c => `
    <div class="catalog-item">
      <div class="ci-main">
        <div class="ci-name">${escHtml(c.nombre)} — ${escHtml(c.color || '')}</div>
        <div class="ci-sub">${escHtml(c.familia || '')} | ${escHtml(c.medida || '')} | Prov: ${escHtml(c.proveedor || '')}</div>
      </div>
      <div class="ci-price">$${fmt(c.precio || 0)}</div>
      ${session.role === 'admin' ? `<button class="btn-danger btn-sm" data-del-cat="${c.id}">✕</button>` : ''}
    </div>
  `).join('');

  cont.querySelectorAll('[data-del-cat]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Eliminar este material del catálogo?')) return;
      await deleteDoc(doc(db, 'catalog', btn.dataset.delCat));
      allCatalog = await loadCatalogMemory();
      renderCatalogList(allCatalog);
    });
  });
}

// ═══════════════════════════════════════════════════════
//  USUARIOS
// ═══════════════════════════════════════════════════════
async function loadUsers() {
  const cont = document.getElementById('usersListContainer');
  cont.innerHTML = '<div class="loading-state">Cargando...</div>';

  try {
    const snap = await getDocs(collection(db, 'users'));
    allUsers = [];
    snap.forEach(s => allUsers.push({ id: s.id, ...s.data() }));
    renderUsersList();
  } catch(e) { cont.innerHTML = `<div class="loading-state" style="color:red">${e.message}</div>`; }

  // Crear usuario
  document.getElementById('btnCreateUser').onclick = async () => {
    const id     = document.getElementById('uId').value.trim().toUpperCase();
    const pass   = document.getElementById('uPass').value.trim();
    const nombre = document.getElementById('uNombre').value.trim();
    const role   = document.getElementById('uRole').value;
    const errEl  = document.getElementById('userError');
    const okEl   = document.getElementById('userOk');
    errEl.textContent = ''; okEl.textContent = '';

    if (!id || !pass) { errEl.textContent = 'ID y contraseña son requeridos.'; return; }
    if (pass.length < 4) { errEl.textContent = 'Contraseña muy corta (mín 4 caracteres).'; return; }

    try {
      await setDoc(doc(db, 'users', id), { password: pass, nombre, role, status: 'activo' });
      okEl.textContent = `✓ Usuario ${id} creado.`;
      ['uId','uPass','uNombre'].forEach(f => document.getElementById(f).value = '');
      await loadUsers();
    } catch(e) { errEl.textContent = 'Error: ' + e.message; }
  };
}

function renderUsersList() {
  const cont = document.getElementById('usersListContainer');
  if (!allUsers.length) { cont.innerHTML = '<div class="loading-state">Sin usuarios.</div>'; return; }

  cont.innerHTML = allUsers.map(u => `
    <div class="user-item">
      <div class="ui-info">
        <div class="ui-id">${escHtml(u.id)}</div>
        <div class="ui-name">${escHtml(u.nombre || '')} · ${u.role}</div>
      </div>
      <div class="ui-actions">
        <span class="${u.status === 'activo' ? 'badge badge-activo' : 'badge badge-inactivo'}">${u.status}</span>
        <button class="btn-ghost btn-sm" data-toggle="${u.id}" data-status="${u.status}">
          ${u.status === 'activo' ? 'Desactivar' : 'Activar'}
        </button>
        ${u.id !== session.userId ? `<button class="btn-danger btn-sm" data-del-user="${u.id}">✕</button>` : ''}
      </div>
    </div>
  `).join('');

  cont.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newStatus = btn.dataset.status === 'activo' ? 'inactivo' : 'activo';
      await updateDoc(doc(db, 'users', btn.dataset.toggle), { status: newStatus });
      await loadUsers();
    });
  });

  cont.querySelectorAll('[data-del-user]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Eliminar usuario ${btn.dataset.delUser}?`)) return;
      await deleteDoc(doc(db, 'users', btn.dataset.delUser));
      await loadUsers();
    });
  });
}

// ═══════════════════════════════════════════════════════
//  SEED / INIT DATA
// ═══════════════════════════════════════════════════════
async function seedDefaultUsers() {
  const defaults = [
    { id: 'ADMIN01',      password: 'Hilario123',    role: 'admin',       nombre: 'Administrador',  status: 'activo' },
    { id: 'FABRICANTE01', password: 'Fabricante123', role: 'fabricante',  nombre: 'Fabricante 01',  status: 'activo' },
    { id: 'PROVEEDOR01',  password: 'Proveedor123',  role: 'proveedor',   nombre: 'Proveedor 01',   status: 'activo' },
  ];
  for (const u of defaults) {
    const snap = await getDoc(doc(db, 'users', u.id));
    if (!snap.exists()) await setDoc(doc(db, 'users', u.id), u);
  }
}

async function seedCatalogIfEmpty() {
  try {
    const snap = await getDocs(query(collection(db, 'catalog'), limit(1)));
    if (!snap.empty) return;

    const batch = writeBatch(db);
    CATALOG_DATA.forEach((item, i) => {
      batch.set(doc(db, 'catalog', String(i + 1).padStart(4, '0')), {
        ...item,
        createdAt: serverTimestamp()
      });
    });
    await batch.commit();
    console.log('Catálogo cargado con', CATALOG_DATA.length, 'materiales.');
  } catch(e) { console.error('seedCatalog:', e); }
}

// ═══════════════════════════════════════════════════════
//  UTILIDADES
// ═══════════════════════════════════════════════════════
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(n) {
  return Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('es-MX')} ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
}

function badgeHtml(estado) {
  const map = {
    'pendiente':   'badge-pendiente',
    'en-proceso':  'badge-en-proceso',
    'aprobado':    'badge-aprobado',
    'en-entrega':  'badge-parcial',
    'completado':  'badge-completado',
    'parcial':     'badge-parcial',
    'recibido':    'badge-recibido',
    'faltante':    'badge-faltante',
    'activo':      'badge-activo',
    'inactivo':    'badge-inactivo',
  };
  const cls = map[estado] || 'badge-pendiente';
  return `<span class="badge ${cls}">${escHtml(estado)}</span>`;
}
