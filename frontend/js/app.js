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

        // Chief Complaint form
        document.getElementById('form-chief-complaint').addEventListener('submit', (e) => this.handleChiefComplaint(e));
        document.getElementById('btn-cancel-chief-complaint').addEventListener('click', () => this.showScreen('module-select'));

        // TCM Profile refresh buttons
        document.getElementById('btn-refresh-profile-obs').addEventListener('click', () => this.refreshTCMProfile('observation'));
        document.getElementById('btn-refresh-profile-int').addEventListener('click', () => this.refreshTCMProfile('interrogation'));

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
        // Update chief complaint status
        const ccStatus = document.getElementById('status-chief-complaint');
        if (this.completedModules.has('chief-complaint')) {
            ccStatus.textContent = 'Completed';
            ccStatus.classList.add('completed');
        }

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
            
            // Get patient's visits
            const visitsResponse = await API.getPatientVisits(patientId);
            const visits = visitsResponse.visits || [];
            
            document.getElementById('current-patient-name').textContent = this.currentPatient.name;
            
            if (visits.length > 0) {
                // Show visit selection dialog
                this.displayVisitSelection(visits);
            } else {
                // No existing visits, create new one
                await this.createNewVisit(patientId);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async createNewVisit(patientId) {
        try {
            const visitResponse = await API.createVisit(patientId, null);
            this.currentVisit = { id: visitResponse.visit_id };
            this.showScreen('module-select');
        } catch (error) {
            alert('Error creating visit: ' + error.message);
        }
    }

    displayVisitSelection(visits) {
        const container = document.getElementById('patients-container');
        const list = document.getElementById('patients-list');
        
        let html = `<h3>Select Visit for ${this.currentPatient.name}</h3>`;
        html += '<div class="visit-cards">';
        
        // Show existing visits (most recent first)
        visits.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
        
        visits.forEach((visit, index) => {
            const date = new Date(visit.visit_date);
            const dateStr = date.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const chiefComplaintPreview = visit.chief_complaint 
                ? visit.chief_complaint.substring(0, 60) + (visit.chief_complaint.length > 60 ? '...' : '')
                : 'No chief complaint';
            
            const statusBadge = visit.status === 'completed' 
                ? '<span style="color: #4caf50;">●</span> Completed'
                : '<span style="color: #ff9800;">●</span> In Progress';
            
            html += `
                <div class="patient-card visit-card" onclick="app.selectVisit(${visit.id})">
                    <div class="patient-name">
                        ${index === 0 ? '<span style="background: #4caf50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.75rem; margin-right: 0.5rem;">LATEST</span>' : ''}
                        Visit ${visits.length - index}
                    </div>
                    <div class="patient-info" style="font-size: 0.85rem; margin-top: 0.3rem;">
                        📅 ${dateStr}
                    </div>
                    <div class="patient-info" style="font-size: 0.8rem; color: #666; margin-top: 0.3rem; font-style: italic;">
                        ${chiefComplaintPreview}
                    </div>
                    <div class="patient-info" style="margin-top: 0.5rem; font-weight: 600;">
                        ${statusBadge}
                    </div>
                </div>
            `;
        });
        
        // Add "New Visit" button
        html += `
            <div class="patient-card visit-card new-visit-card" onclick="app.createNewVisit(${this.currentPatient.id})">
                <div class="patient-name">+ Create New Visit</div>
                <div class="patient-info">Start fresh diagnostic session</div>
            </div>
        `;
        
        html += '</div>';
        html += '<button class="btn btn-secondary" onclick="app.loadPatients()" style="margin-top: 1rem;">← Back to Patients</button>';
        
        container.innerHTML = html;
        list.style.display = 'block';
    }

    async selectVisit(visitId) {
        this.showLoading(true);
        try {
            this.currentVisit = { id: visitId };
            
            // TODO: Load existing module completion status
            // For now, just go to module selection
            this.showScreen('module-select');
        } catch (error) {
            alert('Error loading visit: ' + error.message);
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

            // Create visit without chief complaint (will be added via Chief Complaint module)
            const visitResponse = await API.createVisit(response.patient_id, null);
            this.currentVisit = { id: visitResponse.visit_id };

            document.getElementById('current-patient-name').textContent = patientData.name;
            this.showScreen('module-select');
        } catch (error) {
            alert('Error creating patient: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async loadChiefComplaint() {
        if (!this.currentVisit) return;
        
        this.showLoading(true);
        try {
            const response = await API.getChiefComplaint(this.currentVisit.id);
            const data = response.chief_complaint;
            
            if (data) {
                document.getElementById('western-conditions').value = data.western_conditions || '';
                document.getElementById('primary-concern').value = data.primary_concern || '';
                document.getElementById('recent-symptoms').value = data.recent_symptoms || '';
            }
        } catch (error) {
            // If no data exists yet, that's fine - form starts empty
            console.log('No existing chief complaint data');
        } finally {
            this.showLoading(false);
        }
    }

    async handleChiefComplaint(e) {
        e.preventDefault();
        
        if (!this.currentVisit) {
            alert('No active visit. Please create a patient first.');
            return;
        }

        this.showLoading(true);
        try {
            const chiefComplaintData = {
                western_conditions: document.getElementById('western-conditions').value.trim(),
                primary_concern: document.getElementById('primary-concern').value.trim(),
                recent_symptoms: document.getElementById('recent-symptoms').value.trim()
            };

            await API.saveChiefComplaint(this.currentVisit.id, chiefComplaintData);
            this.completedModules.add('chief-complaint');
            
            alert('Chief Complaint saved successfully!');
            this.showScreen('module-select');
        } catch (error) {
            alert('Error saving chief complaint: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    startModule(moduleName) {
        this.currentModule = moduleName;
        this.currentSection = 0;
        
        if (moduleName === 'chief-complaint') {
            this.showScreen('chief-complaint');
            this.loadChiefComplaint();
        } else if (moduleName === 'observation') {
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
            // Fetch both pattern analysis and TCM profile
            const [analysis, tcmResponse] = await Promise.all([
                API.analyzePatterns(this.currentVisit.id),
                API.getTCMProfile(this.currentVisit.id)
            ]);
            
            // Display TCM Profile first
            const tcmContainer = document.getElementById('results-tcm-profile');
            this.displayTCMProfile(tcmResponse.tcm_profile, tcmContainer);
            
            // Then display pattern results
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
        
        let html = '';
        
        // Module completion status
        html += '<div class="completion-status">';
        html += '<h4>Completed Modules:</h4>';
        html += '<ul>';
        if (this.completedModules.has('chief-complaint')) html += '<li>✓ Chief Complaint Assessment</li>';
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

    async refreshTCMProfile(module) {
        /**
         * Fetch and display TCM Profile for current visit
         */
        if (!this.currentVisit) return;

        const suffix = module === 'observation' ? 'obs' : 'int';
        const container = document.getElementById(`tcm-profile-${suffix}`);
        
        this.showLoading(true);
        try {
            const response = await API.getTCMProfile(this.currentVisit.id);
            const profile = response.tcm_profile;
            
            this.displayTCMProfile(profile, container);
        } catch (error) {
            console.error('Error fetching TCM profile:', error);
            container.innerHTML = '<p class="tcm-profile-empty">Error loading TCM profile. Please try again.</p>';
        } finally {
            this.showLoading(false);
        }
    }

    displayTCMProfile(profile, container) {
        /**
         * Render TCM Profile in the specified container
         */
        if (!profile || profile.data_completeness === 0) {
            container.innerHTML = '<p class="tcm-profile-empty">Complete data collection to generate TCM profile</p>';
            return;
        }

        let html = '';

        // Data Completeness
        html += `
            <div class="tcm-section">
                <div class="tcm-section-title">Data Completeness</div>
                <div class="tcm-completeness">
                    <div class="tcm-completeness-bar">
                        <div class="tcm-completeness-fill" style="width: ${profile.data_completeness}%"></div>
                    </div>
                    <div class="tcm-completeness-text">${profile.data_completeness}%</div>
                </div>
            </div>
        `;

        // Eight Principles
        if (profile.eight_principles) {
            const ep = profile.eight_principles;
            html += `
                <div class="tcm-section">
                    <div class="tcm-section-title">Eight Principles (八纲辨证)</div>
                    <div class="tcm-badges">
                        ${this.getTCMBadge(ep.interior_exterior, 'neutral', 'Interior/Exterior')}
                        ${this.getTCMBadge(ep.hot_cold, ep.hot_cold === 'hot' ? 'hot' : ep.hot_cold === 'cold' ? 'cold' : 'neutral', 'Hot/Cold')}
                        ${this.getTCMBadge(ep.excess_deficiency, ep.excess_deficiency === 'excess' ? 'excess' : ep.excess_deficiency === 'deficiency' ? 'deficiency' : 'neutral', 'Excess/Deficiency')}
                        ${this.getTCMBadge(ep.yin_yang, ep.yin_yang === 'yin' ? 'yin' : ep.yin_yang === 'yang' ? 'yang' : 'neutral', 'Yin/Yang')}
                    </div>
                </div>
            `;
        }

        // Affected Organs
        if (profile.affected_organs && profile.affected_organs.length > 0) {
            html += `
                <div class="tcm-section">
                    <div class="tcm-section-title">Affected Organs (脏腑辨证)</div>
                    <div class="tcm-badges">
                        ${profile.affected_organs.map(organ => 
                            `<span class="tcm-badge tcm-badge-organ">${organ}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        // Pathogenic Factors
        if (profile.pathogenic_factors && profile.pathogenic_factors.length > 0) {
            html += `
                <div class="tcm-section">
                    <div class="tcm-section-title">Pathogenic Factors (病因)</div>
                    <div class="tcm-badges">
                        ${profile.pathogenic_factors.map(factor => 
                            `<span class="tcm-badge tcm-badge-pathogen">${factor}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        // Qi/Blood/Fluids
        if (profile.qi_blood_fluids) {
            const qbf = profile.qi_blood_fluids;
            html += `
                <div class="tcm-section">
                    <div class="tcm-section-title">Qi / Blood / Fluids</div>
                    <div class="tcm-badges">
                        <span class="tcm-badge tcm-badge-neutral">Qi: ${qbf.qi}</span>
                        <span class="tcm-badge tcm-badge-neutral">Blood: ${qbf.blood}</span>
                        <span class="tcm-badge tcm-badge-neutral">Fluids: ${qbf.fluids}</span>
                    </div>
                </div>
            `;
        }

        // Key Manifestations
        if (profile.key_manifestations && profile.key_manifestations.length > 0) {
            html += `
                <div class="tcm-section">
                    <div class="tcm-section-title">Key Manifestations</div>
                    <ul class="tcm-manifestations">
                        ${profile.key_manifestations.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Reasoning Notes (collapsible)
        if (profile.reasoning_notes && profile.reasoning_notes.length > 0) {
            html += `
                <div class="tcm-section">
                    <div class="tcm-section-title">Reasoning Process</div>
                    <div class="tcm-reasoning-notes">
                        ${profile.reasoning_notes.map(note => `<p>• ${note}</p>`).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    getTCMBadge(value, type, label) {
        /**
         * Generate HTML for a TCM badge
         */
        const displayValue = value.charAt(0).toUpperCase() + value.slice(1);
        return `<span class="tcm-badge tcm-badge-${type}" title="${label}">${displayValue}</span>`;
    }
}

// Initialize app
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new TCMApp();
});