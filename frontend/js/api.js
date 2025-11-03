// API Configuration and Functions
const API_BASE_URL = 'https://gplayer.pythonanywhere.com';

class API {
    static async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Patient APIs
    static async getPatients() {
        return this.request('/patients');
    }

    static async createPatient(patientData) {
        return this.request('/patients', 'POST', patientData);
    }

    static async getPatient(patientId) {
        return this.request(`/patients/${patientId}`);
    }

    static async createVisit(patientId, chiefComplaint) {
        return this.request(`/patients/${patientId}/visits`, 'POST', { chief_complaint: chiefComplaint });
    }

    // Observation APIs
    static async getObservations(visitId) {
        return this.request(`/observations/visit/${visitId}`);
    }

    static async saveObservation(visitId, section, data, completed = false) {
        return this.request(`/observations/visit/${visitId}/${section}`, 'POST', { data, completed });
    }

    static async getSectionObservation(visitId, section) {
        return this.request(`/observations/visit/${visitId}/${section}`);
    }

    // Pattern Analysis APIs
    static async analyzePatterns(visitId) {
        return this.request(`/patterns/analyze/${visitId}`, 'POST');
    }

    static async getLatestAnalysis(visitId) {
        return this.request(`/patterns/visit/${visitId}/latest`);
    }

    static async getAllPatterns() {
        return this.request('/patterns/all');
    }

    static async getPatternDetails(patternId) {
        return this.request(`/patterns/${patternId}`);
    }
}
