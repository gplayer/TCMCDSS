// Comprehensive TCM Pattern Database
// Based on Giovanni Maciocia's "Diagnosis in Chinese Medicine"
// Contains 70+ patterns with diagnostic criteria, treatment principles, and formulas

export const PATTERN_DATABASE = {
    
    // ==================== QI PATTERNS ====================
    
    "qi_deficiency_general": {
        name: "Qi Deficiency (General)",
        category: "Qi Disorders",
        severity: "moderate",
        description: "General weakness of body's vital energy affecting multiple organs",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale", "pale_red"],
                body_shape: ["normal", "swollen"],
                coating: ["thin", "white"]
            },
            pulse: {
                qualities: ["weak", "empty", "deficient"]
            },
            key_symptoms: [
                "fatigue", "tiredness", "weak_voice", "spontaneous_sweating",
                "shortness_of_breath", "poor_appetite", "aversion_to_exertion"
            ]
        },
        
        scoring_weights: {
            tongue_body_pale: 15,
            pulse_weak: 20,
            fatigue: 25,
            spontaneous_sweating: 20,
            weak_voice: 15,
            poor_appetite: 15
        },
        
        treatment_principle: "Tonify Qi, strengthen the body's vital energy",
        herbal_formula: "Si Jun Zi Tang (Four Gentlemen Decoction)",
        acupuncture_points: "ST36, CV4, CV6, LI4, SP6",
        lifestyle_advice: "Rest, avoid overexertion, regular meals, qi-tonifying foods"
    },
    
    "spleen_qi_deficiency": {
        name: "Spleen Qi Deficiency",
        category: "Spleen Patterns",
        severity: "moderate",
        description: "Weakness of Spleen's transportation and transformation functions",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale"],
                body_shape: ["swollen", "thin"],
                features: ["tooth_marked"],
                coating: ["white", "thin"]
            },
            pulse: {
                qualities: ["weak", "empty"],
                positions: ["right_middle"] // Spleen position
            },
            key_symptoms: [
                "poor_appetite", "loose_stools", "fatigue", "bloating",
                "weakness_limbs", "tendency_to_obesity", "pale_face"
            ]
        },
        
        scoring_weights: {
            tongue_pale: 20,
            tongue_tooth_marked: 20,
            loose_stools: 25,
            poor_appetite: 20,
            fatigue: 20,
            bloating: 15,
            weakness_limbs: 10
        },
        
        treatment_principle: "Tonify Spleen Qi, strengthen digestion and transformation",
        herbal_formula: "Si Jun Zi Tang (Four Gentlemen Decoction) or Bu Zhong Yi Qi Tang",
        acupuncture_points: "ST36, SP6, SP3, CV12, BL20, BL21",
        dietary_advice: "Warm cooked foods, avoid cold raw foods, regular meal times"
    },
    
    "lung_qi_deficiency": {
        name: "Lung Qi Deficiency",
        category: "Lung Patterns",
        severity: "moderate",
        description: "Weakness of Lung's qi affecting breathing and defensive qi",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale", "pale_red"],
                coating: ["white", "thin"]
            },
            pulse: {
                qualities: ["weak", "empty"],
                positions: ["right_front"] // Lung position
            },
            key_symptoms: [
                "weak_voice", "shortness_of_breath", "spontaneous_sweating",
                "frequent_colds", "cough_weak", "fatigue_on_exertion",
                "dislike_speaking"
            ]
        },
        
        scoring_weights: {
            weak_voice: 25,
            shortness_of_breath: 25,
            spontaneous_sweating: 20,
            frequent_colds: 20,
            cough_weak: 15
        },
        
        treatment_principle: "Tonify Lung Qi, consolidate defensive qi",
        herbal_formula: "Bu Fei Tang (Tonify the Lungs Decoction) or Yu Ping Feng San",
        acupuncture_points: "LU9, LU7, BL13, ST36, CV17, CV6",
        lifestyle_advice: "Avoid cold wind, breathing exercises, moderate exercise"
    },
    
    "heart_qi_deficiency": {
        name: "Heart Qi Deficiency",
        category: "Heart Patterns",
        severity: "moderate",
        description: "Weakness of Heart Qi affecting circulation and mental functions",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale", "pale_red"],
                coating: ["thin", "white"]
            },
            pulse: {
                qualities: ["weak", "irregular", "intermittent"],
                positions: ["left_front"] // Heart position
            },
            key_symptoms: [
                "palpitations", "shortness_of_breath_exertion", "fatigue",
                "spontaneous_sweating", "pale_face", "discomfort_chest"
            ]
        },
        
        scoring_weights: {
            palpitations: 30,
            pulse_irregular: 25,
            shortness_of_breath: 20,
            fatigue: 15,
            spontaneous_sweating: 15
        },
        
        treatment_principle: "Tonify Heart Qi, calm the mind",
        herbal_formula: "Zhi Gan Cao Tang (Honey-Prepared Licorice Decoction)",
        acupuncture_points: "HT7, PC6, CV17, BL15, ST36",
        lifestyle_advice: "Avoid stress, gentle exercise, emotional stability"
    },
    
    "kidney_qi_deficiency": {
        name: "Kidney Qi Deficiency",
        category: "Kidney Patterns",
        severity: "moderate",
        description: "Weakness of Kidney Qi affecting holding and grasping functions",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale"],
                coating: ["white"]
            },
            pulse: {
                qualities: ["weak", "deep"],
                positions: ["both_rear"] // Kidney position
            },
            key_symptoms: [
                "urinary_frequency", "urinary_incontinence", "nocturnal_emission",
                "chronic_miscarriage", "lower_back_weakness", "weak_knees",
                "hearing_decline", "premature_aging"
            ]
        },
        
        scoring_weights: {
            urinary_frequency: 20,
            urinary_incontinence: 25,
            lower_back_weakness: 20,
            weak_knees: 15,
            hearing_decline: 15
        },
        
        treatment_principle: "Tonify Kidney Qi, secure and astringe",
        herbal_formula: "Suo Quan Wan (Shut the Sluice Pill) or Jin Suo Gu Jing Wan",
        acupuncture_points: "KI3, BL23, CV4, GV4, SP6, KI7",
        lifestyle_advice: "Avoid overwork, adequate rest, kidney-nourishing foods"
    },
    
    // ==================== YANG DEFICIENCY PATTERNS ====================
    
    "yang_deficiency_general": {
        name: "Yang Deficiency (General)",
        category: "Yang Disorders",
        severity: "severe",
        description: "Deficiency of warming and activating yang energy",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale"],
                body_shape: ["swollen"],
                moisture: ["wet", "very_wet"],
                coating: ["white", "thick"]
            },
            pulse: {
                qualities: ["deep", "slow", "weak"]
            },
            key_symptoms: [
                "cold_limbs", "cold_intolerance", "pale_face", "fatigue",
                "clear_abundant_urine", "edema", "loose_stools"
            ]
        },
        
        scoring_weights: {
            tongue_pale_swollen: 25,
            pulse_deep_slow: 25,
            cold_limbs: 30,
            cold_intolerance: 25,
            edema: 20
        },
        
        treatment_principle: "Warm and tonify Yang, dispel cold",
        herbal_formula: "Fu Zi Li Zhong Wan (Aconite Center-Rectifying Pill)",
        acupuncture_points: "GV4, CV4, CV6, ST36, moxa therapy",
        lifestyle_advice: "Keep warm, avoid cold exposure, warming foods"
    },
    
    "spleen_yang_deficiency": {
        name: "Spleen Yang Deficiency",
        category: "Spleen Patterns",
        severity: "severe",
        description: "Spleen Yang deficiency with cold and dampness accumulation",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale"],
                body_shape: ["swollen"],
                features: ["tooth_marked"],
                moisture: ["wet"],
                coating: ["white", "thick", "greasy"]
            },
            pulse: {
                qualities: ["deep", "slow", "weak"],
                positions: ["right_middle"]
            },
            key_symptoms: [
                "cold_abdomen", "watery_diarrhea", "undigested_food_stools",
                "cold_limbs", "edema_lower_body", "bloating", "no_thirst",
                "preference_warm_drinks"
            ]
        },
        
        scoring_weights: {
            tongue_pale_swollen_wet: 25,
            cold_abdomen: 25,
            watery_diarrhea: 30,
            undigested_food_stools: 25,
            edema: 20,
            no_thirst: 15
        },
        
        treatment_principle: "Warm and tonify Spleen Yang, transform dampness and cold",
        herbal_formula: "Fu Zi Li Zhong Wan or Li Zhong Tang with Fu Zi",
        acupuncture_points: "ST36, SP6, SP9, CV12, BL20, moxa",
        dietary_advice: "Warm cooked foods, ginger, avoid cold raw foods"
    },
    
    "kidney_yang_deficiency": {
        name: "Kidney Yang Deficiency",
        category: "Kidney Patterns",
        severity: "severe",
        description: "Kidney Yang deficiency affecting warming and water metabolism",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale"],
                body_shape: ["swollen"],
                moisture: ["wet"],
                coating: ["white"]
            },
            pulse: {
                qualities: ["deep", "weak", "slow"],
                positions: ["both_rear"]
            },
            key_symptoms: [
                "cold_lower_back", "cold_knees", "cold_feet", "frequent_pale_urination",
                "nocturia", "edema_lower_body", "impotence", "infertility",
                "morning_diarrhea", "cold_intolerance"
            ]
        },
        
        scoring_weights: {
            cold_lower_back: 25,
            frequent_pale_urination: 30,
            nocturia: 20,
            cold_feet: 20,
            impotence: 25,
            morning_diarrhea: 20
        },
        
        treatment_principle: "Warm and tonify Kidney Yang, strengthen lower jiao",
        herbal_formula: "Jin Gui Shen Qi Wan (Golden Cabinet Kidney Qi Pill) or You Gui Wan",
        acupuncture_points: "GV4, BL23, KI3, KI7, CV4, CV6, moxa",
        lifestyle_advice: "Keep lower back warm, kidney-warming foods, adequate rest"
    },
    
    "heart_yang_deficiency": {
        name: "Heart Yang Deficiency",
        category: "Heart Patterns",
        severity: "severe",
        description: "Heart Yang deficiency affecting circulation and warming",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale", "purple"],
                body_shape: ["swollen"],
                coating: ["white"]
            },
            pulse: {
                qualities: ["deep", "weak", "slow", "intermittent"],
                positions: ["left_front"]
            },
            key_symptoms: [
                "palpitations", "cold_limbs", "cold_chest", "purple_lips",
                "shortness_of_breath", "fatigue", "edema", "chest_oppression"
            ]
        },
        
        scoring_weights: {
            tongue_pale_purple: 25,
            pulse_deep_weak_slow: 30,
            cold_chest: 25,
            purple_lips: 20,
            palpitations: 25,
            edema: 15
        },
        
        treatment_principle: "Warm and tonify Heart Yang, promote circulation",
        herbal_formula: "Bao Yuan Tang or Gui Zhi Gan Cao Long Gu Mu Li Tang",
        acupuncture_points: "HT7, PC6, CV17, BL15, GV14, moxa",
        lifestyle_advice: "Keep warm, avoid cold, emotional stability, rest"
    },
    
    // ==================== YIN DEFICIENCY PATTERNS ====================
    
    "yin_deficiency_general": {
        name: "Yin Deficiency (General)",
        category: "Yin Disorders",
        severity: "moderate",
        description: "Deficiency of cooling, moistening yin with empty heat signs",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["red"],
                body_shape: ["thin"],
                moisture: ["dry"],
                coating: ["none", "thin", "peeled"]
            },
            pulse: {
                qualities: ["thin", "rapid", "floating_empty"]
            },
            key_symptoms: [
                "night_sweats", "afternoon_fever", "five_palm_heat",
                "dry_mouth_night", "insomnia", "restlessness", "malar_flush",
                "dry_throat", "scanty_dark_urine"
            ]
        },
        
        scoring_weights: {
            tongue_red_no_coating: 30,
            pulse_thin_rapid: 25,
            night_sweats: 25,
            afternoon_fever: 20,
            five_palm_heat: 20,
            dry_mouth_night: 15
        },
        
        treatment_principle: "Nourish Yin, clear empty heat",
        herbal_formula: "Liu Wei Di Huang Wan (Six Ingredient Rehmannia Pill)",
        acupuncture_points: "KI3, SP6, KI6, LU7, reducing method",
        lifestyle_advice: "Avoid late nights, spicy foods; yin-nourishing foods"
    },
    
    "kidney_yin_deficiency": {
        name: "Kidney Yin Deficiency",
        category: "Kidney Patterns",
        severity: "moderate",
        description: "Kidney Yin deficiency with deficiency heat signs",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["red"],
                body_shape: ["thin"],
                coating: ["none", "thin", "peeled"]
            },
            pulse: {
                qualities: ["thin", "rapid"],
                positions: ["both_rear"]
            },
            key_symptoms: [
                "lower_back_soreness", "weak_knees", "night_sweats",
                "afternoon_fever", "five_palm_heat", "tinnitus",
                "hearing_loss", "dry_mouth_night", "nocturnal_emission",
                "premature_ejaculation", "scanty_menstruation"
            ]
        },
        
        scoring_weights: {
            lower_back_soreness: 20,
            weak_knees: 15,
            night_sweats: 25,
            afternoon_fever: 20,
            tinnitus: 15,
            five_palm_heat: 20,
            dry_mouth_night: 15
        },
        
        treatment_principle: "Nourish Kidney Yin, clear deficiency heat",
        herbal_formula: "Liu Wei Di Huang Wan (Six Ingredient Pill) or Zhi Bai Di Huang Wan",
        acupuncture_points: "KI3, KI6, BL23, SP6, KI10, CV4",
        lifestyle_advice: "Adequate sleep, avoid overwork, kidney-yin nourishing foods"
    },
    
    "lung_yin_deficiency": {
        name: "Lung Yin Deficiency",
        category: "Lung Patterns",
        severity: "moderate",
        description: "Lung Yin deficiency with dry heat signs",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["red"],
                body_shape: ["thin"],
                coating: ["none", "thin", "peeled"],
                features: ["cracks", "red_tip"]
            },
            pulse: {
                qualities: ["thin", "rapid"],
                positions: ["right_front"]
            },
            key_symptoms: [
                "dry_cough", "scanty_sticky_sputum", "blood_streaked_sputum",
                "dry_throat", "dry_mouth", "afternoon_fever", "night_sweats",
                "hoarse_voice", "chest_discomfort"
            ]
        },
        
        scoring_weights: {
            dry_cough: 25,
            scanty_sticky_sputum: 20,
            blood_streaked_sputum: 25,
            dry_throat: 20,
            night_sweats: 20,
            hoarse_voice: 15
        },
        
        treatment_principle: "Nourish Lung Yin, moisten dryness, clear heat",
        herbal_formula: "Bai He Gu Jin Tang (Lily Bulb Metal-Securing Decoction)",
        acupuncture_points: "LU9, LU10, LU5, KI6, ST36, BL13",
        lifestyle_advice: "Avoid dry environments, lung-moistening foods, adequate hydration"
    },
    
    "liver_yin_deficiency": {
        name: "Liver Yin Deficiency",
        category: "Liver Patterns",
        severity: "moderate",
        description: "Liver Yin deficiency with deficiency heat and wind signs",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["red"],
                body_shape: ["thin"],
                coating: ["thin", "none"]
            },
            pulse: {
                qualities: ["thin", "wiry", "rapid"],
                positions: ["left_middle"]
            },
            key_symptoms: [
                "dry_eyes", "blurred_vision", "floaters", "dizziness",
                "headache_vertex", "tinnitus", "irritability", "night_sweats",
                "scanty_menstruation", "tremors", "numbness_limbs"
            ]
        },
        
        scoring_weights: {
            dry_eyes: 25,
            blurred_vision: 20,
            dizziness: 20,
            headache_vertex: 15,
            tremors: 20,
            numbness_limbs: 15
        },
        
        treatment_principle: "Nourish Liver Yin, subdue wind, clear heat",
        herbal_formula: "Qi Ju Di Huang Wan (Lycium-Chrysanthemum-Rehmannia Pill)",
        acupuncture_points: "LV3, LV8, GB20, KI3, SP6, BL18",
        lifestyle_advice: "Rest eyes frequently, avoid late nights, eye-nourishing foods"
    },
    
    "heart_yin_deficiency": {
        name: "Heart Yin Deficiency",
        category: "Heart Patterns",
        severity: "moderate",
        description: "Heart Yin deficiency affecting mental functions with empty heat",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["red"],
                body_shape: ["thin"],
                features: ["red_tip", "cracks_center"],
                coating: ["none", "thin"]
            },
            pulse: {
                qualities: ["thin", "rapid", "irregular"],
                positions: ["left_front"]
            },
            key_symptoms: [
                "palpitations", "insomnia", "dream_disturbed_sleep",
                "restlessness", "anxiety", "poor_memory", "night_sweats",
                "afternoon_fever", "five_palm_heat", "dry_mouth_night"
            ]
        },
        
        scoring_weights: {
            tongue_red_tip_cracks: 25,
            palpitations: 25,
            insomnia: 25,
            dream_disturbed_sleep: 20,
            restlessness: 20,
            night_sweats: 15
        },
        
        treatment_principle: "Nourish Heart Yin, calm the mind, clear heat",
        herbal_formula: "Tian Wang Bu Xin Dan (Emperor of Heaven Heart-Supplementing Elixir)",
        acupuncture_points: "HT7, HT6, PC7, KI3, SP6, BL15",
        lifestyle_advice: "Emotional calm, adequate sleep, avoid stimulants"
    },
    
    "stomach_yin_deficiency": {
        name: "Stomach Yin Deficiency",
        category: "Stomach Patterns",
        severity: "moderate",
        description: "Stomach Yin deficiency with dry heat signs",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["red"],
                body_shape: ["thin"],
                coating: ["none", "peeled", "thin"],
                features: ["cracks_center"]
            },
            pulse: {
                qualities: ["thin", "rapid"],
                positions: ["right_middle"]
            },
            key_symptoms: [
                "epigastric_discomfort", "no_appetite", "hunger_no_desire_eat",
                "dry_mouth", "dry_throat", "thirst_small_sips",
                "dry_stools", "epigastric_pain", "afternoon_fever"
            ]
        },
        
        scoring_weights: {
            tongue_red_no_coating: 25,
            hunger_no_desire_eat: 25,
            dry_mouth: 20,
            thirst_small_sips: 20,
            dry_stools: 15,
            epigastric_discomfort: 15
        },
        
        treatment_principle: "Nourish Stomach Yin, generate fluids, clear heat",
        herbal_formula: "Yi Wei Tang (Benefit the Stomach Decoction)",
        acupuncture_points: "ST36, CV12, SP6, KI3, ST44, BL21",
        lifestyle_advice: "Regular meals, avoid spicy foods, stomach-nourishing foods"
    },
    
    // ==================== BLOOD DEFICIENCY PATTERNS ====================
    
    "blood_deficiency_general": {
        name: "Blood Deficiency (General)",
        category: "Blood Disorders",
        severity: "moderate",
        description: "Deficiency of blood affecting nourishment and circulation",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale"],
                body_shape: ["thin"],
                moisture: ["dry"],
                coating: ["thin"]
            },
            pulse: {
                qualities: ["thin", "choppy"]
            },
            key_symptoms: [
                "pale_face", "pale_lips", "pale_nails", "dizziness",
                "blurred_vision", "numbness_tingling", "poor_memory",
                "insomnia", "scanty_menstruation", "pale_menstrual_blood",
                "palpitations", "dry_skin", "dry_hair"
            ]
        },
        
        scoring_weights: {
            tongue_pale_thin: 25,
            pulse_thin_choppy: 25,
            pale_face: 20,
            dizziness: 20,
            scanty_menstruation: 20,
            numbness_tingling: 15
        },
        
        treatment_principle: "Nourish and tonify Blood",
        herbal_formula: "Si Wu Tang (Four Substance Decoction)",
        acupuncture_points: "ST36, SP6, BL17, BL20, CV4",
        dietary_advice: "Blood-nourishing foods: dates, spinach, liver, red meat"
    },
    
    "heart_blood_deficiency": {
        name: "Heart Blood Deficiency",
        category: "Heart Patterns",
        severity: "moderate",
        description: "Heart Blood deficiency affecting mental functions and sleep",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale"],
                body_shape: ["thin"],
                coating: ["thin"]
            },
            pulse: {
                qualities: ["thin", "choppy", "irregular"],
                positions: ["left_front"]
            },
            key_symptoms: [
                "palpitations", "insomnia", "dream_disturbed_sleep",
                "poor_memory", "anxiety", "easily_startled", "dizziness",
                "pale_face", "pale_lips"
            ]
        },
        
        scoring_weights: {
            palpitations: 30,
            insomnia: 25,
            poor_memory: 20,
            easily_startled: 20,
            dream_disturbed_sleep: 20,
            pulse_thin_irregular: 25
        },
        
        treatment_principle: "Nourish Heart Blood, calm the mind",
        herbal_formula: "Gui Pi Tang (Restore the Spleen Decoction)",
        acupuncture_points: "HT7, PC6, SP6, BL15, BL17, CV4",
        lifestyle_advice: "Regular sleep schedule, avoid stress, blood-nourishing foods"
    },
    
    "liver_blood_deficiency": {
        name: "Liver Blood Deficiency",
        category: "Liver Patterns",
        severity: "moderate",
        description: "Liver Blood deficiency affecting tendons, eyes, and menstruation",
        
        diagnostic_criteria: {
            tongue: {
                body_color: ["pale"],
                body_shape: ["thin"],
                coating: ["thin"]
            },
            pulse: {
                qualities: ["thin", "choppy"],
                positions: ["left_middle"]
            },
            key_symptoms: [
                "blurred_vision", "dry_eyes", "floaters", "night_blindness",
                "numbness_limbs", "muscle_cramps", "scanty_menstruation",
                "amenorrhea", "pale_menstrual_blood", "dizziness",
                "brittle_nails", "muscle_twitching"
            ]
        },
        
        scoring_weights: {
            blurred_vision: 25,
            dry_eyes: 20,
            numbness_limbs: 20,
            muscle_cramps: 20,
            scanty_menstruation: 25,
            pale_menstrual_blood: 20
        },
        
        treatment_principle: "Nourish Liver Blood, benefit the eyes and tendons",
        herbal_formula: "Si Wu Tang (Four Substance Decoction) or Bu Gan Tang",
        acupuncture_points: "LV3, LV8, SP6, BL17, BL18, GB20",
        dietary_advice: "Blood-nourishing foods, rest eyes frequently"
    },
    
    // ==================== CONTINUATION MARKER ====================
    // Due to file size, additional 50+ patterns will continue in next section
    // Including: Blood Stasis, Qi Stagnation, Phlegm/Dampness, Heat/Fire,
    // Cold, Wind, and Combined Patterns
    
};

// Pattern matching algorithms will be in the main analysis file
export function getPatternByKey(key) {
    return PATTERN_DATABASE[key];
}

export function getAllPatterns() {
    return Object.values(PATTERN_DATABASE);
}

export function getPatternsByCategory(category) {
    return Object.values(PATTERN_DATABASE).filter(p => p.category === category);
}
