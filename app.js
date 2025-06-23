// app.js
const filtroColaborador = document.getElementById("filtro-colaborador");
const filtroStatus = document.getElementById("filtro-status");


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
onSnapshot(tasksCol, snapshot => {
  dashboard.innerHTML = "";

  // Coletar dados brutos
  let tarefas = [];
  let colaboradoresSet = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    tarefas.push({ id: doc.id, ...data });
    colaboradoresSet.add(data.assignee);
  });

  filtroColaborador.addEventListener("change", () => {
  loadTasksAgain(); // força atualização
});
filtroStatus.addEventListener("change", () => {
  loadTasksAgain(); // idem
});

// função auxiliar que reinicializa a leitura
function loadTasksAgain() {
  // não faz nada, pois o onSnapshot já está em tempo real
  // ao mudar os valores dos selects, ele atualiza automaticamente
}

  // Preencher filtro de colaborador (evita duplicação)
  filtroColaborador.innerHTML = `<option value="">Todos os colaboradores</option>`;
  colaboradoresSet.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    filtroColaborador.appendChild(opt);
  });

  // Aplicar filtros
  const filtroColab = filtroColaborador.value;
  const filtroStat = filtroStatus.value;

  let filtradas = tarefas.filter(t => {
    return (!filtroColab || t.assignee === filtroColab) &&
           (!filtroStat || t.status === filtroStat);
  });

  // Contadores
  let total = 0, pendente = 0, andamento = 0, concluida = 0;
  filtradas.forEach(t => {
    total++;
    if (t.status === "Pendente") pendente++;
    else if (t.status === "Em andamento") andamento++;
    else if (t.status === "Concluída") concluida++;

    // Criar doc fake para renderTask
    renderTask({ id: t.id, data: () => t });
  });

  // Atualizar indicadores
  document.getElementById("total").textContent = `Total: ${total}`;
  document.getElementById("pendente").textContent = `Pendente: ${pendente}`;
  document.getElementById("andamento").textContent = `Em andamento: ${andamento}`;
  document.getElementById("concluida").textContent = `Concluída: ${concluida}`;
});


// Atualizar indicadores
document.getElementById("total").textContent = `Total: ${total}`;
document.getElementById("pendente").textContent = `Pendente: ${pendente}`;
document.getElementById("andamento").textContent = `Em andamento: ${andamento}`;
document.getElementById("concluida").textContent = `Concluída: ${concluida}`;

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
