"""
TCM Reasoning Engine - Phase 2
Dynamically interprets symptoms using Eight Principles and TCM theory
Based on Giovanni Maciocia's "Diagnosis in Chinese Medicine"
"""

from typing import Dict, List, Set
from dataclasses import dataclass, field


@dataclass
class TCMProfile:
    """Patient's TCM characteristic profile"""
    # Eight Principles Classification
    interior_exterior: str = ""  # "interior", "exterior", "both", "transitioning"
    hot_cold: str = ""  # "hot", "cold", "mixed", "neutral"
    excess_deficiency: str = ""  # "excess", "deficiency", "mixed"
    yin_yang: str = ""  # "yin", "yang", "balanced"
    
    # Organ Systems Involved
    affected_organs: List[str] = field(default_factory=list)
    
    # Pathogenic Factors
    pathogenic_factors: List[str] = field(default_factory=list)  # e.g., "dampness", "phlegm", "wind", "heat"
    
    # Qi, Blood, Fluids Status
    qi_status: str = ""  # "deficient", "stagnant", "normal"
    blood_status: str = ""  # "deficient", "stagnant", "heat", "normal"
    fluid_status: str = ""  # "deficient", "excess", "normal"
    
    # Evidence Summary
    key_manifestations: List[str] = field(default_factory=list)
    chief_complaint_context: Dict = field(default_factory=dict)
    
    # Confidence Indicators
    data_completeness: float = 0.0  # 0-1 scale
    reasoning_notes: List[str] = field(default_factory=list)


class TCMReasoningEngine:
    """
    Core reasoning engine that applies TCM diagnostic principles
    to interpret symptoms dynamically
    """
    
    def __init__(self):
        self.profile = None
    
    def analyze(self, observation_data: Dict, interrogation_data: Dict, 
                chief_complaint_data: Dict) -> TCMProfile:
        """
        Main analysis method - builds TCM profile from all data sources
        
        Args:
            observation_data: Data from observation module (望 Wàng)
            interrogation_data: Data from interrogation module (問 Wèn)
            chief_complaint_data: Chief complaint with context
            
        Returns:
            TCMProfile with interpreted characteristics
        """
        self.profile = TCMProfile()
        
        # Store chief complaint for context
        self.profile.chief_complaint_context = chief_complaint_data
        
        # Calculate data completeness
        self.profile.data_completeness = self._calculate_completeness(
            observation_data, interrogation_data, chief_complaint_data
        )
        
        # Apply Eight Principles analysis
        self._determine_interior_exterior(observation_data, interrogation_data)
        self._determine_hot_cold(observation_data, interrogation_data)
        self._determine_excess_deficiency(observation_data, interrogation_data, chief_complaint_data)
        self._determine_yin_yang()
        
        # Identify pathogenic factors
        self._identify_pathogenic_factors(observation_data, interrogation_data)
        
        # Assess Qi, Blood, Fluids
        self._assess_qi_status(observation_data, interrogation_data)
        self._assess_blood_status(observation_data, interrogation_data)
        self._assess_fluid_status(observation_data, interrogation_data)
        
        # Identify affected organ systems
        self._identify_affected_organs(observation_data, interrogation_data, chief_complaint_data)
        
        # Compile key manifestations
        self._compile_key_manifestations(observation_data, interrogation_data)
        
        return self.profile
    
    def _calculate_completeness(self, obs: Dict, interr: Dict, cc: Dict) -> float:
        """Calculate how complete the data is (0-1 scale)"""
        total_sections = 36  # 12 obs + 12 interr + 3 cc parts + 9 key data points
        completed = 0
        
        # Count observation sections
        completed += len([k for k in obs.keys() if obs[k].get('data')])
        
        # Count interrogation sections
        completed += len([k for k in interr.keys() if interr[k].get('data')])
        
        # Count chief complaint parts
        if cc.get('western_conditions'): completed += 1
        if cc.get('primary_concern'): completed += 1
        if cc.get('recent_symptoms'): completed += 1
        
        # Key data points that significantly impact reasoning
        key_data_points = [
            obs.get('tongue', {}).get('data', {}).get('body_color'),
            obs.get('tongue', {}).get('data', {}).get('coating_color'),
            obs.get('complexion', {}).get('data', {}).get('primary_color'),
            obs.get('shen', {}).get('data', {}).get('overall'),
            interr.get('chills-fever', {}).get('data', {}).get('fever_present'),
            interr.get('energy-vitality', {}).get('data', {}).get('energy_level'),
            interr.get('thirst-appetite', {}).get('data', {}).get('thirst'),
            interr.get('stools-urine', {}).get('data', {}).get('stool_consistency'),
            interr.get('sleep', {}).get('data', {}).get('sleep_quality'),
        ]
        completed += len([dp for dp in key_data_points if dp])
        
        return min(completed / total_sections, 1.0)
    
    def _determine_interior_exterior(self, obs: Dict, interr: Dict):
        """
        Determine if condition is Interior, Exterior, or Both
        
        Exterior: Sudden onset, fever, chills, body aches, exterior manifestations
        Interior: Chronic, affects organs, internal symptoms
        """
        exterior_indicators = []
        interior_indicators = []
        
        # Check for exterior patterns
        chills_fever = interr.get('chills-fever', {}).get('data', {})
        if chills_fever.get('fever_present') and chills_fever.get('chills_present'):
            exterior_indicators.append("simultaneous fever and chills")
        
        head_body = interr.get('head-body', {}).get('data', {})
        if head_body.get('body_aches'):
            exterior_indicators.append("body aches")
        
        # Check for interior patterns (chronic, organ involvement)
        cc = self.profile.chief_complaint_context
        if cc.get('primary_concern'):
            concern = cc['primary_concern'].lower()
            if any(word in concern for word in ['chronic', 'months', 'years', 'ongoing']):
                interior_indicators.append("chronic condition")
        
        energy = interr.get('energy-vitality', {}).get('data', {})
        if energy.get('energy_level') in ['Low', 'Very low', 'Exhausted']:
            interior_indicators.append("chronic low energy")
        
        # Organ-related symptoms indicate interior
        stools = interr.get('stools-urine', {}).get('data', {})
        if stools.get('stool_consistency') in ['Loose/watery', 'Constipated']:
            interior_indicators.append("digestive dysfunction")
        
        # Determine classification
        if exterior_indicators and not interior_indicators:
            self.profile.interior_exterior = "exterior"
        elif interior_indicators and not exterior_indicators:
            self.profile.interior_exterior = "interior"
        elif exterior_indicators and interior_indicators:
            self.profile.interior_exterior = "both"
        else:
            self.profile.interior_exterior = "interior"  # default for diagnostic work
        
        if exterior_indicators:
            self.profile.reasoning_notes.append(
                f"Exterior signs: {', '.join(exterior_indicators)}"
            )
        if interior_indicators:
            self.profile.reasoning_notes.append(
                f"Interior signs: {', '.join(interior_indicators)}"
            )
    
    def _determine_hot_cold(self, obs: Dict, interr: Dict):
        """
        Determine thermal nature: Hot, Cold, or Mixed
        
        Hot: Red tongue, yellow coating, thirst for cold, red face, heat sensations
        Cold: Pale tongue, white coating, no thirst, cold sensations, aversion to cold
        """
        hot_indicators = []
        cold_indicators = []
        
        # Tongue analysis (most reliable)
        tongue = obs.get('tongue', {}).get('data', {})
        tongue_color = tongue.get('body_color', '')
        coating_color = tongue.get('coating_color', '')
        
        if 'red' in tongue_color.lower():
            hot_indicators.append("red tongue body")
        elif 'pale' in tongue_color.lower():
            cold_indicators.append("pale tongue body")
        
        if 'yellow' in coating_color.lower():
            hot_indicators.append("yellow tongue coating")
        elif 'white' in coating_color.lower():
            cold_indicators.append("white tongue coating")
        
        # Thirst and temperature preferences
        thirst_appetite = interr.get('thirst-appetite', {}).get('data', {})
        thirst = thirst_appetite.get('thirst', '')
        if 'warm' in thirst.lower():
            cold_indicators.append("prefers warm drinks")
        elif 'cold' in thirst.lower():
            hot_indicators.append("prefers cold drinks")
        elif thirst == 'No thirst':
            cold_indicators.append("no thirst")
        
        # Chills and fever
        chills_fever = interr.get('chills-fever', {}).get('data', {})
        if chills_fever.get('fever_present'):
            hot_indicators.append("fever present")
        if chills_fever.get('chills_present') == 'Aversion to cold':
            cold_indicators.append("aversion to cold")
        
        # Body temperature
        hands = obs.get('hands', {}).get('data', {})
        feet = obs.get('feet', {}).get('data', {})
        if hands.get('temperature') == 'cold' or feet.get('temperature') == 'cold':
            cold_indicators.append("cold extremities")
        if hands.get('temperature') == 'hot_palms':
            hot_indicators.append("hot palms")
        
        # Complexion
        complexion = obs.get('complexion', {}).get('data', {})
        comp_color = complexion.get('primary_color', '')
        if 'red' in comp_color.lower():
            hot_indicators.append("red complexion")
        elif 'pale' in comp_color.lower():
            cold_indicators.append("pale complexion")
        
        # Perspiration
        perspiration = interr.get('perspiration', {}).get('data', {})
        if perspiration.get('sweating_pattern') == 'Night sweats':
            hot_indicators.append("night sweats")
        
        # Determine classification
        hot_score = len(hot_indicators)
        cold_score = len(cold_indicators)
        
        if hot_score > cold_score * 1.5:
            self.profile.hot_cold = "hot"
        elif cold_score > hot_score * 1.5:
            self.profile.hot_cold = "cold"
        elif hot_score > 0 and cold_score > 0:
            self.profile.hot_cold = "mixed"
        else:
            self.profile.hot_cold = "neutral"
        
        if hot_indicators:
            self.profile.reasoning_notes.append(f"Heat signs: {', '.join(hot_indicators)}")
        if cold_indicators:
            self.profile.reasoning_notes.append(f"Cold signs: {', '.join(cold_indicators)}")
    
    def _determine_excess_deficiency(self, obs: Dict, interr: Dict, cc: Dict):
        """
        Determine if condition is Excess, Deficiency, or Mixed
        
        Excess: Strong shen, loud voice, acute onset, full feeling, constipation
        Deficiency: Weak shen, weak voice, chronic, empty feeling, fatigue
        """
        excess_indicators = []
        deficiency_indicators = []
        
        # Shen (Spirit/Vitality) - most important indicator
        shen = obs.get('shen', {}).get('data', {})
        shen_overall = shen.get('overall', '')
        if shen_overall == 'weak':
            deficiency_indicators.append("weak shen (spirit)")
        elif shen_overall == 'strong':
            excess_indicators.append("strong shen")
        
        # Energy level
        energy = interr.get('energy-vitality', {}).get('data', {})
        energy_level = energy.get('energy_level', '')
        if energy_level in ['Low', 'Very low', 'Exhausted']:
            deficiency_indicators.append("chronic low energy")
        elif energy_level == 'High':
            excess_indicators.append("high energy")
        
        # Voice
        voice = obs.get('voice', {}).get('data', {})
        if voice.get('weak'):
            deficiency_indicators.append("weak voice")
        elif voice.get('loud'):
            excess_indicators.append("loud voice")
        
        # Tongue shape (swollen = deficiency/dampness, thin = deficiency)
        tongue = obs.get('tongue', {}).get('data', {})
        shape = tongue.get('body_shape', '')
        if 'thin' in shape.lower():
            deficiency_indicators.append("thin tongue")
        elif 'swollen' in shape.lower():
            # Swollen can indicate both deficiency (Qi def) or excess (dampness)
            # Context determines - if pale = deficiency, if thick coating = excess
            if tongue.get('body_color') == 'pale':
                deficiency_indicators.append("swollen pale tongue")
            elif tongue.get('coating_thickness') == 'thick':
                excess_indicators.append("swollen tongue with thick coating")
        
        # Stool consistency
        stools = interr.get('stools-urine', {}).get('data', {})
        stool = stools.get('stool_consistency', '')
        if stool == 'Loose/watery':
            deficiency_indicators.append("loose stools")
        elif stool == 'Constipated':
            excess_indicators.append("constipation")
        
        # Pulse (if we had pulse data - placeholder for Phase 3)
        # For now, infer from other data
        
        # Appetite
        thirst_appetite = interr.get('thirst-appetite', {}).get('data', {})
        appetite = thirst_appetite.get('appetite', '')
        if appetite in ['No appetite', 'Poor appetite']:
            deficiency_indicators.append("poor appetite")
        
        # Chief complaint duration
        if cc.get('primary_concern'):
            concern = cc['primary_concern'].lower()
            if any(word in concern for word in ['chronic', 'ongoing', 'years']):
                deficiency_indicators.append("chronic condition")
            elif any(word in concern for word in ['sudden', 'acute', 'recent']):
                excess_indicators.append("acute onset")
        
        # Determine classification
        excess_score = len(excess_indicators)
        deficiency_score = len(deficiency_indicators)
        
        if deficiency_score > excess_score * 1.5:
            self.profile.excess_deficiency = "deficiency"
        elif excess_score > deficiency_score * 1.5:
            self.profile.excess_deficiency = "excess"
        elif deficiency_score > 0 and excess_score > 0:
            self.profile.excess_deficiency = "mixed"
        else:
            # Default based on chronicity and energy
            if energy_level in ['Low', 'Very low', 'Exhausted']:
                self.profile.excess_deficiency = "deficiency"
            else:
                self.profile.excess_deficiency = "mixed"
        
        if excess_indicators:
            self.profile.reasoning_notes.append(f"Excess signs: {', '.join(excess_indicators)}")
        if deficiency_indicators:
            self.profile.reasoning_notes.append(f"Deficiency signs: {', '.join(deficiency_indicators)}")
    
    def _determine_yin_yang(self):
        """
        Overall Yin/Yang classification based on Eight Principles
        
        Yang: Exterior, Hot, Excess
        Yin: Interior, Cold, Deficiency
        """
        yang_count = 0
        yin_count = 0
        
        if self.profile.interior_exterior == "exterior":
            yang_count += 1
        elif self.profile.interior_exterior == "interior":
            yin_count += 1
        
        if self.profile.hot_cold == "hot":
            yang_count += 1
        elif self.profile.hot_cold == "cold":
            yin_count += 1
        
        if self.profile.excess_deficiency == "excess":
            yang_count += 1
        elif self.profile.excess_deficiency == "deficiency":
            yin_count += 1
        
        if yang_count > yin_count:
            self.profile.yin_yang = "yang"
        elif yin_count > yang_count:
            self.profile.yin_yang = "yin"
        else:
            self.profile.yin_yang = "balanced"
    
    def _identify_pathogenic_factors(self, obs: Dict, interr: Dict):
        """
        Identify pathogenic factors: Wind, Cold, Heat, Dampness, Dryness, Phlegm
        """
        factors = []
        
        # Dampness indicators
        tongue = obs.get('tongue', {}).get('data', {})
        coating_quality = tongue.get('coating_quality', '')
        if 'greasy' in coating_quality.lower() or 'sticky' in coating_quality.lower():
            factors.append("dampness")
        
        if tongue.get('coating_thickness') == 'thick':
            if coating_quality and 'greasy' in coating_quality.lower():
                factors.append("phlegm")
        
        body = obs.get('body_type', {}).get('data', {})
        if body.get('overweight'):
            if "dampness" not in factors:
                factors.append("dampness")
        
        stools = interr.get('stools-urine', {}).get('data', {})
        if stools.get('stool_consistency') == 'Loose/watery':
            if self.profile.hot_cold == "cold" and "dampness" not in factors:
                factors.append("dampness")
        
        # Heat/Fire
        if self.profile.hot_cold == "hot":
            if "heat" not in factors:
                factors.append("heat")
            
            # Check for fire (more severe heat)
            tongue_color = tongue.get('body_color', '')
            if 'dark red' in tongue_color.lower() or tongue.get('coating_color') == 'yellow thick':
                factors.append("fire")
        
        # Cold
        if self.profile.hot_cold == "cold":
            factors.append("cold")
        
        # Dryness
        if tongue.get('moisture') == 'dry':
            factors.append("dryness")
        
        # Wind (mainly in exterior conditions)
        if self.profile.interior_exterior == "exterior":
            head_body = interr.get('head-body', {}).get('data', {})
            if head_body.get('headaches') and head_body.get('body_aches'):
                factors.append("wind")
        
        self.profile.pathogenic_factors = factors
        if factors:
            self.profile.reasoning_notes.append(f"Pathogenic factors: {', '.join(factors)}")
    
    def _assess_qi_status(self, obs: Dict, interr: Dict):
        """Assess Qi status: deficient, stagnant, or normal"""
        deficiency_signs = []
        stagnation_signs = []
        
        # Qi deficiency signs
        shen = obs.get('shen', {}).get('data', {})
        if shen.get('overall') == 'weak':
            deficiency_signs.append("weak shen")
        
        energy = interr.get('energy-vitality', {}).get('data', {})
        if energy.get('energy_level') in ['Low', 'Very low', 'Exhausted']:
            deficiency_signs.append("fatigue")
        
        voice = obs.get('voice', {}).get('data', {})
        if voice.get('weak'):
            deficiency_signs.append("weak voice")
        
        # Qi stagnation signs (check chief complaint and specific symptoms)
        cc = self.profile.chief_complaint_context
        if cc.get('primary_concern'):
            concern = cc['primary_concern'].lower()
            if 'pain' in concern or 'distension' in concern:
                stagnation_signs.append("pain/distension")
        
        emotions = interr.get('emotions', {}).get('data', {})
        if emotions.get('emotional_state') in ['Irritable', 'Frustrated', 'Depressed']:
            stagnation_signs.append("emotional constraint")
        
        # Determine status
        if len(deficiency_signs) >= 2:
            self.profile.qi_status = "deficient"
            self.profile.reasoning_notes.append(f"Qi deficiency: {', '.join(deficiency_signs)}")
        elif len(stagnation_signs) >= 1:
            self.profile.qi_status = "stagnant"
            self.profile.reasoning_notes.append(f"Qi stagnation: {', '.join(stagnation_signs)}")
        else:
            self.profile.qi_status = "normal"
    
    def _assess_blood_status(self, obs: Dict, interr: Dict):
        """Assess Blood status: deficient, stagnant, heat, or normal"""
        deficiency_signs = []
        stagnation_signs = []
        heat_signs = []
        
        # Blood deficiency
        tongue = obs.get('tongue', {}).get('data', {})
        if tongue.get('body_color') == 'pale' and tongue.get('body_shape') == 'thin':
            deficiency_signs.append("pale thin tongue")
        
        complexion = obs.get('complexion', {}).get('data', {})
        if complexion.get('primary_color') == 'pale':
            deficiency_signs.append("pale complexion")
        
        nails = obs.get('nails', {}).get('data', {})
        if nails.get('color') == 'pale':
            deficiency_signs.append("pale nails")
        
        # Blood stagnation
        if 'purple' in tongue.get('body_color', '').lower():
            stagnation_signs.append("purple tongue")
        
        if tongue.get('features') and 'purple_spots' in tongue.get('features', []):
            stagnation_signs.append("purple spots on tongue")
        
        # Blood heat
        if self.profile.hot_cold == "hot" and tongue.get('body_color') == 'dark red':
            heat_signs.append("dark red tongue")
        
        # Determine status
        if len(deficiency_signs) >= 2:
            self.profile.blood_status = "deficient"
            self.profile.reasoning_notes.append(f"Blood deficiency: {', '.join(deficiency_signs)}")
        elif len(stagnation_signs) >= 1:
            self.profile.blood_status = "stagnant"
            self.profile.reasoning_notes.append(f"Blood stasis: {', '.join(stagnation_signs)}")
        elif len(heat_signs) >= 1:
            self.profile.blood_status = "heat"
            self.profile.reasoning_notes.append(f"Blood heat: {', '.join(heat_signs)}")
        else:
            self.profile.blood_status = "normal"
    
    def _assess_fluid_status(self, obs: Dict, interr: Dict):
        """Assess Body Fluids: deficient, excess, or normal"""
        deficiency_signs = []
        excess_signs = []
        
        # Fluid deficiency (dryness)
        tongue = obs.get('tongue', {}).get('data', {})
        if tongue.get('moisture') == 'dry':
            deficiency_signs.append("dry tongue")
        
        thirst = interr.get('thirst-appetite', {}).get('data', {}).get('thirst', '')
        if 'thirsty' in thirst.lower():
            deficiency_signs.append("thirsty")
        
        skin = obs.get('skin', {}).get('data', {})
        if skin.get('dry'):
            deficiency_signs.append("dry skin")
        
        # Fluid excess (dampness/phlegm already in pathogenic factors)
        if "dampness" in self.profile.pathogenic_factors:
            excess_signs.append("dampness")
        
        if tongue.get('coating_thickness') == 'thick':
            excess_signs.append("thick coating")
        
        # Determine status
        if len(deficiency_signs) >= 2:
            self.profile.fluid_status = "deficient"
            self.profile.reasoning_notes.append(f"Fluid deficiency: {', '.join(deficiency_signs)}")
        elif len(excess_signs) >= 1:
            self.profile.fluid_status = "excess"
            self.profile.reasoning_notes.append(f"Fluid excess: {', '.join(excess_signs)}")
        else:
            self.profile.fluid_status = "normal"
    
    def _identify_affected_organs(self, obs: Dict, interr: Dict, cc: Dict):
        """
        Identify which organ systems are affected based on symptoms and manifestations
        Using TCM organ theory, not Western anatomy
        """
        organs = set()
        
        # Spleen - digestive, transformation, transportation
        stools = interr.get('stools-urine', {}).get('data', {})
        thirst_appetite = interr.get('thirst-appetite', {}).get('data', {})
        
        if (stools.get('stool_consistency') == 'Loose/watery' or 
            thirst_appetite.get('appetite') in ['No appetite', 'Poor appetite']):
            organs.add("Spleen")
        
        tongue = obs.get('tongue', {}).get('data', {})
        if tongue.get('body_shape') == 'swollen' and tongue.get('body_color') == 'pale':
            organs.add("Spleen")
        
        # Kidney - essence, will, lower back, urination
        if stools.get('urination_frequency') and 'Night' in stools.get('urination_frequency', ''):
            organs.add("Kidney")
        
        head_body = interr.get('head-body', {}).get('data', {})
        if head_body.get('body_aches') and 'Back' in head_body.get('body_aches', []):
            organs.add("Kidney")
        
        if self.profile.hot_cold == "cold" and "cold extremities" in str(self.profile.reasoning_notes):
            organs.add("Kidney")
        
        # Liver - smooth flow of Qi, emotions, tendons
        emotions = interr.get('emotions', {}).get('data', {})
        if emotions.get('emotional_state') in ['Irritable', 'Frustrated', 'Angry']:
            organs.add("Liver")
        
        if tongue.get('features') and 'red_sides' in tongue.get('features', []):
            organs.add("Liver")
        
        # Heart - mind, sleep, palpitations
        sleep = interr.get('sleep', {}).get('data', {})
        if sleep.get('sleep_quality') in ['Poor', 'Very poor']:
            organs.add("Heart")
        
        if emotions.get('emotional_state') in ['Anxious', 'Worried']:
            organs.add("Heart")
        
        # Lung - Qi, breathing, skin
        energy = interr.get('energy-vitality', {}).get('data', {})
        if energy.get('energy_level') in ['Low', 'Very low', 'Exhausted']:
            # Could be Lung or Spleen - check other signs
            if self.profile.qi_status == "deficient":
                organs.add("Lung")
        
        skin = obs.get('skin', {}).get('data', {})
        if skin.get('dry') or skin.get('rough'):
            organs.add("Lung")
        
        # Check chief complaint for organ-specific issues
        if cc.get('primary_concern'):
            concern = cc['primary_concern'].lower()
            if 'digest' in concern or 'stomach' in concern or 'bowel' in concern:
                organs.add("Spleen")
                organs.add("Stomach")
            if 'sleep' in concern or 'anxiety' in concern or 'palpitation' in concern:
                organs.add("Heart")
            if 'anger' in concern or 'irritable' in concern or 'headache' in concern:
                organs.add("Liver")
            if 'fatigue' in concern or 'weakness' in concern:
                organs.add("Spleen")
                organs.add("Kidney")
        
        self.profile.affected_organs = sorted(list(organs))
        if organs:
            self.profile.reasoning_notes.append(f"Affected organs: {', '.join(sorted(organs))}")
    
    def _compile_key_manifestations(self, obs: Dict, interr: Dict):
        """
        Compile the most significant clinical manifestations
        These will be highlighted in the pattern matching
        """
        manifestations = []
        
        # Key tongue findings
        tongue = obs.get('tongue', {}).get('data', {})
        if tongue.get('body_color'):
            manifestations.append(f"Tongue: {tongue['body_color']}")
        if tongue.get('coating_color'):
            manifestations.append(f"Coating: {tongue['coating_color']}")
        
        # Key complexion
        complexion = obs.get('complexion', {}).get('data', {})
        if complexion.get('primary_color'):
            manifestations.append(f"Complexion: {complexion['primary_color']}")
        
        # Key energy/shen
        shen = obs.get('shen', {}).get('data', {})
        if shen.get('overall'):
            manifestations.append(f"Shen: {shen['overall']}")
        
        energy = interr.get('energy-vitality', {}).get('data', {})
        if energy.get('energy_level'):
            manifestations.append(f"Energy: {energy['energy_level']}")
        
        # Key symptoms from interrogation
        stools = interr.get('stools-urine', {}).get('data', {})
        if stools.get('stool_consistency'):
            manifestations.append(f"Stools: {stools['stool_consistency']}")
        
        sleep = interr.get('sleep', {}).get('data', {})
        if sleep.get('sleep_quality'):
            manifestations.append(f"Sleep: {sleep['sleep_quality']}")
        
        # Temperature
        if self.profile.hot_cold != "neutral":
            manifestations.append(f"Temperature: {self.profile.hot_cold}")
        
        self.profile.key_manifestations = manifestations
    
    def get_profile_summary(self) -> Dict:
        """Return profile as dictionary for API responses"""
        if not self.profile:
            return {}
        
        return {
            "eight_principles": {
                "interior_exterior": self.profile.interior_exterior,
                "hot_cold": self.profile.hot_cold,
                "excess_deficiency": self.profile.excess_deficiency,
                "yin_yang": self.profile.yin_yang
            },
            "affected_organs": self.profile.affected_organs,
            "pathogenic_factors": self.profile.pathogenic_factors,
            "qi_blood_fluids": {
                "qi": self.profile.qi_status,
                "blood": self.profile.blood_status,
                "fluids": self.profile.fluid_status
            },
            "key_manifestations": self.profile.key_manifestations,
            "chief_complaint_context": self.profile.chief_complaint_context,
            "data_completeness": round(self.profile.data_completeness * 100, 1),
            "reasoning_notes": self.profile.reasoning_notes
        }
