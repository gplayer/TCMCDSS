"""
Pattern Matching Engine for TCM Clinical Decision Support System
Based on Giovanni Maciocia's Diagnosis in Chinese Medicine
"""

from typing import Dict, List, Tuple
import json

# Pattern Knowledge Base - Top 20 Most Common Patterns
PATTERN_KNOWLEDGE_BASE = {
    "spleen_qi_deficiency": {
        "name": "Spleen-Qi Deficiency",
        "category": "Deficiency/Spleen",
        "description": "Chronic deficiency of Spleen-Qi leading to poor transformation and transportation",
        "tongue": {
            "color": ["pale"],
            "shape": ["swollen", "normal"],
            "features": ["tooth_marked"],
            "coating_color": ["white"],
            "coating_thickness": ["thin"],
            "moisture": ["normal", "wet"]
        },
        "complexion": ["pale", "sallow", "yellow_dull"],
        "shen": ["weak"],
        "key_observations": {
            "tongue_pale": 0.7,
            "tongue_swollen": 0.6,
            "tongue_tooth_marked": 0.8,
            "coating_thin_white": 0.3,
            "complexion_sallow": 0.5,
            "shen_weak": 0.6
        },
        "treatment_principle": "Tonify Spleen-Qi",
        "common_points": ["ST-36", "SP-6", "CV-12", "BL-20"]
    },
    
    "kidney_yang_deficiency": {
        "name": "Kidney-Yang Deficiency",
        "category": "Deficiency/Kidney",
        "description": "Deficiency of Kidney-Yang leading to Cold and failure to warm the body",
        "tongue": {
            "color": ["pale"],
            "shape": ["swollen"],
            "features": [],
            "coating_color": ["white"],
            "coating_thickness": ["thin"],
            "moisture": ["wet", "very_wet"]
        },
        "complexion": ["pale", "pale_bright"],
        "shen": ["weak"],
        "key_observations": {
            "tongue_pale": 0.8,
            "tongue_swollen": 0.7,
            "tongue_wet": 0.8,
            "coating_thin_white": 0.4,
            "complexion_pale": 0.6,
            "hands_cold": 0.7,
            "feet_cold": 0.9,
            "shen_weak": 0.5
        },
        "treatment_principle": "Warm and Tonify Kidney-Yang",
        "common_points": ["GV-4", "CV-4", "BL-23", "KI-3", "KI-7"]
    },
    
    "liver_qi_stagnation": {
        "name": "Liver-Qi Stagnation",
        "category": "Excess/Liver",
        "description": "Stagnation of Liver-Qi causing constraint and emotional symptoms",
        "tongue": {
            "color": ["normal", "red_sides"],
            "shape": ["normal"],
            "features": [],
            "coating_color": ["white", "thin_white"],
            "coating_thickness": ["thin"],
            "moisture": ["normal"]
        },
        "complexion": ["normal", "greenish_around_mouth"],
        "shen": ["normal", "restless"],
        "key_observations": {
            "tongue_red_sides": 0.7,
            "tongue_color_normal": 0.3,
            "complexion_greenish": 0.5,
            "movement_restless": 0.6,
            "shen_normal": 0.2
        },
        "treatment_principle": "Soothe Liver-Qi, Regulate Qi flow",
        "common_points": ["LR-3", "LR-14", "GB-34", "PC-6"]
    },
    
    "blood_deficiency": {
        "name": "Blood Deficiency",
        "category": "Deficiency/Blood",
        "description": "Deficiency of Blood leading to malnourishment",
        "tongue": {
            "color": ["pale", "pale_thin"],
            "shape": ["thin"],
            "features": [],
            "coating_color": ["white", "thin_white"],
            "coating_thickness": ["thin"],
            "moisture": ["dry", "normal"]
        },
        "complexion": ["pale_dull", "sallow"],
        "shen": ["weak"],
        "key_observations": {
            "tongue_pale": 0.8,
            "tongue_thin": 0.7,
            "complexion_pale_dull": 0.7,
            "nails_pale": 0.6,
            "lips_pale": 0.6,
            "shen_weak": 0.5
        },
        "treatment_principle": "Nourish Blood",
        "common_points": ["SP-6", "ST-36", "BL-17", "BL-20"]
    },
    
    "yin_deficiency_empty_heat": {
        "name": "Yin Deficiency with Empty Heat",
        "category": "Deficiency/Yin",
        "description": "Deficiency of Yin leading to relative excess of Yang manifesting as Empty Heat",
        "tongue": {
            "color": ["red", "dark_red"],
            "shape": ["thin", "normal"],
            "features": ["cracks"],
            "coating_color": [],
            "coating_thickness": ["none", "peeled"],
            "moisture": ["dry"]
        },
        "complexion": ["malar_flush", "red_floating"],
        "shen": ["normal", "restless"],
        "key_observations": {
            "tongue_red": 0.9,
            "tongue_no_coating": 0.8,
            "tongue_dry": 0.7,
            "tongue_cracks": 0.6,
            "complexion_malar_flush": 0.8,
            "hands_hot_palms": 0.7,
            "feet_hot": 0.7
        },
        "treatment_principle": "Nourish Yin, Clear Empty Heat",
        "common_points": ["KI-3", "KI-6", "SP-6", "LU-7", "HT-6"]
    },
    
    "dampness": {
        "name": "Dampness",
        "category": "Excess/Dampness",
        "description": "Accumulation of Dampness obstructing Qi flow",
        "tongue": {
            "color": ["normal", "pale"],
            "shape": ["swollen"],
            "features": [],
            "coating_color": ["white"],
            "coating_thickness": ["thick"],
            "coating_quality": ["sticky", "greasy"],
            "moisture": ["wet"]
        },
        "complexion": ["normal", "yellow_dull"],
        "shen": ["normal"],
        "key_observations": {
            "tongue_swollen": 0.7,
            "coating_thick": 0.8,
            "coating_greasy": 0.9,
            "coating_white": 0.5,
            "body_overweight": 0.5,
            "skin_puffy": 0.6
        },
        "treatment_principle": "Resolve Dampness, Strengthen Spleen",
        "common_points": ["SP-6", "SP-9", "ST-40", "CV-12"]
    },
    
    "damp_heat": {
        "name": "Damp-Heat",
        "category": "Excess/Damp-Heat",
        "description": "Combination of Dampness and Heat obstructing and inflaming",
        "tongue": {
            "color": ["red"],
            "shape": ["swollen", "normal"],
            "features": [],
            "coating_color": ["yellow"],
            "coating_thickness": ["thick"],
            "coating_quality": ["sticky", "greasy"],
            "moisture": ["normal", "wet"]
        },
        "complexion": ["yellow_bright", "red"],
        "shen": ["normal"],
        "key_observations": {
            "tongue_red": 0.7,
            "coating_yellow": 0.8,
            "coating_thick": 0.7,
            "coating_greasy": 0.9,
            "complexion_yellow": 0.6,
            "skin_greasy": 0.5
        },
        "treatment_principle": "Clear Heat, Resolve Dampness",
        "common_points": ["SP-6", "SP-9", "LI-11", "ST-44"]
    },
    
    "liver_fire": {
        "name": "Liver-Fire",
        "category": "Excess/Liver",
        "description": "Excess Fire in the Liver rising upward",
        "tongue": {
            "color": ["red", "red_sides"],
            "shape": ["normal"],
            "features": ["red_points_sides"],
            "coating_color": ["yellow"],
            "coating_thickness": ["thin", "thick"],
            "moisture": ["dry", "normal"]
        },
        "complexion": ["red", "red_face"],
        "shen": ["restless"],
        "key_observations": {
            "tongue_red": 0.8,
            "tongue_red_sides": 0.9,
            "coating_yellow": 0.7,
            "complexion_red": 0.7,
            "eyes_red": 0.8,
            "movement_restless": 0.6
        },
        "treatment_principle": "Clear Liver-Fire, Drain Fire",
        "common_points": ["LR-2", "LR-3", "GB-20", "LI-11"]
    },
    
    "heart_blood_deficiency": {
        "name": "Heart-Blood Deficiency",
        "category": "Deficiency/Heart",
        "description": "Deficiency of Heart-Blood leading to failure to nourish the Mind",
        "tongue": {
            "color": ["pale", "pale_thin"],
            "shape": ["thin"],
            "features": [],
            "coating_color": ["white"],
            "coating_thickness": ["thin"],
            "moisture": ["normal"]
        },
        "complexion": ["pale_dull"],
        "shen": ["weak"],
        "key_observations": {
            "tongue_pale": 0.8,
            "tongue_thin": 0.6,
            "complexion_pale": 0.6,
            "lips_pale": 0.7,
            "shen_weak": 0.7
        },
        "treatment_principle": "Nourish Heart-Blood, Calm Mind",
        "common_points": ["HT-7", "SP-6", "ST-36", "BL-15", "BL-17"]
    },
    
    "lung_qi_deficiency": {
        "name": "Lung-Qi Deficiency",
        "category": "Deficiency/Lung",
        "description": "Deficiency of Lung-Qi leading to failure to govern Qi and respiration",
        "tongue": {
            "color": ["pale"],
            "shape": ["normal", "swollen"],
            "features": [],
            "coating_color": ["white"],
            "coating_thickness": ["thin"],
            "moisture": ["normal"]
        },
        "complexion": ["pale", "pale_bright"],
        "shen": ["weak"],
        "key_observations": {
            "tongue_pale": 0.7,
            "complexion_pale": 0.6,
            "voice_weak": 0.8,
            "chest_sunken": 0.6,
            "shen_weak": 0.6
        },
        "treatment_principle": "Tonify Lung-Qi",
        "common_points": ["LU-9", "LU-7", "BL-13", "ST-36", "CV-17"]
    },
    
    "kidney_yin_deficiency": {
        "name": "Kidney-Yin Deficiency",
        "category": "Deficiency/Kidney",
        "description": "Deficiency of Kidney-Yin leading to Empty Heat",
        "tongue": {
            "color": ["red", "dark_red"],
            "shape": ["thin", "normal"],
            "features": ["cracks"],
            "coating_color": [],
            "coating_thickness": ["none", "peeled"],
            "moisture": ["dry"]
        },
        "complexion": ["malar_flush"],
        "shen": ["normal", "restless"],
        "key_observations": {
            "tongue_red": 0.8,
            "tongue_no_coating": 0.7,
            "tongue_dry": 0.6,
            "complexion_malar_flush": 0.7,
            "hands_hot_palms": 0.7,
            "feet_hot": 0.7,
            "back_pain": 0.5
        },
        "treatment_principle": "Nourish Kidney-Yin",
        "common_points": ["KI-3", "KI-6", "KI-10", "SP-6", "BL-23"]
    },
    
    "phlegm": {
        "name": "Phlegm",
        "category": "Excess/Phlegm",
        "description": "Accumulation of Phlegm obstructing channels",
        "tongue": {
            "color": ["normal", "pale"],
            "shape": ["swollen"],
            "features": [],
            "coating_color": ["white"],
            "coating_thickness": ["thick"],
            "coating_quality": ["sticky", "greasy"],
            "moisture": ["wet"]
        },
        "complexion": ["normal"],
        "shen": ["normal", "dull"],
        "key_observations": {
            "tongue_swollen": 0.8,
            "coating_thick": 0.9,
            "coating_greasy": 0.9,
            "coating_sticky": 0.8,
            "body_overweight": 0.6
        },
        "treatment_principle": "Transform Phlegm, Resolve Dampness",
        "common_points": ["ST-40", "SP-6", "SP-9", "CV-12"]
    },
    
    "blood_stasis": {
        "name": "Blood Stasis",
        "category": "Excess/Blood",
        "description": "Stagnation of Blood in channels and organs",
        "tongue": {
            "color": ["purple", "bluish_purple", "reddish_purple"],
            "shape": ["normal"],
            "features": ["purple_spots"],
            "coating_color": ["normal"],
            "coating_thickness": ["normal"],
            "moisture": ["normal"]
        },
        "complexion": ["purple", "dark"],
        "shen": ["normal"],
        "key_observations": {
            "tongue_purple": 0.9,
            "tongue_purple_spots": 0.8,
            "complexion_purple": 0.7,
            "lips_purple": 0.7,
            "nails_purple": 0.6,
            "veins_distended": 0.6
        },
        "treatment_principle": "Invigorate Blood, Remove Stasis",
        "common_points": ["SP-10", "SP-6", "LR-3", "BL-17"]
    },
    
    "liver_yang_rising": {
        "name": "Liver-Yang Rising",
        "category": "Excess/Liver",
        "description": "Liver-Yang rising upward, often on background of Liver-Yin deficiency",
        "tongue": {
            "color": ["red", "red_sides"],
            "shape": ["normal"],
            "features": [],
            "coating_color": ["thin_white", "thin_yellow"],
            "coating_thickness": ["thin"],
            "moisture": ["normal", "dry"]
        },
        "complexion": ["red_face", "malar_flush"],
        "shen": ["restless"],
        "key_observations": {
            "tongue_red": 0.7,
            "tongue_red_sides": 0.8,
            "complexion_red": 0.7,
            "eyes_red": 0.6,
            "movement_restless": 0.6
        },
        "treatment_principle": "Subdue Liver-Yang, Nourish Liver-Yin",
        "common_points": ["LR-3", "LR-2", "GB-20", "KI-3"]
    },
    
    "stomach_heat": {
        "name": "Stomach-Heat",
        "category": "Excess/Stomach",
        "description": "Excess Heat in the Stomach",
        "tongue": {
            "color": ["red", "red_center"],
            "shape": ["normal"],
            "features": [],
            "coating_color": ["yellow"],
            "coating_thickness": ["thick"],
            "moisture": ["dry"]
        },
        "complexion": ["red"],
        "shen": ["normal", "restless"],
        "key_observations": {
            "tongue_red": 0.7,
            "tongue_red_center": 0.8,
            "coating_yellow": 0.8,
            "coating_thick": 0.6,
            "coating_dry": 0.6
        },
        "treatment_principle": "Clear Stomach-Heat",
        "common_points": ["ST-44", "ST-45", "LI-11", "CV-12"]
    },
    
    "heart_fire": {
        "name": "Heart-Fire",
        "category": "Excess/Heart",
        "description": "Excess Fire in the Heart blazing upward",
        "tongue": {
            "color": ["red", "red_tip"],
            "shape": ["normal"],
            "features": ["red_points_tip"],
            "coating_color": ["yellow"],
            "coating_thickness": ["thin"],
            "moisture": ["dry"]
        },
        "complexion": ["red"],
        "shen": ["restless"],
        "key_observations": {
            "tongue_red": 0.8,
            "tongue_red_tip": 0.9,
            "coating_yellow": 0.6,
            "complexion_red": 0.6,
            "movement_restless": 0.7
        },
        "treatment_principle": "Clear Heart-Fire",
        "common_points": ["HT-8", "HT-7", "PC-7", "SI-2"]
    },
    
    "spleen_yang_deficiency": {
        "name": "Spleen-Yang Deficiency",
        "category": "Deficiency/Spleen",
        "description": "Deficiency of Spleen-Yang leading to Cold and failure to transform",
        "tongue": {
            "color": ["pale"],
            "shape": ["swollen"],
            "features": ["tooth_marked"],
            "coating_color": ["white"],
            "coating_thickness": ["thin", "thick"],
            "moisture": ["wet"]
        },
        "complexion": ["pale", "pale_bright"],
        "shen": ["weak"],
        "key_observations": {
            "tongue_pale": 0.8,
            "tongue_swollen": 0.7,
            "tongue_wet": 0.7,
            "tongue_tooth_marked": 0.7,
            "complexion_pale": 0.6,
            "abdomen_cold": 0.6
        },
        "treatment_principle": "Warm and Tonify Spleen-Yang",
        "common_points": ["ST-36", "SP-6", "CV-12", "BL-20", "CV-4"]
    },
    
    "lung_yin_deficiency": {
        "name": "Lung-Yin Deficiency",
        "category": "Deficiency/Lung",
        "description": "Deficiency of Lung-Yin leading to Dryness and Empty Heat",
        "tongue": {
            "color": ["red", "red_front"],
            "shape": ["thin", "normal"],
            "features": [],
            "coating_color": [],
            "coating_thickness": ["none", "thin"],
            "moisture": ["dry"]
        },
        "complexion": ["malar_flush"],
        "shen": ["normal"],
        "key_observations": {
            "tongue_red": 0.7,
            "tongue_red_front": 0.8,
            "tongue_dry": 0.7,
            "coating_none": 0.6,
            "complexion_malar_flush": 0.5
        },
        "treatment_principle": "Nourish Lung-Yin",
        "common_points": ["LU-9", "LU-7", "KI-6", "SP-6", "BL-13"]
    },
    
    "qi_deficiency": {
        "name": "Qi Deficiency",
        "category": "Deficiency/Qi",
        "description": "General deficiency of Qi affecting multiple organs",
        "tongue": {
            "color": ["pale"],
            "shape": ["normal", "swollen"],
            "features": [],
            "coating_color": ["white"],
            "coating_thickness": ["thin"],
            "moisture": ["normal"]
        },
        "complexion": ["pale"],
        "shen": ["weak"],
        "key_observations": {
            "tongue_pale": 0.6,
            "complexion_pale": 0.6,
            "shen_weak": 0.8,
            "voice_weak": 0.7,
            "posture_stooped": 0.5
        },
        "treatment_principle": "Tonify Qi",
        "common_points": ["ST-36", "SP-6", "LU-9", "CV-6"]
    },
    
    "liver_blood_deficiency": {
        "name": "Liver-Blood Deficiency",
        "category": "Deficiency/Liver",
        "description": "Deficiency of Liver-Blood leading to failure to nourish",
        "tongue": {
            "color": ["pale", "pale_sides"],
            "shape": ["thin"],
            "features": [],
            "coating_color": ["white"],
            "coating_thickness": ["thin"],
            "moisture": ["dry", "normal"]
        },
        "complexion": ["pale_dull", "sallow"],
        "shen": ["weak"],
        "key_observations": {
            "tongue_pale": 0.7,
            "tongue_pale_sides": 0.8,
            "tongue_thin": 0.6,
            "complexion_pale": 0.6,
            "nails_pale": 0.7,
            "nails_brittle": 0.6
        },
        "treatment_principle": "Nourish Liver-Blood",
        "common_points": ["LR-8", "SP-6", "ST-36", "BL-17", "BL-18"]
    }
}


class PatternMatcher:
    """Pattern matching engine using weighted scoring algorithm"""
    
    def __init__(self):
        self.patterns = PATTERN_KNOWLEDGE_BASE
        self.observation_data = {}
    
    def analyze(self, observations: Dict) -> List[Dict]:
        """
        Analyze observations and return ranked pattern matches
        
        Args:
            observations: Dictionary containing all observation data
            
        Returns:
            List of pattern matches with scores and evidence
        """
        self.observation_data = self._normalize_observations(observations)
        
        pattern_scores = []
        
        for pattern_id, pattern in self.patterns.items():
            score, evidence = self._calculate_pattern_score(pattern_id, pattern)
            
            if score > 0:  # Only include patterns with some match
                pattern_scores.append({
                    'pattern_id': pattern_id,
                    'name': pattern['name'],
                    'category': pattern['category'],
                    'confidence': round(score * 100, 1),
                    'supporting_evidence': evidence['supporting'],
                    'contradicting_evidence': evidence['contradicting'],
                    'description': pattern['description'],
                    'treatment_principle': pattern['treatment_principle'],
                    'common_points': pattern['common_points']
                })
        
        # Sort by confidence score
        pattern_scores.sort(key=lambda x: x['confidence'], reverse=True)
        
        return pattern_scores
    
    def _normalize_observations(self, observations: Dict) -> Dict:
        """Convert observation data into normalized format for matching"""
        normalized = {}
        
        # Extract key findings from each section
        if 'shen' in observations:
            shen = observations['shen'].get('data', {})
            if shen.get('overall') == 'weak':
                normalized['shen_weak'] = True
            if shen.get('overall') == 'strong':
                normalized['shen_strong'] = True
        
        if 'tongue' in observations:
            tongue = observations['tongue'].get('data', {})
            
            # Tongue body color
            color = tongue.get('body_color')
            if color:
                normalized[f'tongue_{color}'] = True
                
            # Tongue shape
            shape = tongue.get('body_shape')
            if shape:
                normalized[f'tongue_{shape}'] = True
            
            # Tongue features
            if tongue.get('tooth_marked'):
                normalized['tongue_tooth_marked'] = True
            if tongue.get('cracks'):
                normalized['tongue_cracks'] = True
            if tongue.get('red_points'):
                normalized['tongue_red_points'] = True
            if tongue.get('purple_spots'):
                normalized['tongue_purple_spots'] = True
                
            # Tongue moisture
            moisture = tongue.get('moisture')
            if moisture:
                normalized[f'tongue_{moisture}'] = True
            
            # Tongue coating
            coating_color = tongue.get('coating_color')
            if coating_color:
                normalized[f'coating_{coating_color}'] = True
            
            coating_thick = tongue.get('coating_thickness')
            if coating_thick:
                normalized[f'coating_{coating_thick}'] = True
            
            coating_quality = tongue.get('coating_quality')
            if coating_quality:
                normalized[f'coating_{coating_quality}'] = True
                
            # Special tongue colors/locations
            if tongue.get('red_sides'):
                normalized['tongue_red_sides'] = True
            if tongue.get('red_tip'):
                normalized['tongue_red_tip'] = True
            if tongue.get('red_center'):
                normalized['tongue_red_center'] = True
        
        if 'complexion' in observations:
            complexion = observations['complexion'].get('data', {})
            color = complexion.get('primary_color')
            shade = complexion.get('shade')
            if color and shade:
                normalized[f'complexion_{color}_{shade}'] = True
            elif color:
                normalized[f'complexion_{color}'] = True
        
        if 'hands' in observations:
            hands = observations['hands'].get('data', {})
            temp = hands.get('temperature')
            if temp == 'cold':
                normalized['hands_cold'] = True
            elif temp == 'hot_palms':
                normalized['hands_hot_palms'] = True
        
        if 'feet' in observations:
            feet = observations['feet'].get('data', {})
            temp = feet.get('temperature')
            if temp == 'cold':
                normalized['feet_cold'] = True
            elif temp == 'hot':
                normalized['feet_hot'] = True
        
        if 'eyes' in observations:
            eyes = observations['eyes'].get('data', {})
            if eyes.get('sclera_red'):
                normalized['eyes_red'] = True
        
        if 'nails' in observations:
            nails = observations['nails'].get('data', {})
            color = nails.get('color')
            if color:
                normalized[f'nails_{color}'] = True
            if nails.get('brittle'):
                normalized['nails_brittle'] = True
        
        if 'lips' in observations:
            lips = observations['lips'].get('data', {})
            color = lips.get('color')
            if color:
                normalized[f'lips_{color}'] = True
        
        if 'movement' in observations:
            movement = observations['movement'].get('data', {})
            if movement.get('restless'):
                normalized['movement_restless'] = True
        
        if 'posture' in observations:
            posture = observations['posture'].get('data', {})
            if posture.get('stooped'):
                normalized['posture_stooped'] = True
        
        if 'voice' in observations:
            voice = observations['voice'].get('data', {})
            if voice.get('weak'):
                normalized['voice_weak'] = True
        
        if 'chest' in observations:
            chest = observations['chest'].get('data', {})
            if chest.get('sunken'):
                normalized['chest_sunken'] = True
        
        if 'body_type' in observations:
            body = observations['body_type'].get('data', {})
            if body.get('overweight'):
                normalized['body_overweight'] = True
        
        if 'skin' in observations:
            skin = observations['skin'].get('data', {})
            if skin.get('puffy'):
                normalized['skin_puffy'] = True
            if skin.get('greasy'):
                normalized['skin_greasy'] = True
        
        if 'veins' in observations:
            veins = observations['veins'].get('data', {})
            if veins.get('distended'):
                normalized['veins_distended'] = True
        
        return normalized
    
    def _calculate_pattern_score(self, pattern_id: str, pattern: Dict) -> Tuple[float, Dict]:
        """Calculate weighted score for a pattern"""
        key_obs = pattern.get('key_observations', {})
        
        total_possible_score = sum(key_obs.values())
        actual_score = 0
        
        supporting = []
        contradicting = []
        
        for obs_key, weight in key_obs.items():
            if obs_key in self.observation_data:
                actual_score += weight
                supporting.append(self._format_evidence(obs_key))
        
        # Check for contradicting evidence
        # (simplified - can be expanded with explicit contradictions)
        
        confidence = actual_score / total_possible_score if total_possible_score > 0 else 0
        
        evidence = {
            'supporting': supporting,
            'contradicting': contradicting
        }
        
        return confidence, evidence
    
    def _format_evidence(self, obs_key: str) -> str:
        """Format observation key into human-readable evidence"""
        # Convert snake_case to Title Case with proper spacing
        words = obs_key.replace('_', ' ').title()
        return words
    
    def get_pattern_details(self, pattern_id: str) -> Dict:
        """Get detailed information about a specific pattern"""
        if pattern_id in self.patterns:
            return self.patterns[pattern_id]
        return None
    
    def get_all_patterns(self) -> List[Dict]:
        """Get list of all available patterns"""
        return [
            {
                'id': pid,
                'name': p['name'],
                'category': p['category'],
                'description': p['description']
            }
            for pid, p in self.patterns.items()
        ]
