// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDWf3YQ5sZDaB9a2H8zbKWN2vwTPL7TRqY",
  authDomain: "gestao-tarefas-dd974.firebaseapp.com",
  projectId: "gestao-tarefas-dd974",
  storageBucket: "gestao-tarefas-dd974.firebasestorage.app",
  messagingSenderId: "540477569192",
  appId: "1:540477569192:web:75171ee1a3015f7bc1ea9d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referência DOM
const form = document.getElementById("task-form");
const dashboard = document.getElementById("dashboard");

// Referência para a coleção
const tasksCol = collection(db, "tarefas");

// Criar ou atualizar tarefa
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    title: form.title.value,
    type: form.type.value,
    assignee: form.assignee.value,
    dueDate: form["due-date"].value,
    priority: form.priority.value,
    notes: form.notes.value,
    status: form.status.value,
  };

  const editingId = form.getAttribute("data-id");
  if (editingId) {
    const taskRef = doc(db, "tarefas", editingId);
    await updateDoc(taskRef, data);
    form.removeAttribute("data-id");
  } else {
    await addDoc(tasksCol, data);
  }

  form.reset();
});

// Exibir tarefas em tempo real
onSnapshot(tasksCol, (snapshot) => {
  dashboard.innerHTML = "";
  snapshot.forEach((docSnap) => {
    renderTask(docSnap);
  });
});

// Renderizar tarefa
function renderTask(docSnap) {
  const data = docSnap.data();
  const id = docSnap.id;

  const card = document.createElement("div");
  card.classList.add("task-card");
  card.setAttribute("id", id);

  card.innerHTML = `
    <h3>${data.title}</h3>
    <p><strong>Tipo:</strong> ${data.type}</p>
    <p><strong>Atribuído a:</strong> ${data.assignee}</p>
    <p><strong>Prazo:</strong> ${data.dueDate}</p>
    <p><strong>Prioridade:</strong> ${data.priority}</p>
    <p><strong>Status:</strong> ${data.status}</p>
    ${data.notes ? `<p><strong>Obs:</strong> ${data.notes}</p>` : ""}
    <div class="actions">
      <button onclick="editTask('${id}')">Editar</button>
      <button onclick="deleteTask('${id}')">Excluir</button>
    </div>
  `;

  dashboard.appendChild(card);
}

// Editar tarefa
window.editTask = async (id) => {
  const taskRef = doc(db, "tarefas", id);
  const taskSnap = await getDoc(taskRef);
  const data = taskSnap.data();
  Object.keys(data).forEach((key) => {
    if (form[key]) form[key].value = data[key];
  });
  form.setAttribute("data-id", id);
  window.scrollTo(0, 0);
};

// Deletar tarefa
window.deleteTask = async (id) => {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    await deleteDoc(doc(db, "tarefas", id));
  }
};
