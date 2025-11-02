// Main Application Logic
class TCMApp {
    constructor() {
        this.currentScreen = 'home';
        this.currentPatient = null;
        this.currentVisit = null;
        this.currentSection = 0;
        this.observationData = {};
        this.completedSections = new Set();
        
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

        // Observation navigation
        document.getElementById('btn-prev-section').addEventListener('click', () => this.navigateSection(-1));
        document.getElementById('btn-next-section').addEventListener('click', () => this.navigateSection(1));
        document.getElementById('btn-complete-observation').addEventListener('click', () => this.completeObservation());

        // Results screen
        document.getElementById('btn-new-visit').addEventListener('click', () => this.showScreen('home'));
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${screenId}`).classList.add('active');
        this.currentScreen = screenId;

        if (screenId === 'home') {
            this.currentPatient = null;
            this.currentVisit = null;
            document.getElementById('current-patient-name').textContent = '';
        }
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
            this.startObservation();
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
            this.startObservation();
        } catch (error) {
            alert('Error creating patient: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    startObservation() {
        this.currentSection = 0;
        this.observationData = {};
        this.completedSections.clear();
        this.showScreen('observation');
        this.renderSectionButtons();
        this.renderSection(0);
        this.updateProgress();
    }

    renderSectionButtons() {
        const container = document.getElementById('section-buttons');
        container.innerHTML = OBSERVATION_SECTIONS.map((section, index) => `
            <button class="section-btn ${index === this.currentSection ? 'active' : ''} ${this.completedSections.has(index) ? 'completed' : ''}"
                    onclick="app.goToSection(${index})">
                ${section.icon} ${section.name}
            </button>
        `).join('');
    }

    goToSection(index) {
        this.saveCurrentSection();
        this.currentSection = index;
        this.renderSection(index);
        this.renderSectionButtons();
    }

    renderSection(index) {
        const section = OBSERVATION_SECTIONS[index];
        const content = document.getElementById('observation-content');
        
        let html = `
            <div class="section-content">
                <h3>${section.icon} ${section.name}</h3>
                <form id="observation-form">
        `;

        section.fields.forEach(field => {
            html += this.renderField(field, section.id);
        });

        html += `</form></div>`;
        content.innerHTML = html;

        // Load existing data
        this.loadSectionData(section.id);

        // Update navigation buttons
        document.getElementById('btn-prev-section').style.display = index > 0 ? 'inline-block' : 'none';
        document.getElementById('btn-next-section').style.display = index < OBSERVATION_SECTIONS.length - 1 ? 'inline-block' : 'none';
        document.getElementById('btn-complete-observation').style.display = index === OBSERVATION_SECTIONS.length - 1 ? 'inline-block' : 'none';
    }

    renderField(field, sectionId) {
        const fieldId = `${sectionId}_${field.name}`;
        let html = `<div class="form-section">`;
        
        html += `<h4>${field.label}${field.required ? ' *' : ''}</h4>`;

        if (field.type === 'radio') {
            html += '<div class="radio-group">';
            field.options.forEach(option => {
                html += `
                    <div class="radio-option">
                        <input type="radio" id="${fieldId}_${option.value}" 
                               name="${fieldId}" value="${option.value}"
                               ${field.required ? 'required' : ''}>
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
                               name="${fieldId}" value="${option.value}">
                        <label for="${fieldId}_${option.value}">${option.label}</label>
                    </div>
                `;
            });
            html += '</div>';
        } else if (field.type === 'textarea') {
            html += `<textarea id="${fieldId}" name="${fieldId}" rows="3"></textarea>`;
        }

        html += '</div>';
        return html;
    }

    loadSectionData(sectionId) {
        if (!this.observationData[sectionId]) return;

        const data = this.observationData[sectionId];
        for (const [key, value] of Object.entries(data)) {
            const fieldId = `${sectionId}_${key}`;
            
            if (Array.isArray(value)) {
                // Checkbox
                value.forEach(v => {
                    const checkbox = document.getElementById(`${fieldId}_${v}`);
                    if (checkbox) checkbox.checked = true;
                });
            } else {
                // Radio or textarea
                const radio = document.getElementById(`${fieldId}_${value}`);
                if (radio) {
                    radio.checked = true;
                } else {
                    const textarea = document.getElementById(fieldId);
                    if (textarea) textarea.value = value;
                }
            }
        }
    }

    saveCurrentSection() {
        const section = OBSERVATION_SECTIONS[this.currentSection];
        const formData = {};
        
        section.fields.forEach(field => {
            const fieldId = `${section.id}_${field.name}`;
            
            if (field.type === 'radio') {
                const selected = document.querySelector(`input[name="${fieldId}"]:checked`);
                if (selected) formData[field.name] = selected.value;
            } else if (field.type === 'checkbox') {
                const checked = Array.from(document.querySelectorAll(`input[name="${fieldId}"]:checked`))
                    .map(cb => cb.value);
                if (checked.length > 0) formData[field.name] = checked;
            } else if (field.type === 'textarea') {
                const textarea = document.getElementById(fieldId);
                if (textarea && textarea.value) formData[field.name] = textarea.value;
            }
        });

        this.observationData[section.id] = formData;
        
        // Mark as completed if has data
        if (Object.keys(formData).length > 0) {
            this.completedSections.add(this.currentSection);
        }

        // Save to backend
        this.saveToBackend(section.id, formData);
        this.analyzePatterns();
    }

    async saveToBackend(section, data) {
        try {
            await API.saveObservation(
                this.currentVisit.id,
                section,
                data,
                this.completedSections.has(this.currentSection)
            );
        } catch (error) {
            console.error('Error saving observation:', error);
        }
    }

    navigateSection(direction) {
        this.saveCurrentSection();
        this.currentSection += direction;
        this.renderSection(this.currentSection);
        this.renderSectionButtons();
        this.updateProgress();
    }

    updateProgress() {
        const percentage = (this.completedSections.size / OBSERVATION_SECTIONS.length) * 100;
        document.getElementById('progress-fill').style.width = percentage + '%';
        document.getElementById('progress-percentage').textContent = Math.round(percentage) + '%';
    }

    async analyzePatterns() {
        try {
            const response = await API.analyzePatterns(this.currentVisit.id);
            this.displayPatternAnalysis(response);
        } catch (error) {
            console.error('Error analyzing patterns:', error);
        }
    }

    displayPatternAnalysis(analysis) {
        const container = document.getElementById('pattern-results');
        
        if (!analysis.patterns || analysis.patterns.length === 0) {
            container.innerHTML = '<p style="color: #999;">Enter observations to see pattern analysis...</p>';
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
        document.getElementById('confidence-fill').style.width = confidence + '%';
        document.getElementById('confidence-text').textContent = 
            `${confidence}% - ${confidence < 50 ? 'Insufficient data' : confidence < 70 ? 'Moderate confidence' : 'Strong confidence'}`;
    }

    async completeObservation() {
        this.saveCurrentSection();
        this.showLoading(true);

        try {
            const analysis = await API.analyzePatterns(this.currentVisit.id);
            this.displayFinalResults(analysis);
            this.showScreen('results');
        } catch (error) {
            alert('Error completing observation: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displayFinalResults(analysis) {
        const container = document.getElementById('final-results');
        
        let html = '<h3>Pattern Analysis Results</h3>';
        
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
