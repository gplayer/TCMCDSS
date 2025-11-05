from flask import Blueprint, request, jsonify, current_app
from ..models.database import ChiefComplaint, Visit

chief_complaints_bp = Blueprint('chief_complaints', __name__, url_prefix='/api')

@chief_complaints_bp.route('/chief-complaint/visit/<int:visit_id>', methods=['POST'])
def save_chief_complaint(visit_id):
    """Save Chief Complaint for a visit"""
    try:
        visit = Visit.get_by_id(current_app.config['DATABASE'], visit_id)
        if not visit:
            return jsonify({'error': 'Visit not found'}), 404
        
        data = request.get_json()
        western_conditions = data.get('western_conditions', '').strip()
        primary_concern = data.get('primary_concern', '').strip()
        recent_symptoms = data.get('recent_symptoms', '').strip()
        
        ChiefComplaint.save(
            current_app.config['DATABASE'],
            visit_id=visit_id,
            western_conditions=western_conditions,
            primary_concern=primary_concern,
            recent_symptoms=recent_symptoms
        )
        
        return jsonify({
            'success': True,
            'message': 'Chief Complaint saved successfully',
            'visit_id': visit_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chief_complaints_bp.route('/chief-complaint/visit/<int:visit_id>', methods=['GET'])
def get_chief_complaint(visit_id):
    """Retrieve Chief Complaint for a visit"""
    try:
        chief_complaint = ChiefComplaint.get_by_visit(
            current_app.config['DATABASE'],
            visit_id
        )
        
        return jsonify({
            'visit_id': visit_id,
            'chief_complaint': chief_complaint
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
