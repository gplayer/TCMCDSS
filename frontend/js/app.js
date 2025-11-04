// Main Application Logic - With Module 1 & 2 Integration
class TCMApp {
    constructor() {
        this.currentScreen = 'home';
        this.currentPatient = null;
        this.currentVisit = null;
        this.currentModule = null; // 'observation' or 'interrogation'
        this.currentSection = 0;
        this.observationData = {};
        this.interrogationData = {};
        this.completedSectionsObs = new Set();
        this.completedSectionsInt = new Set();
        this.completedModules = new Set();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('home');
    }

    setupEventListeners() {
        // Home screen
        document.getElementById('btn-new-patient').addEventListener('click', () => this.showScreen('new-patient'));
        document.getElementById('btn-existing-patient').addEventListener('click', () => this.loadPatients());
        document.getElementById('btn-home').addEventListener('click', () => this.showScreen('home'));

        // New patient form
        document.getElementById('form-new-patient').addEventListener('submit', (e) => this.handleNewPatient(e));
        document.getElementById('btn-cancel-patient').addEventListener('click', () => this.showScreen('home'));

        // Module selection
        document.getElementById('btn-cancel-module').addEventListener('click', () => this.showScreen('home'));
        document.getElementById('btn-view-analysis').addEventListener('click', () => this.viewCompleteAnalysis());

        // Observation navigation
        document.getElementById('btn-prev-section-obs').addEventListener('click', () => this.navigateSection(-1, 'observation'));
        document.getElementById('btn-next-section-obs').addEventListener('click', () => this.navigateSection(1, 'observation'));
        document.getElementById('btn-complete-observation').addEventListener('click', () => this.completeModule('observation'));

        // Interrogation navigation
        document.getElementById('btn-prev-section-int').addEventListener('click', () => this.navigateSection(-1, 'interrogation'));
        document.getElementById('btn-next-section-int').addEventListener('click', () => this.navigateSection(1, 'interrogation'));
        document.getElementById('btn-complete-interrogation').addEventListener('click', () => this.completeModule('interrogation'));

        // Results screen
        document.getElementById('btn-back-to-modules').addEventListener('click', () => this.showScreen('module-select'));
        document.getElementById('btn-new-visit').addEventListener('click', () => this.showScreen('home'));
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${screenId}`).classList.add('active');
        this.currentScreen = screenId;

        if (screenId === 'home') {
            this.currentPatient = null;
            this.currentVisit = null;
            this.completedModules.clear();
            document.getElementById('current-patient-name').textContent = '';
        }

        if (screenId === 'module-select') {
            this.updateModuleStatus();
        }
    }

    updateModuleStatus() {
        // Update observation status
        const obsStatus = document.getElementById('status-observation');
        if (this.completedModules.has('observation')) {
            obsStatus.textContent = 'Completed';
            obsStatus.classList.add('completed');
        } else if (this.completedSectionsObs.size > 0) {
            obsStatus.textContent = 'In Progress';
            obsStatus.classList.add('in-progress');
        }

        // Update interrogation status
        const intStatus = document.getElementById('status-interrogation');
        if (this.completedModules.has('interrogation')) {
            intStatus.textContent = 'Completed';
            intStatus.classList.add('completed');
        } else if (this.completedSectionsInt.size > 0) {
            intStatus.textContent = 'In Progress';
            intStatus.classList.add('in-progress');
        }

        // Show analysis button if any module completed
        const viewBtn = document.getElementById('btn-view-analysis');
        viewBtn.style.display = this.completedModules.size > 0 ? 'inline-block' : 'none';
    }

    showLoading(show) {
        document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
    }

    async loadPatients() {
        this.showLoading(true);
        try {
            const response = await API.getPatients();
            this.displayPatients(response.patients);
        } catch (error) {
            alert('Error loading patients: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displayPatients(patients) {
        const container = document.getElementById('patients-container');
        const list = document.getElementById('patients-list');
        
        if (patients.length === 0) {
            container.innerHTML = '<p>No patients found. Create a new patient to get started.</p>';
        } else {
            container.innerHTML = patients.map(p => `
                <div class="patient-card" onclick="app.selectPatient(${p.id})">
                    <div class="patient-name">${p.name}</div>
                    <div class="patient-info">
                        ${p.gender ? p.gender : ''} ${p.date_of_birth ? '• DOB: ' + p.date_of_birth : ''}
                    </div>
                </div>
            `).join('');
        }
        
        list.style.display = 'block';
    }

    async selectPatient(patientId) {
        this.showLoading(true);
        try {
            const response = await API.getPatient(patientId);
            this.currentPatient = response.patient;
            
            // Create new visit
            const chiefComplaint = prompt('Chief Complaint:');
            if (chiefComplaint === null) return;
            
            const visitResponse = await API.createVisit(patientId, chiefComplaint);
            this.currentVisit = { id: visitResponse.visit_id, chief_complaint: chiefComplaint };
            
            document.getElementById('current-patient-name').textContent = this.currentPatient.name;
            this.showScreen('module-select');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleNewPatient(e) {
        e.preventDefault();
        this.showLoading(true);

        try {
            const patientData = {
                name: document.getElementById('patient-name').value,
                date_of_birth: document.getElementById('patient-dob').value || null,
                gender: document.getElementById('patient-gender').value || null,
                phone: document.getElementById('patient-phone').value || null,
                email: document.getElementById('patient-email').value || null
            };

            const response = await API.createPatient(patientData);
            this.currentPatient = { id: response.patient_id, ...patientData };

            const chiefComplaint = document.getElementById('chief-complaint').value || null;
            const visitResponse = await API.createVisit(response.patient_id, chiefComplaint);
            this.currentVisit = { id: visitResponse.visit_id, chief_complaint: chiefComplaint };

            document.getElementById('current-patient-name').textContent = patientData.name;
            this.showScreen('module-select');
        } catch (error) {
            alert('Error creating patient: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    startModule(moduleName) {
        this.currentModule = moduleName;
        this.currentSection = 0;
        
        if (moduleName === 'observation') {
            this.showScreen('observation');
            this.renderSectionButtons('observation');
            this.renderSection(0, 'observation');
            this.updateProgress('observation');
        } else if (moduleName === 'interrogation') {
            this.showScreen('interrogation');
            this.renderSectionButtons('interrogation');
            this.renderSection(0, 'interrogation');
            this.updateProgress('interrogation');
        }
    }

    renderSectionButtons(module) {
        const sections = module === 'observation' ? OBSERVATION_SECTIONS : INTERROGATION_SECTIONS;
        const container = document.getElementById(`section-buttons-${module === 'observation' ? 'obs' : 'int'}`);
        const completedSections = module === 'observation' ? this.completedSectionsObs : this.completedSectionsInt;
        
        container.innerHTML = sections.map((section, index) => `
            <button class="section-btn ${index === this.currentSection ? 'active' : ''} ${completedSections.has(index) ? 'completed' : ''}"
                    onclick="app.goToSection(${index}, '${module}')">
                ${section.title}
            </button>
        `).join('');
    }

    goToSection(index, module) {
        this.saveCurrentSection();
        this.currentSection = index;
        this.renderSection(index, module);
        this.renderSectionButtons(module);
    }

    renderSection(index, module) {
        const sections = module === 'observation' ? OBSERVATION_SECTIONS : INTERROGATION_SECTIONS;
        const section = sections[index];
        const contentId = module === 'observation' ? 'observation-content' : 'interrogation-content';
        const content = document.getElementById(contentId);
        
        let html = `
            <div class="section-content">
                <h3>${section.title}</h3>
                <p class="section-description">${section.description}</p>
                <form id="${module}-form">
        `;

        section.fields.forEach(field => {
            html += this.renderField(field, section.id, module);
        });

        html += `</form></div>`;
        content.innerHTML = html;

        // Load existing data
        this.loadSectionData(section.id, module);

        // Update navigation buttons
        const suffix = module === 'observation' ? 'obs' : 'int';
        document.getElementById(`btn-prev-section-${suffix}`).style.display = index > 0 ? 'inline-block' : 'none';
        document.getElementById(`btn-next-section-${suffix}`).style.display = index < sections.length - 1 ? 'inline-block' : 'none';
        document.getElementById(`btn-complete-${module}`).style.display = index === sections.length - 1 ? 'inline-block' : 'none';
    }

    renderField(field, sectionId, module) {
        const fieldId = `${module}_${sectionId}_${field.id}`;
        let html = `<div class="form-section">`;
        
        html += `<h4>${field.label}</h4>`;

        if (field.type === 'select') {
            html += `<select id="${fieldId}" name="${fieldId}" onchange="app.saveCurrentSection()">`;
            field.options.forEach(option => {
                html += `<option value="${option}">${option}</option>`;
            });
            html += '</select>';
        } else if (field.type === 'multiselect') {
            html += '<div class="checkbox-group">';
            field.options.forEach(option => {
                const optionId = option.replace(/[^a-zA-Z0-9]/g, '_');
                html += `
                    <div class="checkbox-option">
                        <input type="checkbox" id="${fieldId}_${optionId}" 
                               name="${fieldId}" value="${option}"
                               onchange="app.saveCurrentSection()">
                        <label for="${fieldId}_${optionId}">${option}</label>
                    </div>
                `;
            });
            html += '</div>';
        } else if (field.type === 'textarea') {
            html += `<textarea id="${fieldId}" name="${fieldId}" rows="3" onchange="app.saveCurrentSection()"></textarea>`;
        } else if (field.type === 'radio') {
            html += '<div class="radio-group">';
            field.options.forEach(option => {
                html += `
                    <div class="radio-option">
                        <input type="radio" id="${fieldId}_${option.value}" 
                               name="${fieldId}" value="${option.value}"
                               onchange="app.saveCurrentSection()">
                        <label for="${fieldId}_${option.value}">${option.label}</label>
                    </div>
                `;
            });
            html += '</div>';
        } else if (field.type === 'checkbox') {
            html += '<div class="checkbox-group">';
            field.options.forEach(option => {
                html += `
                    <div class="checkbox-option">
                        <input type="checkbox" id="${fieldId}_${option.value}" 
                               name="${fieldId}" value="${option.value}"
                               onchange="app.saveCurrentSection()">
                        <label for="${fieldId}_${option.value}">${option.label}</label>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    loadSectionData(sectionId, module) {
        const data = module === 'observation' ? this.observationData : this.interrogationData;
        if (!data[sectionId]) return;

        const sectionData = data[sectionId];
        for (const [key, value] of Object.entries(sectionData)) {
            const fieldId = `${module}_${sectionId}_${key}`;
            
            if (Array.isArray(value)) {
                // Multiselect checkbox
                value.forEach(v => {
                    const optionId = v.replace(/[^a-zA-Z0-9]/g, '_');
                    const checkbox = document.getElementById(`${fieldId}_${optionId}`);
                    if (checkbox) checkbox.checked = true;
                });
            } else {
                // Select dropdown or textarea
                const select = document.getElementById(fieldId);
                if (select && select.tagName === 'SELECT') {
                    select.value = value;
                } else if (select && select.tagName === 'TEXTAREA') {
                    select.value = value;
                } else {
                    // Radio button
                    const radio = document.getElementById(`${fieldId}_${value}`);
                    if (radio) radio.checked = true;
                }
            }
        }
    }

    saveCurrentSection() {
        if (!this.currentModule) return;

        const sections = this.currentModule === 'observation' ? OBSERVATION_SECTIONS : INTERROGATION_SECTIONS;
        const section = sections[this.currentSection];
        const formData = {};
        
        section.fields.forEach(field => {
            const fieldId = `${this.currentModule}_${section.id}_${field.id}`;
            
            if (field.type === 'select') {
                const select = document.getElementById(fieldId);
                if (select && select.value) formData[field.id] = select.value;
            } else if (field.type === 'multiselect') {
                const checked = Array.from(document.querySelectorAll(`input[name="${fieldId}"]:checked`))
                    .map(cb => cb.value);
                if (checked.length > 0) formData[field.id] = checked;
            } else if (field.type === 'textarea') {
                const textarea = document.getElementById(fieldId);
                if (textarea && textarea.value) formData[field.id] = textarea.value;
            } else if (field.type === 'radio') {
                const selected = document.querySelector(`input[name="${fieldId}"]:checked`);
                if (selected) formData[field.id] = selected.value;
            } else if (field.type === 'checkbox') {
                const checked = Array.from(document.querySelectorAll(`input[name="${fieldId}"]:checked`))
                    .map(cb => cb.value);
                if (checked.length > 0) formData[field.id] = checked;
            }
        });

        if (this.currentModule === 'observation') {
            this.observationData[section.id] = formData;
            if (Object.keys(formData).length > 0) {
                this.completedSectionsObs.add(this.currentSection);
            }
        } else {
            this.interrogationData[section.id] = formData;
            if (Object.keys(formData).length > 0) {
                this.completedSectionsInt.add(this.currentSection);
            }
        }

        // Save to backend
        this.saveToBackend(section.id, formData, this.currentModule);
        this.analyzePatterns(this.currentModule);
    }

    async saveToBackend(section, data, module) {
        try {
            if (module === 'observation') {
                await API.saveObservation(
                    this.currentVisit.id,
                    section,
                    data,
                    this.completedSectionsObs.has(this.currentSection)
                );
            } else if (module === 'interrogation') {
                await API.saveInterrogation(
                    this.currentVisit.id,
                    section,
                    data,
                    this.completedSectionsInt.has(this.currentSection)
                );
            }
        } catch (error) {
            console.error(`Error saving ${module}:`, error);
        }
    }

    navigateSection(direction, module) {
        this.saveCurrentSection();
        this.currentSection += direction;
        this.renderSection(this.currentSection, module);
        this.renderSectionButtons(module);
        this.updateProgress(module);
    }

    updateProgress(module) {
        const sections = module === 'observation' ? OBSERVATION_SECTIONS : INTERROGATION_SECTIONS;
        const completedSections = module === 'observation' ? this.completedSectionsObs : this.completedSectionsInt;
        const percentage = (completedSections.size / sections.length) * 100;
        const suffix = module === 'observation' ? 'obs' : 'int';
        
        document.getElementById(`progress-fill-${suffix}`).style.width = percentage + '%';
        document.getElementById(`progress-percentage-${suffix}`).textContent = Math.round(percentage) + '%';
    }

    async analyzePatterns(module) {
        try {
            const response = await API.analyzePatterns(this.currentVisit.id);
            this.displayPatternAnalysis(response, module);
        } catch (error) {
            console.error('Error analyzing patterns:', error);
        }
    }

    displayPatternAnalysis(analysis, module) {
        const suffix = module === 'observation' ? '' : '-int';
        const container = document.getElementById(`pattern-results${suffix}`);
        
        if (!analysis.patterns || analysis.patterns.length === 0) {
            container.innerHTML = '<p style="color: #999;">Enter data to see pattern analysis...</p>';
            return;
        }

        let html = '';
        
        // Show top 3 patterns
        analysis.patterns.slice(0, 3).forEach((pattern, index) => {
            const isPrimary = index === 0;
            html += `
                <div class="pattern-item ${isPrimary ? 'primary' : 'secondary'}">
                    <div class="pattern-header">
                        <span class="pattern-name">${index + 1}. ${pattern.name}</span>
                        <span class="pattern-confidence">${pattern.confidence}%</span>
                    </div>
                    <div class="pattern-evidence">
                        ${pattern.supporting_evidence.slice(0, 3).map(e => 
                            `<div class="evidence-item">${e}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Update confidence meter
        const confidence = analysis.overall_confidence;
        document.getElementById(`confidence-fill${suffix}`).style.width = confidence + '%';
        document.getElementById(`confidence-text${suffix}`).textContent = 
            `${confidence}% - ${confidence < 50 ? 'Insufficient data' : confidence < 70 ? 'Moderate confidence' : 'Strong confidence'}`;
    }

    async completeModule(module) {
        this.saveCurrentSection();
        this.completedModules.add(module);
        this.showLoading(true);

        try {
            const analysis = await API.analyzePatterns(this.currentVisit.id);
            alert(`${module === 'observation' ? 'Observation' : 'Interrogation'} module completed! You can now continue with other modules or view the complete analysis.`);
            this.showScreen('module-select');
        } catch (error) {
            alert('Error completing module: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async viewCompleteAnalysis() {
        this.showLoading(true);
        try {
            const analysis = await API.analyzePatterns(this.currentVisit.id);
            this.displayFinalResults(analysis);
            this.showScreen('results');
        } catch (error) {
            alert('Error loading analysis: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displayFinalResults(analysis) {
        const container = document.getElementById('final-results');
        
        let html = '<h3>Pattern Analysis Results</h3>';
        
        // Module completion status
        html += '<div class="completion-status">';
        html += '<h4>Completed Modules:</h4>';
        html += '<ul>';
        if (this.completedModules.has('observation')) html += '<li>✓ Module 1: Observation</li>';
        if (this.completedModules.has('interrogation')) html += '<li>✓ Module 2: Interrogation</li>';
        html += '</ul></div>';
        
        html += `<div class="confidence-card">
            <h4>Overall Diagnostic Confidence: ${analysis.overall_confidence}%</h4>
        </div>`;

        if (analysis.patterns && analysis.patterns.length > 0) {
            html += '<h3>Identified Patterns:</h3>';
            
            analysis.patterns.forEach((pattern, index) => {
                html += `
                    <div class="result-pattern">
                        <h3>${index + 1}. ${pattern.name}</h3>
                        <div class="confidence">${pattern.confidence}% Confidence</div>
                        <p><strong>Category:</strong> ${pattern.category}</p>
                        <p><strong>Description:</strong> ${pattern.description}</p>
                        <p><strong>Treatment Principle:</strong> ${pattern.treatment_principle}</p>
                        
                        <h4>Supporting Evidence:</h4>
                        <ul>
                            ${pattern.supporting_evidence.map(e => `<li>${e}</li>`).join('')}
                        </ul>
                        
                        <h4>Recommended Acupuncture Points:</h4>
                        <p>${pattern.common_points.join(', ')}</p>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }
}

// Initialize app
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new TCMApp();
});