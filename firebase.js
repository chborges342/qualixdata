// Substitua TODO o conteúdo do firebase.js por:
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBKVphDXSCKgJ0onyebhD2FQ_gK5fALQhg",
    authDomain: "sistemahorarios-de981.firebaseapp.com",
    projectId: "sistemahorarios-de981",
    storageBucket: "sistemahorarios-de981.appspot.com",
    messagingSenderId: "647390917543",
    appId: "1:647390917543:web:848a6f24bf012260407c82"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Exporte explicitamente cada função necessária
export const db = {
    database,
    ref: (path) => ref(database, path),
    push,
    set,
    onValue,
    remove,
    update,
    serverTimestamp: { '.sv': 'timestamp' }
};

console.log("Firebase configurado com sucesso!");
