// Main Application Logic - With Module 1 & 2 Integration
class TCMApp {
    constructor() {
        this.currentScreen = 'login';
        this.currentPatient = null;
        this.currentVisit = null;
        this.currentModule = null; // 'observation' or 'interrogation'
        this.currentSection = 0;
        this.observationData = {};
        this.interrogationData = {};
        this.completedSectionsObs = new Set();
        this.completedSectionsInt = new Set();
        this.completedModules = new Set();
        this.isAuthenticated = false;
        this.systemPassword = '#*TCMcdss42'; // System password
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('login');
    }

    setupEventListeners() {
        // Login form
        document.getElementById('form-login').addEventListener('submit', (e) => this.handleLogin(e));

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
        document.getElementById('btn-export-pdf').addEventListener('click', () => this.exportPatientReportPDF());
    }

    handleLogin(e) {
        e.preventDefault();
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        
        if (password === this.systemPassword) {
            this.isAuthenticated = true;
            errorDiv.style.display = 'none';
            this.showScreen('home');
            document.getElementById('login-password').value = ''; // Clear password field
        } else {
            errorDiv.style.display = 'block';
            document.getElementById('login-password').value = '';
            document.getElementById('login-password').focus();
        }
    }

    showScreen(screenId) {
        // Prevent access to screens without authentication
        if (!this.isAuthenticated && screenId !== 'login') {
            return;
        }
        
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
            container.innerHTML = patients.map(p => {
                const dob = p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }) : 'Not provided';
                const gender = p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : 'Not specified';
                
                return `
                <div class="patient-card" onclick="app.selectPatient(${p.id})">
                    <div class="patient-name">👤 ${p.name}</div>
                    <div class="patient-info"><strong>DOB:</strong> ${dob}</div>
                    <div class="patient-info"><strong>Gender:</strong> ${gender}</div>
                </div>
                `;
            }).join('');
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
            console.log('🔍 Loading visit:', visitId);
            this.currentVisit = { id: visitId };
            
            // Reset state
            this.observationData = {};
            this.interrogationData = {};
            this.completedSectionsObs.clear();
            this.completedSectionsInt.clear();
            this.completedModules.clear();
            
            // Load existing data to determine module completion status
            const [chiefComplaint, observations, interrogations] = await Promise.all([
                API.getChiefComplaint(visitId).catch(() => null),
                API.getObservations(visitId).catch(() => ({ observations: {} })),
                API.getInterrogations(visitId).catch(() => ({ interrogations: {} }))
            ]);
            
            console.log('📥 Data received:');
            console.log('  Chief Complaint:', chiefComplaint);
            console.log('  Observations:', observations);
            console.log('  Interrogations:', interrogations);
            
            // Check chief complaint completion
            if (chiefComplaint && chiefComplaint.chief_complaint && 
                chiefComplaint.chief_complaint.primary_concern) {
                this.completedModules.add('chief-complaint');
            }
            
            // Load observation data into memory
            const obsData = observations.observations || {};
            const obsCount = Object.keys(obsData).length;
            console.log(`📊 Observation sections found: ${obsCount}`, Object.keys(obsData));
            
            // Store observation data for each section
            Object.keys(obsData).forEach((sectionKey) => {
                this.observationData[sectionKey] = obsData[sectionKey].data;
                console.log(`  ✓ Loaded ${sectionKey}:`, obsData[sectionKey].data);
                if (obsData[sectionKey].completed) {
                    // Find section index by key
                    const sectionIndex = OBSERVATION_SECTIONS.findIndex(s => s.id === sectionKey);
                    if (sectionIndex >= 0) {
                        this.completedSectionsObs.add(sectionIndex);
                        console.log(`    ✓ Marked section ${sectionIndex} (${sectionKey}) as completed`);
                    }
                }
            });
            
            if (obsCount >= 12) { // All 12 sections completed
                this.completedModules.add('observation');
                console.log('✅ Observation module marked as COMPLETED');
            }
            
            // Load interrogation data into memory
            const intData = interrogations.interrogations || {};
            const intCount = Object.keys(intData).length;
            console.log(`📊 Interrogation sections found: ${intCount}`, Object.keys(intData));
            
            // Store interrogation data for each section
            Object.keys(intData).forEach((sectionKey) => {
                this.interrogationData[sectionKey] = intData[sectionKey].data;
                console.log(`  ✓ Loaded ${sectionKey}:`, intData[sectionKey].data);
                if (intData[sectionKey].completed) {
                    // Find section index by key
                    const sectionIndex = INTERROGATION_SECTIONS.findIndex(s => s.id === sectionKey);
                    if (sectionIndex >= 0) {
                        this.completedSectionsInt.add(sectionIndex);
                        console.log(`    ✓ Marked section ${sectionIndex} (${sectionKey}) as completed`);
                    }
                }
            });
            
            if (intCount >= 12) { // All 12 sections completed
                this.completedModules.add('interrogation');
                console.log('✅ Interrogation module marked as COMPLETED');
            }

            
            console.log('💾 Final state:');
            console.log('  observationData keys:', Object.keys(this.observationData));
            console.log('  interrogationData keys:', Object.keys(this.interrogationData));
            console.log('  completedSectionsObs:', Array.from(this.completedSectionsObs));
            console.log('  completedSectionsInt:', Array.from(this.completedSectionsInt));
            console.log('  completedModules:', Array.from(this.completedModules));
            
            console.log('💾 Final state:');
            console.log('  observationData keys:', Object.keys(this.observationData));
            console.log('  interrogationData keys:', Object.keys(this.interrogationData));
            console.log('  completedSectionsObs:', Array.from(this.completedSectionsObs));
            console.log('  completedSectionsInt:', Array.from(this.completedSectionsInt));
            console.log('  completedModules:', Array.from(this.completedModules));
            
            this.showScreen('module-select');
        } catch (error) {
            console.error('❌ Error loading visit:', error);
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
        
        // Check if this section has existing data
        const data = module === 'observation' ? this.observationData : this.interrogationData;
        const hasExistingData = data[section.id] && Object.keys(data[section.id]).length > 0;
        const editModeIndicator = hasExistingData 
            ? '<div style="background: #ffe0b2; padding: 8px; border-radius: 4px; margin-bottom: 10px; font-size: 0.9em;">✏️ <strong>Edit Mode:</strong> This section contains existing data. You can modify any field and changes will be saved automatically.</div>' 
            : '';
        
        let html = `
            <div class="section-content">
                <h3>${section.title}</h3>
                <p class="section-description">${section.description}</p>
                ${editModeIndicator}
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
        console.log(`🔄 loadSectionData called: module=${module}, sectionId=${sectionId}`);
        console.log('  Available data:', Object.keys(data));
        
        if (!data[sectionId]) {
            console.log(`  ⚠️  No data found for section "${sectionId}"`);
            return;
        }

        const sectionData = data[sectionId];
        console.log(`  📝 Loading ${Object.keys(sectionData).length} fields:`, sectionData);
        
        for (const [key, value] of Object.entries(sectionData)) {
            const fieldId = `${module}_${sectionId}_${key}`;
            
            if (Array.isArray(value)) {
                // Multiselect checkbox
                console.log(`    Loading multiselect ${key}:`, value);
                value.forEach(v => {
                    const optionId = v.replace(/[^a-zA-Z0-9]/g, '_');
                    const checkbox = document.getElementById(`${fieldId}_${optionId}`);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log(`      ✓ Checked: ${fieldId}_${optionId}`);
                    } else {
                        console.log(`      ✗ Not found: ${fieldId}_${optionId}`);
                    }
                });
            } else {
                // Select dropdown or textarea
                const element = document.getElementById(fieldId);
                if (element) {
                    if (element.tagName === 'SELECT') {
                        element.value = value;
                        console.log(`    ✓ Set select ${key} = ${value}`);
                    } else if (element.tagName === 'TEXTAREA') {
                        element.value = value;
                        console.log(`    ✓ Set textarea ${key} = ${value}`);
                    }
                } else {
                    // Radio button
                    const radio = document.getElementById(`${fieldId}_${value}`);
                    if (radio) {
                        radio.checked = true;
                        console.log(`    ✓ Checked radio ${key} = ${value}`);
                    } else {
                        console.log(`    ✗ Radio not found: ${fieldId}_${value}`);
                    }
                }
            }
        }
        console.log(`  ✅ Finished loading section "${sectionId}"`);
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
            console.log('🔍 Analyzing patterns for visit:', this.currentVisit.id);
            const response = await API.analyzePatterns(this.currentVisit.id);
            console.log('📊 Pattern analysis response:', response);
            this.displayPatternAnalysis(response, module);
        } catch (error) {
            console.error('❌ Error analyzing patterns:', error);
        }
    }

    displayPatternAnalysis(analysis, module) {
        const suffix = module === 'observation' ? '' : '-int';
        const container = document.getElementById(`pattern-results${suffix}`);
        
        console.log(`📺 Displaying patterns in container: pattern-results${suffix}`, analysis);
        
        if (!analysis.patterns || analysis.patterns.length === 0) {
            console.log('⚠️  No patterns to display');
            container.innerHTML = '<p style="color: #999;">Enter data to see pattern analysis...</p>';
            return;
        }
        
        console.log(`✅ Displaying ${analysis.patterns.length} patterns`);

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
                        <p><strong>Description:</strong> ${pattern.description}</p>
                        <p><strong>Treatment Principle:</strong> ${pattern.treatment_principle}</p>
                        
                        <h4>Supporting Evidence:</h4>
                        <ul>
                            ${pattern.supporting_evidence.map(e => `<li>${e}</li>`).join('')}
                        </ul>
                        
                        ${pattern.herbal_formula ? `<p><strong>Herbal Formula:</strong> ${pattern.herbal_formula}</p>` : ''}
                        
                        <h4>Recommended Acupuncture Points:</h4>
                        <p>${pattern.acupuncture_points || 'No specific points recommended'}</p>
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

    async exportPatientReportPDF() {
        if (!this.currentPatient || !this.currentVisit) {
            alert('No patient or visit data available');
            return;
        }

        this.showLoading(true);
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            let yPos = 15;
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            const contentWidth = pageWidth - (2 * margin);
            
            // Company Header
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text('Longenix Health', pageWidth / 2, yPos, { align: 'center' });
            yPos += 8;
            doc.setFontSize(14);
            doc.setFont(undefined, 'normal');
            doc.text('TCM Clinical Decision Support System', pageWidth / 2, yPos, { align: 'center' });
            yPos += 7;
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Patient Diagnostic Report', pageWidth / 2, yPos, { align: 'center' });
            yPos += 12;
            
            // Disclaimer Box
            doc.setFillColor(255, 243, 205);
            doc.rect(margin, yPos, contentWidth, 25, 'F');
            doc.setDrawColor(240, 173, 78);
            doc.rect(margin, yPos, contentWidth, 25, 'S');
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.text('PROFESSIONAL USE ONLY - NOT A MEDICAL DEVICE', pageWidth / 2, yPos + 5, { align: 'center' });
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            const disclaimerText = 'This report is generated by a clinical decision support tool for licensed TCM practitioners. ' +
                                   'It does not constitute medical advice and should not replace professional clinical judgment. ' +
                                   'All diagnostic and treatment decisions must be made by qualified healthcare practitioners.';
            const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
            let disclaimerY = yPos + 10;
            disclaimerLines.forEach(line => {
                doc.text(line, pageWidth / 2, disclaimerY, { align: 'center' });
                disclaimerY += 4;
            });
            yPos += 30;
            
            // Patient Information Section with Table
            doc.setFillColor(52, 152, 219);
            doc.rect(margin, yPos, contentWidth, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('PATIENT INFORMATION', margin + 3, yPos + 5.5);
            doc.setTextColor(0, 0, 0);
            yPos += 10;
            
            // Patient info table
            const patientInfo = [
                ['Name:', this.currentPatient.name],
                ['Date of Birth:', this.currentPatient.date_of_birth || 'Not provided'],
                ['Gender:', this.currentPatient.gender ? this.currentPatient.gender.charAt(0).toUpperCase() + this.currentPatient.gender.slice(1) : 'Not specified'],
                ['Phone:', this.currentPatient.phone || 'Not provided'],
                ['Email:', this.currentPatient.email || 'Not provided'],
                ['Visit Date:', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })]
            ];
            
            doc.autoTable({
                startY: yPos,
                head: [],
                body: patientInfo,
                theme: 'plain',
                styles: { 
                    fontSize: 10, 
                    cellPadding: 3,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 40, fillColor: [245, 245, 245] },
                    1: { cellWidth: 'auto' }
                },
                margin: { left: margin, right: margin }
            });
            
            yPos = doc.lastAutoTable.finalY + 12;
            
            // Observation Data with Professional Tables
            if (Object.keys(this.observationData).length > 0) {
                // Module Header
                doc.setFillColor(46, 125, 50);
                doc.rect(margin, yPos, contentWidth, 8, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('MODULE 1: OBSERVATION (望 Wàng)', margin + 3, yPos + 5.5);
                doc.setTextColor(0, 0, 0);
                yPos += 10;
                
                for (const [sectionKey, sectionData] of Object.entries(this.observationData)) {
                    const section = OBSERVATION_SECTIONS.find(s => s.id === sectionKey);
                    if (section && sectionData && Object.keys(sectionData).length > 0) {
                        // Check if we need a new page
                        if (yPos > 250) {
                            doc.addPage();
                            yPos = 20;
                        }
                        
                        // Section header with light background
                        doc.setFillColor(232, 245, 233);
                        doc.rect(margin, yPos, contentWidth, 7, 'F');
                        doc.setFontSize(11);
                        doc.setFont(undefined, 'bold');
                        doc.setTextColor(46, 125, 50);
                        doc.text(section.title, margin + 2, yPos + 5);
                        doc.setTextColor(0, 0, 0);
                        yPos += 9;
                        
                        // Create table data for this section
                        const sectionTableData = [];
                        for (const [fieldKey, fieldValue] of Object.entries(sectionData)) {
                            const field = section.fields.find(f => f.id === fieldKey);
                            if (field) {
                                const displayValue = Array.isArray(fieldValue) 
                                    ? fieldValue.join(', ') 
                                    : fieldValue.toString();
                                sectionTableData.push([field.label, displayValue]);
                            }
                        }
                        
                        // Render table
                        doc.autoTable({
                            startY: yPos,
                            head: [],
                            body: sectionTableData,
                            theme: 'striped',
                            styles: { 
                                fontSize: 9, 
                                cellPadding: 3,
                                lineColor: [200, 200, 200],
                                lineWidth: 0.1
                            },
                            columnStyles: {
                                0: { fontStyle: 'bold', cellWidth: 55, fillColor: [250, 250, 250] },
                                1: { cellWidth: 'auto' }
                            },
                            alternateRowStyles: { fillColor: [252, 252, 252] },
                            margin: { left: margin, right: margin }
                        });
                        
                        yPos = doc.lastAutoTable.finalY + 5;
                    }
                }
                yPos += 5;
            }
            
            // Interrogation Data with Professional Tables
            if (Object.keys(this.interrogationData).length > 0) {
                if (yPos > 230) {
                    doc.addPage();
                    yPos = 20;
                }
                
                // Module Header
                doc.setFillColor(156, 39, 176);
                doc.rect(margin, yPos, contentWidth, 8, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('MODULE 2: INTERROGATION (問 Wèn)', margin + 3, yPos + 5.5);
                doc.setTextColor(0, 0, 0);
                yPos += 10;
                
                for (const [sectionKey, sectionData] of Object.entries(this.interrogationData)) {
                    const section = INTERROGATION_SECTIONS.find(s => s.id === sectionKey);
                    if (section && sectionData && Object.keys(sectionData).length > 0) {
                        // Check if we need a new page
                        if (yPos > 250) {
                            doc.addPage();
                            yPos = 20;
                        }
                        
                        // Section header with light background
                        doc.setFillColor(243, 229, 245);
                        doc.rect(margin, yPos, contentWidth, 7, 'F');
                        doc.setFontSize(11);
                        doc.setFont(undefined, 'bold');
                        doc.setTextColor(156, 39, 176);
                        doc.text(section.title, margin + 2, yPos + 5);
                        doc.setTextColor(0, 0, 0);
                        yPos += 9;
                        
                        // Create table data for this section
                        const sectionTableData = [];
                        for (const [fieldKey, fieldValue] of Object.entries(sectionData)) {
                            const field = section.fields.find(f => f.id === fieldKey);
                            if (field) {
                                const displayValue = Array.isArray(fieldValue) 
                                    ? fieldValue.join(', ') 
                                    : fieldValue.toString();
                                sectionTableData.push([field.label, displayValue]);
                            }
                        }
                        
                        // Render table
                        doc.autoTable({
                            startY: yPos,
                            head: [],
                            body: sectionTableData,
                            theme: 'striped',
                            styles: { 
                                fontSize: 9, 
                                cellPadding: 3,
                                lineColor: [200, 200, 200],
                                lineWidth: 0.1
                            },
                            columnStyles: {
                                0: { fontStyle: 'bold', cellWidth: 55, fillColor: [250, 250, 250] },
                                1: { cellWidth: 'auto' }
                            },
                            alternateRowStyles: { fillColor: [252, 252, 252] },
                            margin: { left: margin, right: margin }
                        });
                        
                        yPos = doc.lastAutoTable.finalY + 5;
                    }
                }
                yPos += 5;
            }
            
            // TCM Constitutional Profile with Professional Table
            try {
                const tcmProfile = await API.getTCMProfile(this.currentVisit.id);
                if (tcmProfile && tcmProfile.profile) {
                    if (yPos > 200) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    // Module Header
                    doc.setFillColor(255, 152, 0);
                    doc.rect(margin, yPos, contentWidth, 8, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'bold');
                    doc.text('TCM CONSTITUTIONAL PROFILE', margin + 3, yPos + 5.5);
                    doc.setTextColor(0, 0, 0);
                    yPos += 10;
                    
                    const profile = tcmProfile.profile;
                    const profileData = [];
                    
                    // Eight Principles
                    if (profile.eight_principles) {
                        profileData.push(['EIGHT PRINCIPLES', '']);
                        profileData.push(['Interior/Exterior', profile.eight_principles.interior_exterior || 'Not determined']);
                        profileData.push(['Hot/Cold', profile.eight_principles.hot_cold || 'Not determined']);
                        profileData.push(['Excess/Deficiency', profile.eight_principles.excess_deficiency || 'Not determined']);
                        profileData.push(['Yin/Yang', profile.eight_principles.yin_yang || 'Not determined']);
                    }
                    
                    // Affected Organs
                    if (profile.affected_organs && profile.affected_organs.length > 0) {
                        profileData.push(['AFFECTED ORGANS', profile.affected_organs.join(', ')]);
                    }
                    
                    // Pathogenic Factors
                    if (profile.pathogenic_factors && profile.pathogenic_factors.length > 0) {
                        profileData.push(['PATHOGENIC FACTORS', profile.pathogenic_factors.join(', ')]);
                    }
                    
                    // Qi/Blood/Fluids
                    if (profile.qi_blood_fluids && profile.qi_blood_fluids.length > 0) {
                        profileData.push(['QI/BLOOD/FLUIDS', profile.qi_blood_fluids.join(', ')]);
                    }
                    
                    // Render TCM Profile Table
                    doc.autoTable({
                        startY: yPos,
                        head: [],
                        body: profileData,
                        theme: 'grid',
                        styles: { 
                            fontSize: 10, 
                            cellPadding: 4,
                            lineColor: [200, 200, 200],
                            lineWidth: 0.2
                        },
                        columnStyles: {
                            0: { 
                                fontStyle: 'bold', 
                                cellWidth: 60, 
                                fillColor: [255, 243, 224],
                                textColor: [191, 87, 0]
                            },
                            1: { cellWidth: 'auto', fillColor: [255, 255, 255] }
                        },
                        didParseCell: function(data) {
                            // Make section headers span both columns
                            if (data.row.raw[0] && data.row.raw[1] === '' && 
                                ['EIGHT PRINCIPLES', 'AFFECTED ORGANS', 'PATHOGENIC FACTORS', 'QI/BLOOD/FLUIDS'].includes(data.row.raw[0])) {
                                if (data.column.index === 0) {
                                    data.cell.colSpan = 2;
                                    data.cell.styles.fillColor = [255, 152, 0];
                                    data.cell.styles.textColor = [255, 255, 255];
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.halign = 'center';
                                }
                            }
                        },
                        margin: { left: margin, right: margin }
                    });
                    
                    yPos = doc.lastAutoTable.finalY + 8;
                }
            } catch (error) {
                console.error('Error fetching TCM profile:', error);
            }
            
            // Pattern Analysis & Diagnosis with Professional Formatting
            try {
                const patterns = await API.analyzePatterns(this.currentVisit.id);
                if (patterns && patterns.patterns && patterns.patterns.length > 0) {
                    if (yPos > 180) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    // Module Header
                    doc.setFillColor(211, 47, 47);
                    doc.rect(margin, yPos, contentWidth, 8, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'bold');
                    doc.text('PATTERN ANALYSIS & DIAGNOSIS', margin + 3, yPos + 5.5);
                    doc.setTextColor(0, 0, 0);
                    yPos += 10;
                    
                    patterns.patterns.slice(0, 5).forEach((pattern, index) => {
                        if (yPos > 230) {
                            doc.addPage();
                            yPos = 20;
                        }
                        
                        // Pattern box with gradient-like header
                        const boxStart = yPos;
                        
                        // Pattern name header
                        doc.setFillColor(255, 235, 238);
                        doc.rect(margin, yPos, contentWidth, 8, 'F');
                        doc.setDrawColor(211, 47, 47);
                        doc.rect(margin, yPos, contentWidth, 8, 'S');
                        
                        doc.setFontSize(11);
                        doc.setFont(undefined, 'bold');
                        doc.setTextColor(183, 28, 28);
                        doc.text(`${index + 1}. ${pattern.name}`, margin + 2, yPos + 5.5);
                        
                        // Confidence badge
                        const confidence = pattern.confidence;
                        const confidenceColor = confidence >= 70 ? [76, 175, 80] : confidence >= 50 ? [255, 152, 0] : [158, 158, 158];
                        doc.setFillColor(...confidenceColor);
                        const confidenceText = `${confidence}%`;
                        const confidenceWidth = doc.getTextWidth(confidenceText) + 8;
                        doc.roundedRect(pageWidth - margin - confidenceWidth - 2, yPos + 2, confidenceWidth, 5, 1, 1, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(9);
                        doc.text(confidenceText, pageWidth - margin - confidenceWidth + 3, yPos + 5.5);
                        
                        doc.setTextColor(0, 0, 0);
                        yPos += 10;
                        
                        // Pattern details table
                        const patternDetails = [];
                        if (pattern.description) {
                            patternDetails.push(['Description', pattern.description]);
                        }
                        if (pattern.treatment_principle) {
                            patternDetails.push(['Treatment Principle', pattern.treatment_principle]);
                        }
                        if (pattern.herbal_formula) {
                            patternDetails.push(['Recommended Formula', pattern.herbal_formula]);
                        }
                        if (pattern.acupuncture_points) {
                            patternDetails.push(['Key Acupuncture Points', pattern.acupuncture_points]);
                        }
                        
                        if (patternDetails.length > 0) {
                            doc.autoTable({
                                startY: yPos,
                                head: [],
                                body: patternDetails,
                                theme: 'plain',
                                styles: { 
                                    fontSize: 9, 
                                    cellPadding: 3,
                                    lineColor: [230, 230, 230],
                                    lineWidth: 0.1
                                },
                                columnStyles: {
                                    0: { 
                                        fontStyle: 'bold', 
                                        cellWidth: 50, 
                                        fillColor: [250, 250, 250],
                                        textColor: [100, 100, 100]
                                    },
                                    1: { cellWidth: 'auto' }
                                },
                                margin: { left: margin, right: margin }
                            });
                            
                            yPos = doc.lastAutoTable.finalY;
                        }
                        
                        yPos += 7;
                    });
                }
            } catch (error) {
                console.error('Error fetching patterns:', error);
            }
            
            // Footer with disclaimers
            const pageCount = doc.internal.getNumberOfPages();
            const pageHeight = doc.internal.pageSize.height;
            
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                
                // Separator line
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
                
                // Page number and generation time
                doc.setFontSize(8);
                doc.setFont(undefined, 'normal');
                doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
                doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 11, { align: 'center' });
                
                // Company and disclaimer
                doc.setFontSize(7);
                doc.setTextColor(100, 100, 100);
                doc.text('Longenix Health - TCM Clinical Decision Support System', pageWidth / 2, pageHeight - 7, { align: 'center' });
                doc.text('For Professional Use Only - Not a Medical Device', pageWidth / 2, pageHeight - 4, { align: 'center' });
                doc.setTextColor(0, 0, 0);
            }
            
            // Save PDF with company branding
            const fileName = `Longenix_TCM_Report_${this.currentPatient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF report: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }
}

// Initialize app
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new TCMApp();
});