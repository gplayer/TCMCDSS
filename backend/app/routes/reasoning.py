from flask import Blueprint, jsonify, current_app
from ..models.database import Visit, Observation, Interrogation, ChiefComplaint
from ..utils.tcm_reasoning import TCMReasoningEngine

reasoning_bp = Blueprint('reasoning', __name__, url_prefix='/api')

@reasoning_bp.route('/reasoning/analyze/<int:visit_id>', methods=['POST'])
def analyze_visit(visit_id):
    """
    Analyze a visit using TCM Reasoning Engine
    Returns TCM profile with Eight Principles and organ involvement
    """
    try:
        # Verify visit exists
        visit = Visit.get_by_id(current_app.config['DATABASE'], visit_id)
        if not visit:
            return jsonify({'error': 'Visit not found'}), 404
        
        # Get all data for the visit
        observation_data = Observation.get_by_visit(current_app.config['DATABASE'], visit_id)
        interrogation_data = Interrogation.get_by_visit(current_app.config['DATABASE'], visit_id)
        chief_complaint_data = ChiefComplaint.get_by_visit(current_app.config['DATABASE'], visit_id)
        
        # Handle case where no chief complaint exists yet
        if not chief_complaint_data:
            chief_complaint_data = {}
        
        # Run TCM Reasoning Engine
        engine = TCMReasoningEngine()
        profile = engine.analyze(
            observation_data, 
            interrogation_data, 
            chief_complaint_data
        )
        
        # Get profile summary
        profile_summary = engine.get_profile_summary()
        
        return jsonify({
            'success': True,
            'visit_id': visit_id,
            'tcm_profile': profile_summary
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@reasoning_bp.route('/reasoning/visit/<int:visit_id>', methods=['GET'])
def get_reasoning_profile(visit_id):
    """
    Get TCM reasoning profile for a visit
    Same as analyze but as GET request
    """
    return analyze_visit(visit_id)
