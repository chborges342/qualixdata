import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getDatabase, 
    ref as dbRef, 
    push as dbPush,
    set as dbSet,
    onValue as dbOnValue,
    remove as dbRemove,
    update as dbUpdate,
    serverTimestamp as dbServerTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBKVphDXSCKgJ0onyebhD2FQ_gK5fALQhg",
    authDomain: "sistemahorarios-de981.firebaseapp.com",
    projectId: "sistemahorarios-de981",
    storageBucket: "sistemahorarios-de981.appspot.com",
    messagingSenderId: "647390917543",
    appId: "1:647390917543:web:848a6f24bf012260407c82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseDB = getDatabase(app);

// Disponibiliza as funções no escopo global para compatibilidade com seu script.js
window.firebaseDB = firebaseDB;
window.dbRef = dbRef;
window.dbPush = dbPush;
window.dbSet = dbSet;
window.dbOnValue = dbOnValue;
window.dbRemove = dbRemove;
window.dbUpdate = dbUpdate;
window.dbServerTimestamp = dbServerTimestamp;

console.log("Firebase configurado com sucesso! Funções disponíveis globalmente.");
