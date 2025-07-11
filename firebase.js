// firebase.js
// Este arquivo é um módulo, por isso precisa das importações


// firebase.js - Versão simplificada e compatível

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBKVphDXSCKgJ0onyebhD2FQ_gK5fALQhg",
  authDomain: "sistemahorarios-de981.firebaseapp.com",
  databaseURL: "https://sistemahorarios-de981.firebaseio.com", // Adicione esta linha
  projectId: "sistemahorarios-de981",
  storageBucket: "sistemahorarios-de981.firebasestorage.app",
  messagingSenderId: "647390917543",
  appId: "1:647390917543:web:848a6f24bf012260407c82"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Exporta funções essenciais para o escopo global
window.firebaseDB = database;
window.dbRef = (path) => firebase.database().ref(path);
window.dbPush = (ref) => firebase.database().ref(ref).push();
window.dbSet = (ref, data) => firebase.database().ref(ref).set(data);
window.dbOnValue = (ref, callback) => firebase.database().ref(ref).on('value', callback);
window.dbRemove = (ref) => firebase.database().ref(ref).remove();
window.dbUpdate = (ref, data) => firebase.database().ref(ref).update(data);
window.dbServerTimestamp = firebase.database.ServerValue.TIMESTAMP;

console.log("Firebase inicializado com sucesso. Funções disponíveis:");
console.log("- firebaseDB", window.firebaseDB);
console.log("- dbRef()", window.dbRef);
console.log("- dbPush()", window.dbPush);
console.log("- dbSet()", window.dbSet);
