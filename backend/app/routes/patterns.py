from flask import Blueprint, request, jsonify, current_app
from ..models.database import Observation, Interrogation, PatternAnalysis, Visit
from ..utils.pattern_engine import PatternMatcher

bp = Blueprint('patterns', __name__, url_prefix='/api/patterns')

@bp.route('/analyze/<int:visit_id>', methods=['POST'])
def analyze_patterns(visit_id):
    """Analyze observations AND interrogations and return pattern matches"""
    try:
        visit = Visit.get_by_id(current_app.config['DATABASE'], visit_id)
        if not visit:
            return jsonify({'error': 'Visit not found'}), 404

        # Get all observations for this visit
        observations = Observation.get_by_visit(current_app.config['DATABASE'], visit_id)

        # Get all interrogations for this visit
        interrogations = Interrogation.get_by_visit(current_app.config['DATABASE'], visit_id)

        # Merge both data sources
        all_data = {}
        if observations:
            all_data.update(observations)
        if interrogations:
            all_data.update(interrogations)

        if not all_data:
            return jsonify({'error': 'No diagnostic data found for this visit'}), 400

        # Run pattern matching with combined data
        matcher = PatternMatcher()
        pattern_matches = matcher.analyze(all_data)

        # Calculate overall confidence
        if pattern_matches:
            # Base confidence on completeness of all data and top pattern scores
            total_sections = len(observations or {}) + len(interrogations or {})
            completed_sections = len([d for d in (observations or {}).values() if d.get('completed')])
            completed_sections += len([d for d in (interrogations or {}).values() if d.get('completed')])

            completeness = completed_sections / max(total_sections, 1)
            top_confidence = pattern_matches[0]['confidence'] / 100 if pattern_matches else 0
            overall_confidence = (completeness * 0.4 + top_confidence * 0.6)
        else:
            overall_confidence = 0

        # Save analysis
        if pattern_matches:
            PatternAnalysis.save(
                current_app.config['DATABASE'],
                visit_id=visit_id,
                patterns=pattern_matches,
                confidence=overall_confidence
            )

        return jsonify({
            'patterns': pattern_matches,
            'overall_confidence': round(overall_confidence * 100, 1),
            'total_patterns_found': len(pattern_matches)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/visit/<int:visit_id>/latest', methods=['GET'])
def get_latest_analysis(visit_id):
    """Get the latest pattern analysis for a visit"""
    try:
        analysis = PatternAnalysis.get_latest(current_app.config['DATABASE'], visit_id)
        if not analysis:
            return jsonify({'analysis': None})
        return jsonify({'analysis': analysis})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/all', methods=['GET'])
def get_all_patterns():
    """Get list of all available patterns"""
    try:
        matcher = PatternMatcher()
        patterns = matcher.get_all_patterns()
        return jsonify({'patterns': patterns})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<pattern_id>', methods=['GET'])
def get_pattern_details(pattern_id):
    """Get detailed information about a specific pattern"""
    try:
        matcher = PatternMatcher()
        pattern = matcher.get_pattern_details(pattern_id)
        if not pattern:
            return jsonify({'error': 'Pattern not found'}), 404
        return jsonify({'pattern': pattern})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
