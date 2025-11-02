from flask import Blueprint, request, jsonify, current_app
from ..models.database import Observation, Visit

bp = Blueprint('observations', __name__, url_prefix='/api/observations')

@bp.route('/visit/<int:visit_id>', methods=['GET'])
def get_observations(visit_id):
    """Get all observations for a visit"""
    try:
        visit = Visit.get_by_id(current_app.config['DATABASE'], visit_id)
        if not visit:
            return jsonify({'error': 'Visit not found'}), 404
        
        observations = Observation.get_by_visit(current_app.config['DATABASE'], visit_id)
        return jsonify({'observations': observations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/visit/<int:visit_id>/<section>', methods=['POST'])
def save_observation(visit_id, section):
    """Save or update observation for a specific section"""
    try:
        visit = Visit.get_by_id(current_app.config['DATABASE'], visit_id)
        if not visit:
            return jsonify({'error': 'Visit not found'}), 404
        
        data = request.get_json()
        observation_data = data.get('data', {})
        completed = data.get('completed', False)
        
        Observation.save(
            current_app.config['DATABASE'],
            visit_id=visit_id,
            section=section,
            data=observation_data,
            completed=completed
        )
        
        return jsonify({'message': 'Observation saved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/visit/<int:visit_id>/<section>', methods=['GET'])
def get_section_observation(visit_id, section):
    """Get observation for a specific section"""
    try:
        observations = Observation.get_by_visit(current_app.config['DATABASE'], visit_id)
        
        if section in observations:
            return jsonify({'observation': observations[section]})
        else:
            return jsonify({'observation': None})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
