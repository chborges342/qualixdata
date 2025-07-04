// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWf3YQ5sZDaB9a2H8zbKWN2vwTPL7TRqY",
  authDomain: "gestao-tarefas-dd974.firebaseapp.com",
  projectId: "gestao-tarefas-dd974",
  storageBucket: "gestao-tarefas-dd974.firebasestorage.app",
  messagingSenderId: "540477569192",
  appId: "1:540477569192:web:75171ee1a3015f7bc1ea9d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCol = collection(db, "tarefas");

const form = document.getElementById("task-form");
const dashboard = document.getElementById("dashboard");
const filtroColaborador = document.getElementById("filtro-colaborador");
const filtroStatus = document.getElementById("filtro-status");

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

onSnapshot(tasksCol, snapshot => {
  dashboard.innerHTML = "";
  let tarefas = [];
  let colaboradoresSet = new Set();

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    tarefas.push({ id: docSnap.id, ...data });
    colaboradoresSet.add(data.assignee);
  });

  // Preencher filtro de colaborador
  const current = filtroColaborador.value;
  filtroColaborador.innerHTML = '<option value="">Todos os colaboradores</option>';
  colaboradoresSet.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    if (nome === current) opt.selected = true;
    filtroColaborador.appendChild(opt);
  });

  const colab = filtroColaborador.value;
  const status = filtroStatus.value;
  const filtradas = tarefas.filter(t => (!colab || t.assignee === colab) && (!status || t.status === status));

  let total = 0, pendente = 0, andamento = 0, concluida = 0;
  filtradas.forEach(t => {
    total++;
    if (t.status === "Pendente") pendente++;
    else if (t.status === "Em andamento") andamento++;
    else if (t.status === "Concluída") concluida++;

    renderTask({ id: t.id, data: () => t });
  });

  document.getElementById("total").textContent = `Total: ${total}`;
  document.getElementById("pendente").textContent = `Pendente: ${pendente}`;
  document.getElementById("andamento").textContent = `Em andamento: ${andamento}`;
  document.getElementById("concluida").textContent = `Concluída: ${concluida}`;
});

function renderTask(docSnap) {
  const data = docSnap.data();
  const id = docSnap.id;

  const card = document.createElement("div");
  card.classList.add("task-card");

  const prioridadeClass = {
    Alta: "priority-alta",
    Média: "priority-media",
    Baixa: "priority-baixa"
  }[data.priority] || "";

  const statusClass = {
    "Pendente": "status-pendente",
    "Em andamento": "status-em-andamento",
    "Concluída": "status-concluida"
  }[data.status] || "";

  card.classList.add(prioridadeClass);
  card.setAttribute("id", id);

  card.innerHTML = `
    <div class="task-info">
      <h3>${data.title}</h3>
      <p><strong>Tipo:</strong> ${data.type}</p>
      <p><strong>Atribuído a:</strong> ${data.assignee}</p>
      <p><strong>Prazo:</strong> ${data.dueDate}</p>
      <p><strong>Obs:</strong> ${data.notes || "-"}</p>
    </div>
    <div class="task-meta">
      <span class="${statusClass}">${data.status}</span>
      <button onclick="editTask('${id}')">Editar</button>
      <button onclick="deleteTask('${id}')">Excluir</button>
    </div>
  `;

  dashboard.appendChild(card);
}

window.editTask = async (id) => {
  const taskRef = doc(db, "tarefas", id);
  const snap = await getDoc(taskRef);
  const data = snap.data();
  Object.keys(data).forEach(key => {
    if (form[key]) form[key].value = data[key];
  });
  form.setAttribute("data-id", id);
  window.scrollTo(0, 0);
};

window.deleteTask = async (id) => {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    await deleteDoc(doc(db, "tarefas", id));
  }
};

filtroColaborador.addEventListener("change", () => {
  // onSnapshot já se encarrega da atualização
});

filtroStatus.addEventListener("change", () => {
  // idem acima
});
