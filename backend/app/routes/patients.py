from flask import Blueprint, request, jsonify, current_app
from ..models.database import Patient, Visit

bp = Blueprint('patients', __name__, url_prefix='/api/patients')

@bp.route('', methods=['GET'])
def get_patients():
    """Get all patients"""
    try:
        patients = Patient.get_all(current_app.config['DATABASE'])
        return jsonify({'patients': patients})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
def create_patient():
    """Create a new patient"""
    try:
        data = request.get_json()
        
        patient_id = Patient.create(
            current_app.config['DATABASE'],
            name=data['name'],
            date_of_birth=data.get('date_of_birth'),
            gender=data.get('gender'),
            phone=data.get('phone'),
            email=data.get('email')
        )
        
        return jsonify({'patient_id': patient_id, 'message': 'Patient created successfully'}), 201
    except KeyError as e:
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get a specific patient"""
    try:
        patient = Patient.get_by_id(current_app.config['DATABASE'], patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Get patient's visits
        visits = Visit.get_by_patient(current_app.config['DATABASE'], patient_id)
        patient['visits'] = visits
        
        return jsonify({'patient': patient})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:patient_id>/visits', methods=['GET'])
def get_patient_visits(patient_id):
    """Get all visits for a patient"""
    try:
        patient = Patient.get_by_id(current_app.config['DATABASE'], patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        visits = Visit.get_by_patient(current_app.config['DATABASE'], patient_id)
        return jsonify({'visits': visits})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:patient_id>/visits', methods=['POST'])
def create_visit(patient_id):
    """Create a new visit for a patient"""
    try:
        patient = Patient.get_by_id(current_app.config['DATABASE'], patient_id)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        data = request.get_json()
        visit_id = Visit.create(
            current_app.config['DATABASE'],
            patient_id=patient_id,
            chief_complaint=data.get('chief_complaint')
        )
        
        return jsonify({'visit_id': visit_id, 'message': 'Visit created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
