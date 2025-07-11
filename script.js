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

// Funções utilitárias
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

// Tabs nos cadastros
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

// [As seções de Professores, Disciplinas, Turmas e Salas permanecem exatamente como no seu código original]

// Horários - Funcionalidades avançadas
function initHorarios() {
    const turmaSelect = document.getElementById('horario-turma');
    const novoHorarioBtn = document.getElementById('btn-novo-horario');
    const limparHorariosBtn = document.getElementById('btn-limpar-horarios');
    const modal = document.getElementById('horario-modal');
    const modalForm = document.getElementById('horario-form');
    const btnDeleteHorarioModal = document.getElementById('btn-delete-horario-modal');

    let currentSlot = null;

    turmaSelect.addEventListener('change', () => {
        if (turmaSelect.value) {
            renderHorariosGrid(turmaSelect.value);
        } else {
            document.getElementById('horarios-grid').innerHTML = '<p class="no-activity">Selecione uma turma para visualizar os horários</p>';
        }
    });

    novoHorarioBtn.addEventListener('click', () => {
        if (!turmaSelect.value) {
            showAlert('Selecione uma turma primeiro', 'warning');
            return;
        }
        currentSlot = null;
        document.getElementById('horario-form').reset();
        document.getElementById('horario-modal-title').textContent = 'Adicionar Horário';
        btnDeleteHorarioModal.style.display = 'none';
        const selectedTurma = appData.turmas[turmaSelect.value];
        if (selectedTurma) {
            updateModalSelects(selectedTurma);
        }
        openHorarioModal();
    });

    limparHorariosBtn.addEventListener('click', async () => {
        const turmaId = turmaSelect.value;
        if (!turmaId) {
            showAlert('Selecione uma turma primeiro', 'warning');
            return;
        }

        if (confirm('Tem certeza que deseja limpar todos os horários desta turma?')) {
            try {
                const horariosDaTurma = toArray(appData.horarios).filter(h => h.idTurma === turmaId);
                const updates = {};
                horariosDaTurma.forEach(horario => {
                    updates[`horarios/${horario.id}`] = null;
                });
                await window.dbUpdate(window.dbRef(window.firebaseDB, '/'), updates);
                showAlert('Horários limpos com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao limpar horários:', error);
                showAlert('Erro ao limpar horários: ' + error.message, 'error');
            }
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            closeHorarioModal();
        }
    });

    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveHorario();
    });

    btnDeleteHorarioModal.addEventListener('click', async () => {
        if (currentSlot && confirm('Tem certeza que deseja excluir este horário?')) {
            await deleteHorario(currentSlot.turmaId, currentSlot.dia, currentSlot.bloco);
            closeHorarioModal();
        }
    });
}

function renderHorariosGrid(turmaId) {
    const turma = appData.turmas[turmaId];
    if (!turma) return;

    const container = document.getElementById('horarios-grid');
    const config = HORARIOS_CONFIG[turma.turno];

    const getCorPorDisciplina = (idDisciplina) => {
        if (!idDisciplina) return '#f0f0f0';
        const hash = idDisciplina.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 85%)`;
    };

    let html = '<table class="grade-horarios">';
    html += '<thead><tr><th>Horário</th>';
    config.dias.forEach(dia => html += `<th>${formatDiaName(dia)}</th>`);
    html += '</tr></thead><tbody>';

    if (turma.turno === 'matutino') {
        config.blocos.forEach(bloco => {
            html += `<tr><td class="horario-label">${bloco.inicio} - ${bloco.fim}</td>`;
            config.dias.forEach(dia => {
                const horario = toArray(appData.horarios).find(h => 
                    h.idTurma === turmaId && h.diaSemana === dia && h.bloco === bloco.id
                );
                const corFundo = horario ? getCorPorDisciplina(horario.idDisciplina) : '#ffffff';
                html += `<td class="horario-slot ${horario ? 'ocupado' : ''}" 
                            style="background-color: ${corFundo};"
                            data-turma-id="${turmaId}" 
                            data-dia="${dia}" 
                            data-bloco="${bloco.id}" 
                            onclick="editHorarioSlot('${turmaId}', '${dia}', ${bloco.id})">`;

                if (horario) {
                    const disciplina = appData.disciplinas[horario.idDisciplina];
                    const professor = appData.professores[horario.idProfessor];
                    const sala = appData.salas[horario.idSala];
                    html += `<div class="horario-info">
                                <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                                <div class="professor">${professor?.nome || 'N/A'}</div>
                                <div class="sala">${sala?.nome || 'N/A'}</div>
                             </div>`;
                } else {
                    html += '<div class="horario-vazio">+</div>';
                }
                html += '</td>';
            });
            html += '</tr>';
        });
    } else {
        const maxBlocos = Math.max(...config.dias.map(dia => config.blocos[dia].length));
        for (let i = 0; i < maxBlocos; i++) {
            html += '<tr>';
            const horariosLabels = config.dias.map(dia => {
                const bloco = config.blocos[dia][i];
                return bloco ? `${bloco.inicio} - ${bloco.fim}` : '';
            }).filter(h => h);
            const horarioUnico = [...new Set(horariosLabels)];
            html += `<td class="horario-label">${horarioUnico.join(' / ')}</td>`;

            config.dias.forEach(dia => {
                const bloco = config.blocos[dia][i];
                if (bloco) {
                    const horario = toArray(appData.horarios).find(h => 
                        h.idTurma === turmaId && h.diaSemana === dia && h.bloco === bloco.id
                    );
                    const corFundo = horario ? getCorPorDisciplina(horario.idDisciplina) : '#ffffff';
                    html += `<td class="horario-slot ${horario ? 'ocupado' : ''}" 
                                style="background-color: ${corFundo};"
                                data-turma-id="${turmaId}" 
                                data-dia="${dia}" 
                                data-bloco="${bloco.id}" 
                                onclick="editHorarioSlot('${turmaId}', '${dia}', ${bloco.id})">`;

                    if (horario) {
                        const disciplina = appData.disciplinas[horario.idDisciplina];
                        const professor = appData.professores[horario.idProfessor];
                        const sala = appData.salas[horario.idSala];
                        html += `<div class="horario-info">
                                    <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                                    <div class="professor">${professor?.nome || 'N/A'}</div>
                                    <div class="sala">${sala?.nome || 'N/A'}</div>
                                 </div>`;
                    } else {
                        html += '<div class="horario-vazio">+</div>';
                    }
                    html += '</td>';
                } else {
                    html += '<td class="horario-slot disabled"></td>';
                }
            });
            html += '</tr>';
        }
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

// [As demais funções de horários permanecem como no seu código original]

// Impressão - Funcionalidades atualizadas com cores
function initImpressao() {
    const printTurmaBtn = document.getElementById('btn-print-turma');
    const printProfessorBtn = document.getElementById('btn-print-professor');
    
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
}

function generateTurmaPrint(turmaId) {
    const turma = appData.turmas[turmaId];
    if (!turma) return;

    const getCorPorDisciplina = (idDisciplina) => {
        if (!idDisciplina) return '#ffffff';
        const hash = idDisciplina.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 85%)`;
    };

    const preview = document.getElementById('print-preview');
    preview.classList.remove('hidden');
    
    const config = HORARIOS_CONFIG[turma.turno];
    const horariosData = toArray(appData.horarios).filter(h => h.idTurma === turmaId);
    
    let html = `
        <div class="print-header">
            <h2>Horário de Aulas - ${turma.nome}</h2>
            <p>Curso: Ciências Econômicas - UESC</p>
            <p>Gerado em: ${formatDateTime(new Date())}</p>
        </div>
        
        <table class="grade-horarios print-table">
            <thead>
                <tr>
                    <th>Horário</th>
    `;
    
    config.dias.forEach(dia => {
        html += `<th>${formatDiaName(dia)}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    if (turma.turno === 'matutino') {
        config.blocos.forEach(bloco => {
            html += `<tr><td class="horario-label">${bloco.inicio} - ${bloco.fim}</td>`;
            
            config.dias.forEach(dia => {
                const horario = horariosData.find(h => h.diaSemana === dia && h.bloco === bloco.id);
                const corFundo = horario ? getCorPorDisciplina(horario.idDisciplina) : '#ffffff';
                html += `<td class="horario-cell" style="background-color: ${corFundo};">`;
                
                if (horario) {
                    const disciplina = appData.disciplinas[horario.idDisciplina];
                    const professor = appData.professores[horario.idProfessor];
                    const sala = appData.salas[horario.idSala];
                    
                    html += `
                        <div class="print-horario-info">
                            <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                            <div class="professor">${professor?.nome || 'N/A'}</div>
                            <div class="sala">Sala: ${sala?.nome || 'N/A'}</div>
                        </div>
                    `;
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        });
    } else {
        const maxBlocos = Math.max(...config.dias.map(dia => config.blocos[dia].length));
        
        for (let i = 0; i < maxBlocos; i++) {
            html += '<tr>';
            
            const horarios = config.dias.map(dia => {
                const bloco = config.blocos[dia][i];
                return bloco ? `${bloco.inicio} - ${bloco.fim}` : '';
            }).filter(h => h);
            
            const horarioUnico = [...new Set(horarios)];
            html += `<td class="horario-label">${horarioUnico.join(' / ')}</td>`;
            
            config.dias.forEach(dia => {
                const bloco = config.blocos[dia][i];
                const horario = bloco ? horariosData.find(h => h.diaSemana === dia && h.bloco === bloco.id) : null;
                const corFundo = horario ? getCorPorDisciplina(horario.idDisciplina) : '#ffffff';
                html += `<td class="horario-cell" style="background-color: ${corFundo};">`;
                
                if (bloco && horario) {
                    const disciplina = appData.disciplinas[horario.idDisciplina];
                    const professor = appData.professores[horario.idProfessor];
                    const sala = appData.salas[horario.idSala];
                    
                    html += `
                        <div class="print-horario-info">
                            <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                            <div class="professor">${professor?.nome || 'N/A'}</div>
                            <div class="sala">Sala: ${sala?.nome || 'N/A'}</div>
                        </div>
                    `;
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        }
    }
    
    // Adiciona legenda de cores
    const disciplinasUnicas = [...new Set(horariosData.map(h => h.idDisciplina))];
    if (disciplinasUnicas.length > 0) {
        html += '</tbody></table><div class="color-legend"><h4>Legenda de Disciplinas:</h4><ul>';
        disciplinasUnicas.forEach(idDisciplina => {
            const disciplina = appData.disciplinas[idDisciplina];
            if (disciplina) {
                html += `<li style="background-color: ${getCorPorDisciplina(idDisciplina)};">
                    ${disciplina.nome} (${disciplina.codigo})
                </li>`;
            }
        });
        html += '</ul></div>';
    } else {
        html += '</tbody></table>';
    }
    
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

function generateProfessorPrint(professorId) {
    const professor = appData.professores[professorId];
    if (!professor) return;

    const getCorPorDisciplina = (idDisciplina) => {
        if (!idDisciplina) return '#ffffff';
        const hash = idDisciplina.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 85%)`;
    };

    const preview = document.getElementById('print-preview');
    preview.classList.remove('hidden');
    
    const horariosData = toArray(appData.horarios).filter(h => h.idProfessor === professorId);
    
    const horariosPorTurno = {
        matutino: horariosData.filter(h => {
            const turma = appData.turmas[h.idTurma];
            return turma?.turno === 'matutino';
        }),
        noturno: horariosData.filter(h => {
            const turma = appData.turmas[h.idTurma];
            return turma?.turno === 'noturno';
        })
    };
    
    let html = `
        <div class="print-header">
            <h2>Horário do Professor - ${professor.nome}</h2>
            <p>Curso: Ciências Econômicas - UESC</p>
            <p>Email: ${professor.email || 'Não informado'}</p>
            <p>Gerado em: ${formatDateTime(new Date())}</p>
        </div>
    `;
    
    if (horariosPorTurno.matutino.length > 0) {
        html += '<h3>Turno Matutino</h3>';
        html += generateProfessorTurnoTable('matutino', horariosPorTurno.matutino, getCorPorDisciplina);
    }
    
    if (horariosPorTurno.noturno.length > 0) {
        html += '<h3>Turno Noturno</h3>';
        html += generateProfessorTurnoTable('noturno', horariosPorTurno.noturno, getCorPorDisciplina);
    }
    
    if (horariosData.length === 0) {
        html += '<p class="no-activity">Este professor não possui horários cadastrados.</p>';
    }
    
    const disciplinasUnicas = [...new Set(horariosData.map(h => h.idDisciplina))];
    if (disciplinasUnicas.length > 0) {
        html += '<div class="color-legend"><h4>Legenda de Disciplinas:</h4><ul>';
        disciplinasUnicas.forEach(idDisciplina => {
            const disciplina = appData.disciplinas[idDisciplina];
            if (disciplina) {
                html += `<li style="background-color: ${getCorPorDisciplina(idDisciplina)};">
                    ${disciplina.nome} (${disciplina.codigo})
                </li>`;
            }
        });
        html += '</ul></div>';
    }
    
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

function generateProfessorTurnoTable(turno, horariosData, getCorPorDisciplina) {
    const config = HORARIOS_CONFIG[turno];
    
    let html = `
        <table class="grade-horarios print-table">
            <thead>
                <tr>
                    <th>Horário</th>
    `;
    
    config.dias.forEach(dia => {
        html += `<th>${formatDiaName(dia)}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    if (turno === 'matutino') {
        config.blocos.forEach(bloco => {
            html += `<tr><td class="horario-label">${bloco.inicio} - ${bloco.fim}</td>`;
            
            config.dias.forEach(dia => {
                const horario = horariosData.find(h => h.diaSemana === dia && h.bloco === bloco.id);
                const corFundo = horario ? getCorPorDisciplina(horario.idDisciplina) : '#ffffff';
                html += `<td class="horario-cell" style="background-color: ${corFundo};">`;
                
                if (horario) {
                    const disciplina = appData.disciplinas[horario.idDisciplina];
                    const turma = appData.turmas[horario.idTurma];
                    const sala = appData.salas[horario.idSala];
                    
                    html += `
                        <div class="print-horario-info">
                            <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                            <div class="turma">${turma?.nome || 'N/A'}</div>
                            <div class="sala">Sala: ${sala?.nome || 'N/A'}</div>
                        </div>
                    `;
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        });
    } else {
        const maxBlocos = Math.max(...config.dias.map(dia => config.blocos[dia].length));
        
        for (let i = 0; i < maxBlocos; i++) {
            html += '<tr>';
            
            const horarios = config.dias.map(dia => {
                const bloco = config.blocos[dia][i];
                return bloco ? `${bloco.inicio} - ${bloco.fim}` : '';
            }).filter(h => h);
            
            const horarioUnico = [...new Set(horarios)];
            html += `<td class="horario-label">${horarioUnico.join(' / ')}</td>`;
            
            config.dias.forEach(dia => {
                const bloco = config.blocos[dia][i];
                const horario = bloco ? horariosData.find(h => h.diaSemana === dia && h.bloco === bloco.id) : null;
                const corFundo = horario ? getCorPorDisciplina(horario.idDisciplina) : '#ffffff';
                html += `<td class="horario-cell" style="background-color: ${corFundo};">`;
                
                if (bloco && horario) {
                    const disciplina = appData.disciplinas[horario.idDisciplina];
                    const turma = appData.turmas[horario.idTurma];
                    const sala = appData.salas[horario.idSala];
                    
                    html += `
                        <div class="print-horario-info">
                            <div class="disciplina">${disciplina?.nome || 'N/A'}</div>
                            <div class="turma">${turma?.nome || 'N/A'}</div>
                            <div class="sala">Sala: ${sala?.nome || 'N/A'}</div>
                        </div>
                    `;
                }
                
                html += '</td>';
            });
            
            html += '</tr>';
        }
    }
    
    html += '</tbody></table>';
    return html;
}

function printPage() {
    window.print();
}

function closePrintPreview() {
    const preview = document.getElementById('print-preview');
    preview.classList.add('hidden');
    preview.innerHTML = '';
}

// [As demais funções permanecem como no seu código original]

// ... [todo o restante do seu código] ...

// Initialize app - MOVER ESTA PARTE PARA O FINAL DO ARQUIVO
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o Firebase está carregado
    if (typeof window.firebaseDB !== 'undefined') {
        console.log('Firebase está disponível, inicializando listeners...');
        initFirebaseListeners();
    } else {
        console.error('Firebase não está disponível');
    }

    initNavigation();
    initTabs();
    initProfessores();
    initDisciplinas();
    initTurmas();
    initSalas();
    initHorarios();
    initImpressao();
    
    console.log('Sistema de Gestão de Horários inicializado com sucesso!');
});
