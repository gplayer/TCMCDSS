from flask import Blueprint, request, jsonify, current_app
from ..models.database import Interrogation

interrogations_bp = Blueprint('interrogations', __name__, url_prefix='/api')

@interrogations_bp.route('/interrogations/visit/<int:visit_id>', methods=['GET'])
def get_visit_interrogations(visit_id):
    """Get all interrogations for a visit"""
    try:
        interrogations = Interrogation.get_by_visit(current_app.config['DATABASE'], visit_id)
        return jsonify({
            'visit_id': visit_id,
            'interrogations': interrogations
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@interrogations_bp.route('/interrogations/visit/<int:visit_id>/<section>', methods=['POST'])
def save_interrogation(visit_id, section):
    """Save interrogation data for a specific section"""
    try:
        data = request.get_json()
        interrogation_data = data.get('data', {})
        completed = data.get('completed', False)
        
        Interrogation.save(current_app.config['DATABASE'], visit_id, section, interrogation_data, completed)
        
        return jsonify({
            'success': True,
            'message': 'Interrogation saved successfully',
            'visit_id': visit_id,
            'section': section
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@interrogations_bp.route('/interrogations/visit/<int:visit_id>/<section>', methods=['GET'])
def get_section_interrogation(visit_id, section):
    """Get interrogation data for a specific section"""
    try:
        interrogations = Interrogation.get_by_visit(current_app.config['DATABASE'], visit_id)
        section_data = interrogations.get(section, {})
        
        return jsonify({
            'visit_id': visit_id,
            'section': section,
            'data': section_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
