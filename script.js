// Sistema de Gestão de Horários - Ciências Econômicas UESC
// Arquivo principal JavaScript - Versão Completa Atualizada

// Estrutura de dados global
let appData = {
    professores: {},
    disciplinas: {},
    turmas: {},
    salas: {},
    horarios: {}
};

// Variáveis globais para o modo de edição
let currentEditingItemId = null;
let currentEditingFormId = null;

// Funções utilitárias
function toArray(obj) {
    return obj ? Object.values(obj) : [];
}

function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alerts-container');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;

    const icon = type === 'success' ? 'fas fa-check-circle' :
                 type === 'error' ? 'fas fa-exclamation-circle' :
                 type === 'warning' ? 'fas fa-exclamation-triangle' :
                 'fas fa-info-circle';

    alert.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="alert-close">&times;</button>
    `;

    alertsContainer.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);

    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.parentNode.removeChild(alert);
    });
}

function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        const multiSelects = form.querySelectorAll('select[multiple]');
        multiSelects.forEach(select => {
            Array.from(select.options).forEach(option => option.selected = false);
        });
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        if (formId === 'disciplina-form') {
            const semestresContainer = document.getElementById('disciplina-semestres-container');
            if (semestresContainer) {
                semestresContainer.innerHTML = '';
            }
        }
    }
}

function cancelEditing() {
    const formConfig = {
        'professor-form': { submitBtnId: 'submit-professor', defaultText: 'Cadastrar Professor' },
        'disciplina-form': { submitBtnId: 'submit-disciplina', defaultText: 'Cadastrar Disciplina' },
        'turma-form': { submitBtnId: 'submit-turma', defaultText: 'Cadastrar Turma' },
        'sala-form': { submitBtnId: 'submit-sala', defaultText: 'Cadastrar Sala' }
    };

    if (currentEditingFormId && formConfig[currentEditingFormId]) {
        clearForm(currentEditingFormId);
        const submitBtn = document.getElementById(formConfig[currentEditingFormId].submitBtnId);
        if (submitBtn) {
            submitBtn.textContent = formConfig[currentEditingFormId].defaultText;
        }
        const formActions = document.querySelector(`#${currentEditingFormId} .form-actions`);
        const cancelBtn = formActions ? formActions.querySelector('.cancel-edit-btn') : null;
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }
    currentEditingItemId = null;
    currentEditingFormId = null;
    showAlert('Edição cancelada.', 'info');
}

// Configurações dos horários
const HORARIOS_CONFIG = {
    matutino: {
        dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
        blocos: [
            { id: 1, inicio: '07:30', fim: '08:20' },
            { id: 2, inicio: '08:20', fim: '09:10' },
            { id: 3, inicio: '09:10', fim: '10:00' },
            { id: 4, inicio: '10:00', fim: '10:50' },
            { id: 5, inicio: '10:50', fim: '11:40' },
            { id: 6, inicio: '11:40', fim: '12:30' }
        ],
        semestres: Array.from({length: 9}, (_, i) => i + 1)
    },
    noturno: {
        dias: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'],
        blocos: {
            'segunda': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'terca': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'quarta': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'quinta': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'sexta': [
                { id: 1, inicio: '18:40', fim: '19:30' },
                { id: 2, inicio: '19:30', fim: '20:20' },
                { id: 3, inicio: '20:20', fim: '21:10' },
                { id: 4, inicio: '21:10', fim: '22:00' }
            ],
            'sabado': [
                { id: 1, inicio: '07:30', fim: '08:20' },
                { id: 2, inicio: '08:20', fim: '09:10' },
                { id: 3, inicio: '09:10', fim: '10:00' },
                { id: 4, inicio: '10:00', fim: '10:50' },
                { id: 5, inicio: '10:50', fim: '11:40' },
                { id: 6, inicio: '11:40', fim: '12:30' }
            ]
        },
        semestres: Array.from({length: 10}, (_, i) => i + 1)
    }
};

const CODIGOS_TURMA = {
    matutino: {
        regular: ['T02'],
        extra: ['T04', 'T06']
    },
    noturno: {
        regular: ['T01'],
        extra: ['T03', 'T05']
    }
};

// Navegação
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');

            if (targetSection === 'dashboard') {
                updateDashboardCounts();
            }
            if (targetSection === 'cadastros') {
                renderProfessoresList();
                renderDisciplinasList();
                renderTurmasList();
                renderSalasList();
            }
            if (targetSection === 'horarios') {
                updateHorarioSelects();
                const selectedTurmaId = document.getElementById('horario-turma').value;
                if (selectedTurmaId) {
                    renderHorariosGrid(selectedTurmaId);
                } else {
                    document.getElementById('horarios-grid').innerHTML = '<p class="no-activity">Selecione uma turma para visualizar os horários</p>';
                }
            }
            if (targetSection === 'impressao') {
                updatePrintSelects();
            }
        });
    });
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// Dashboard
function updateDashboardCounts() {
    document.getElementById('professores-count').textContent = toArray(appData.professores).length;
    document.getElementById('disciplinas-count').textContent = toArray(appData.disciplinas).length;
    document.getElementById('turmas-count').textContent = toArray(appData.turmas).length;
    document.getElementById('salas-count').textContent = toArray(appData.salas).length;
}

// [As funções de Professores, Disciplinas, Turmas e Salas permanecem as mesmas...]

// ============ NOVA FUNCIONALIDADE: IMPRESSÃO DE DISCIPLINAS ============

function generateDisciplinasPrint() {
    const preview = document.getElementById('print-preview');
    preview.classList.remove('hidden');
    
    // Converte para array e ordena por semestre
    const disciplinasArray = toArray(appData.disciplinas).map(d => {
        const primeiroSemestre = d.semestresPorTurno ? 
            Object.values(d.semestresPorTurno)[0] || 0 : 0;
        return {
            ...d,
            primeiroSemestre
        };
    }).sort((a, b) => a.primeiroSemestre - b.primeiroSemestre);
    
    let html = `
        <div class="print-header">
            <h2>Lista de Disciplinas - Ciências Econômicas UESC</h2>
            <p>Organizado por semestre curricular</p>
            <p>Gerado em: ${formatDateTime(new Date())}</p>
        </div>
        
        <table class="print-table disciplinas-table">
            <thead>
                <tr>
                    <th>Semestre</th>
                    <th>Código</th>
                    <th>Disciplina</th>
                    <th>Turma</th>
                    <th>Professor</th>
                    <th>Carga Horária</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Agrupa disciplinas por semestre
    const disciplinasPorSemestre = {};
    
    disciplinasArray.forEach(disciplina => {
        if (disciplina.turnos && disciplina.semestresPorTurno) {
            disciplina.turnos.forEach(turno => {
                const semestre = disciplina.semestresPorTurno[turno];
                
                if (!disciplinasPorSemestre[semestre]) {
                    disciplinasPorSemestre[semestre] = [];
                }
                
                disciplinasPorSemestre[semestre].push({
                    ...disciplina,
                    turnoAtual: turno,
                    semestreAtual: semestre
                });
            });
        }
    });
    
    // Ordena os semestres e gera as linhas
    Object.keys(disciplinasPorSemestre)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(semestre => {
            disciplinasPorSemestre[semestre].forEach(disciplina => {
                const horariosDisciplina = toArray(appData.horarios)
                    .filter(h => h.idDisciplina === disciplina.id);
                
                if (horariosDisciplina.length === 0) {
                    html += `
                        <tr>
                            <td>${disciplina.semestreAtual}º</td>
                            <td>${disciplina.codigo}</td>
                            <td>${disciplina.nome}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>${disciplina.cargaHoraria}h</td>
                        </tr>
                    `;
                } else {
                    horariosDisciplina.forEach(horario => {
                        const turma = appData.turmas[horario.idTurma];
                        const professor = appData.professores[horario.idProfessor];
                        
                        html += `
                            <tr>
                                <td>${disciplina.semestreAtual}º</td>
                                <td>${disciplina.codigo}</td>
                                <td>${disciplina.nome}</td>
                                <td>${turma?.nome || '-'}</td>
                                <td>${professor?.nome || '-'}</td>
                                <td>${disciplina.cargaHoraria}h</td>
                            </tr>
                        `;
                    });
                }
            });
        });
    
    html += `</tbody></table>`;
    
    html += `
        <div class="print-footer">
            <button class="btn btn-primary" onclick="printPage()">
                <i class="fas fa-print"></i>
                Imprimir
            </button>
            <button class="btn btn-secondary" onclick="closePrintPreview()">
                <i class="fas fa-times"></i>
                Fechar
            </button>
        </div>
    `;
    
    preview.innerHTML = html;
    preview.scrollIntoView({ behavior: 'smooth' });
}

// Atualize a função initImpressao para incluir o novo botão
function initImpressao() {
    const printTurmaBtn = document.getElementById('btn-print-turma');
    const printProfessorBtn = document.getElementById('btn-print-professor');
    const printDisciplinasBtn = document.getElementById('btn-print-disciplinas');
    
    printTurmaBtn.addEventListener('click', () => {
        const turmaId = document.getElementById('print-turma').value;
        if (!turmaId) {
            showAlert('Selecione uma turma', 'warning');
            return;
        }
        generateTurmaPrint(turmaId);
    });
    
    printProfessorBtn.addEventListener('click', () => {
        const professorId = document.getElementById('print-professor').value;
        if (!professorId) {
            showAlert('Selecione um professor', 'warning');
            return;
        }
        generateProfessorPrint(professorId);
    });
    
    printDisciplinasBtn.addEventListener('click', generateDisciplinasPrint);
}

// [As demais funções permanecem as mesmas...]

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTabs();
    initProfessores();
    initDisciplinas();
    initTurmas();
    initSalas();
    initHorarios();
    initImpressao();
    initFirebaseListeners();
    
    console.log('Sistema de Gestão de Horários inicializado com sucesso!');
});
