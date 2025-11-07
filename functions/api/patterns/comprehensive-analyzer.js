// Comprehensive TCM Pattern Analysis Engine
// Based on Giovanni Maciocia's "Diagnosis in Chinese Medicine"
// Implements 40+ core patterns with intelligent multi-pattern detection

export async function analyzePatterns(observations, interrogations, chiefComplaint) {
    const detectedPatterns = [];
    
    // Run all pattern analyzers
    const allPatterns = [
        ...analyzeQiPatterns(observations, interrogations, chiefComplaint),
        ...analyzeYangPatterns(observations, interrogations, chiefComplaint),
        ...analyzeYinPatterns(observations, interrogations, chiefComplaint),
        ...analyzeBloodPatterns(observations, interrogations, chiefComplaint),
        ...analyzeQiStagnationPatterns(observations, interrogations, chiefComplaint),
        ...analyzeBloodStasisPatterns(observations, interrogations, chiefComplaint),
        ...analyzePhlegmDampnessPatterns(observations, interrogations, chiefComplaint),
        ...analyzeHeatFirePatterns(observations, interrogations, chiefComplaint),
        ...analyzeColdPatterns(observations, interrogations, chiefComplaint),
        ...analyzeWindPatterns(observations, interrogations, chiefComplaint),
        ...analyzeExteriorPatterns(observations, interrogations, chiefComplaint),
        ...analyzeDampHeatPatterns(observations, interrogations, chiefComplaint),
        ...analyzeAdditionalOrganPatterns(observations, interrogations, chiefComplaint),
        ...analyzeCombinedPatterns(observations, interrogations, chiefComplaint),
        ...analyzeWindDampPatterns(observations, interrogations, chiefComplaint)
    ];
    
    // Filter patterns with sufficient evidence (score > threshold)
    const significantPatterns = allPatterns.filter(p => p.confidence >= 30);
    
    // Sort by confidence
    significantPatterns.sort((a, b) => b.confidence - a.confidence);
    
    // Take top 5 patterns
    const topPatterns = significantPatterns.slice(0, 5);
    
    // Calculate overall confidence
    const overallConfidence = topPatterns.length > 0 
        ? Math.round(topPatterns.reduce((sum, p) => sum + p.confidence, 0) / topPatterns.length)
        : 0;
    
    // Calculate data completeness
    const dataCompleteness = calculateDataCompleteness(observations, interrogations);
    
    return {
        patterns: topPatterns,
        overall_confidence: overallConfidence,
        data_completeness: dataCompleteness,
        total_patterns_evaluated: allPatterns.length,
        ai_enhancement_available: true // Flag for future AI integration
    };
}

// ==================== QI PATTERNS ====================

function analyzeQiPatterns(obs, int, cc) {
    const patterns = [];
    
    // Spleen Qi Deficiency
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.body_color === 'pale') {
        score += 20;
        evidence.push('Pale tongue indicates Qi/Blood deficiency');
    }
    if (obs.tongue?.body_shape === 'swollen') {
        score += 15;
        evidence.push('Swollen tongue indicates Spleen Qi deficiency');
    }
    if (obs.tongue?.features?.includes('tooth_marked')) {
        score += 20;
        evidence.push('Tooth-marked tongue indicates Spleen Qi deficiency with dampness');
    }
    if (int.digestion?.appetite === 'poor' || int.digestion?.appetite === 'no_appetite') {
        score += 20;
        evidence.push('Poor appetite indicates Spleen Qi deficiency');
    }
    if (int.digestion?.stools === 'loose' || int.digestion?.stools === 'watery') {
        score += 25;
        evidence.push('Loose stools indicate Spleen Qi deficiency');
    }
    if (int.energy?.overall_energy === 'low' || int.energy?.overall_energy === 'fatigued') {
        score += 20;
        evidence.push('Chronic fatigue indicates Qi deficiency');
    }
    if (int.digestion?.bloating === 'moderate' || int.digestion?.bloating === 'severe') {
        score += 15;
        evidence.push('Bloating indicates Spleen Qi deficiency');
    }
    
    // Chief complaint context
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['fatigue', 'tired', 'digestive', 'bloating', 'loose stool', 'diarrhea'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Spleen Qi deficiency');
        }
    }
    
    if (score >= 30) {
        patterns.push({
            name: 'Spleen Qi Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Weakness of Spleen\'s transformation and transportation functions leading to poor digestion and energy',
            treatment_principle: 'Tonify Spleen Qi, strengthen digestion, resolve dampness',
            herbal_formula: 'Si Jun Zi Tang (Four Gentlemen Decoction) or Bu Zhong Yi Qi Tang',
            acupuncture_points: 'ST36, SP6, SP3, CV12, BL20, BL21',
            dietary_advice: 'Warm cooked foods, regular meals, avoid cold/raw foods',
            category: 'Spleen Patterns'
        });
    }
    
    // Lung Qi Deficiency
    score = 0;
    evidence = [];
    
    if (obs.voice?.quality === 'weak') {
        score += 25;
        evidence.push('Weak voice indicates Lung Qi deficiency');
    }
    if (int.breathing?.quality === 'shortness' || int.breathing?.quality === 'weak') {
        score += 25;
        evidence.push('Shortness of breath indicates Lung Qi deficiency');
    }
    if (int.sweating?.type === 'spontaneous') {
        score += 20;
        evidence.push('Spontaneous sweating indicates Lung Qi deficiency with weak defensive Qi');
    }
    if (int.respiratory?.frequency === 'frequent_colds') {
        score += 20;
        evidence.push('Frequent colds indicate weak defensive Qi');
    }
    if (int.energy?.overall_energy === 'low') {
        score += 15;
        evidence.push('Fatigue on exertion indicates Qi deficiency');
    }
    
    if (score >= 30) {
        patterns.push({
            name: 'Lung Qi Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Weakness of Lung Qi affecting breathing and defensive Qi',
            treatment_principle: 'Tonify Lung Qi, consolidate defensive Qi',
            herbal_formula: 'Bu Fei Tang (Tonify Lungs Decoction) or Yu Ping Feng San',
            acupuncture_points: 'LU9, LU7, BL13, ST36, CV17',
            dietary_advice: 'Lung-strengthening foods, avoid cold exposure',
            category: 'Lung Patterns'
        });
    }
    
    // Heart Qi Deficiency
    score = 0;
    evidence = [];
    
    if (int.cardiovascular?.palpitations === true || int.cardiovascular?.palpitations === 'frequent') {
        score += 30;
        evidence.push('Palpitations indicate Heart Qi deficiency');
    }
    if (int.breathing?.quality === 'shortness_on_exertion') {
        score += 20;
        evidence.push('Shortness of breath on exertion indicates Heart Qi deficiency');
    }
    if (int.sweating?.type === 'spontaneous') {
        score += 15;
        evidence.push('Spontaneous sweating indicates Qi deficiency');
    }
    if (obs.complexion?.primary_color === 'pale') {
        score += 20;
        evidence.push('Pale complexion indicates Qi/Blood deficiency');
    }
    
    if (score >= 30) {
        patterns.push({
            name: 'Heart Qi Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Weakness of Heart Qi affecting circulation and mental functions',
            treatment_principle: 'Tonify Heart Qi, calm the mind',
            herbal_formula: 'Zhi Gan Cao Tang (Honey-Prepared Licorice Decoction)',
            acupuncture_points: 'HT7, PC6, CV17, BL15, ST36',
            dietary_advice: 'Heart-nourishing foods, avoid stress',
            category: 'Heart Patterns'
        });
    }
    
    // Kidney Qi Deficiency
    score = 0;
    evidence = [];
    
    if (int.urination?.frequency === 'frequent') {
        score += 25;
        evidence.push('Frequent urination indicates Kidney Qi not securing');
    }
    if (int.urination?.urgency === 'urgent' || int.urination?.incontinence === true) {
        score += 25;
        evidence.push('Urinary urgency/incontinence indicates Kidney Qi deficiency');
    }
    if (int.back?.pain === 'lower_back' && int.back?.quality === 'aching') {
        score += 20;
        evidence.push('Lower back weakness indicates Kidney Qi deficiency');
    }
    if (int.hearing?.quality === 'declining' || int.hearing?.tinnitus === true) {
        score += 15;
        evidence.push('Hearing decline/tinnitus indicates Kidney Qi deficiency');
    }
    
    if (score >= 30) {
        patterns.push({
            name: 'Kidney Qi Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Weakness of Kidney Qi affecting holding and grasping functions',
            treatment_principle: 'Tonify Kidney Qi, secure and astringe',
            herbal_formula: 'Suo Quan Wan (Shut the Sluice Pill)',
            acupuncture_points: 'KI3, BL23, CV4, GV4, SP6',
            dietary_advice: 'Kidney-tonifying foods, adequate rest',
            category: 'Kidney Patterns'
        });
    }
    
    return patterns;
}

// ==================== YANG PATTERNS ====================

function analyzeYangPatterns(obs, int, cc) {
    const patterns = [];
    
    // Kidney Yang Deficiency
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.body_color === 'pale' && obs.tongue?.body_shape === 'swollen') {
        score += 25;
        evidence.push('Pale swollen tongue indicates Yang deficiency');
    }
    if (obs.tongue?.moisture === 'wet' || obs.tongue?.moisture === 'very_wet') {
        score += 20;
        evidence.push('Wet tongue indicates Yang deficiency with fluid retention');
    }
    if (int.temperature?.feeling === 'cold' || int.temperature?.feeling === 'chilly') {
        score += 30;
        evidence.push('Cold intolerance indicates Yang deficiency');
    }
    if (int.temperature?.extremities === 'cold_hands' || int.temperature?.extremities === 'cold_feet') {
        score += 25;
        evidence.push('Cold extremities indicate Yang deficiency');
    }
    if (int.urination?.frequency === 'frequent' && int.urination?.color === 'clear') {
        score += 25;
        evidence.push('Frequent clear urination indicates Kidney Yang deficiency');
    }
    if (int.urination?.nocturia === true || int.urination?.nocturia === 'frequent') {
        score += 20;
        evidence.push('Nocturia indicates Kidney Yang deficiency');
    }
    if (int.back?.pain === 'lower_back' && int.temperature?.feeling === 'cold') {
        score += 20;
        evidence.push('Cold lower back pain indicates Kidney Yang deficiency');
    }
    if (int.digestion?.stools === 'early_morning_diarrhea') {
        score += 25;
        evidence.push('Morning diarrhea indicates Kidney Yang deficiency');
    }
    if (int.sexual?.libido === 'low' || int.sexual?.impotence === true) {
        score += 20;
        evidence.push('Sexual dysfunction indicates Kidney Yang deficiency');
    }
    if (int.edema?.location === 'lower_body' || int.edema?.location === 'ankles') {
        score += 15;
        evidence.push('Lower body edema indicates Yang deficiency');
    }
    
    // Chief complaint keywords
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['cold', 'back pain', 'frequent urination', 'impotence', 'edema'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Kidney Yang deficiency');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Kidney Yang Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Kidney Yang affecting warming and water metabolism functions',
            treatment_principle: 'Warm and tonify Kidney Yang, strengthen lower jiao',
            herbal_formula: 'Jin Gui Shen Qi Wan (Golden Cabinet Kidney Qi Pill) or You Gui Wan',
            acupuncture_points: 'GV4, BL23, KI3, KI7, CV4, CV6 (with moxa)',
            dietary_advice: 'Warming foods, avoid cold exposure, kidney-yang tonifying foods',
            category: 'Kidney Patterns'
        });
    }
    
    // Spleen Yang Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'pale' && obs.tongue?.body_shape === 'swollen') {
        score += 25;
        evidence.push('Pale swollen tongue indicates Yang deficiency');
    }
    if (obs.tongue?.moisture === 'wet' && obs.tongue?.coating_thickness === 'thick') {
        score += 20;
        evidence.push('Wet tongue with thick coating indicates Spleen Yang deficiency with dampness');
    }
    if (int.digestion?.stools === 'watery' || int.digestion?.stools === 'undigested_food') {
        score += 30;
        evidence.push('Watery stools with undigested food indicate Spleen Yang deficiency');
    }
    if (int.temperature?.abdomen === 'cold' || int.digestion?.cold_abdomen === true) {
        score += 25;
        evidence.push('Cold abdomen indicates Spleen Yang deficiency');
    }
    if (int.temperature?.feeling === 'cold') {
        score += 20;
        evidence.push('Cold intolerance indicates Yang deficiency');
    }
    if (int.digestion?.appetite === 'poor') {
        score += 15;
        evidence.push('Poor appetite indicates Spleen dysfunction');
    }
    if (int.edema?.location === 'lower_body' || int.edema?.generalized === true) {
        score += 20;
        evidence.push('Edema indicates Spleen Yang deficiency with fluid retention');
    }
    if (int.thirst?.quality === 'no_thirst' || int.thirst?.preference === 'warm_drinks') {
        score += 15;
        evidence.push('No thirst or preference for warm drinks indicates Yang deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Spleen Yang Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Spleen Yang with cold and dampness accumulation',
            treatment_principle: 'Warm and tonify Spleen Yang, transform dampness and cold',
            herbal_formula: 'Fu Zi Li Zhong Wan (Aconite Center-Rectifying Pill)',
            acupuncture_points: 'ST36, SP6, SP9, CV12, BL20 (with moxa)',
            dietary_advice: 'Warm cooked foods, ginger, avoid cold/raw foods',
            category: 'Spleen Patterns'
        });
    }
    
    // Heart Yang Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'pale' || obs.tongue?.body_color === 'purple') {
        score += 25;
        evidence.push('Pale or purple tongue indicates Heart Yang deficiency');
    }
    if (int.cardiovascular?.palpitations === 'severe' || int.cardiovascular?.palpitations === 'frequent') {
        score += 30;
        evidence.push('Severe palpitations indicate Heart Yang deficiency');
    }
    if (int.temperature?.chest === 'cold' || int.temperature?.feeling === 'cold') {
        score += 25;
        evidence.push('Cold sensation in chest indicates Heart Yang deficiency');
    }
    if (obs.complexion?.cyanosis === true || obs.lips?.color === 'purple') {
        score += 25;
        evidence.push('Cyanosis/purple lips indicate Heart Yang deficiency');
    }
    if (int.breathing?.quality === 'shortness') {
        score += 20;
        evidence.push('Shortness of breath indicates Heart Yang deficiency');
    }
    if (int.edema?.location === 'generalized' || int.edema?.location === 'upper_body') {
        score += 20;
        evidence.push('Edema indicates Heart Yang deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Heart Yang Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Heart Yang affecting circulation and warming',
            treatment_principle: 'Warm and tonify Heart Yang, promote circulation',
            herbal_formula: 'Bao Yuan Tang or Gui Zhi Gan Cao Long Gu Mu Li Tang',
            acupuncture_points: 'HT7, PC6, CV17, BL15, GV14 (with moxa)',
            dietary_advice: 'Warming foods, keep chest warm, avoid cold',
            category: 'Heart Patterns'
        });
    }
    
    return patterns;
}

// ==================== YIN PATTERNS ====================

function analyzeYinPatterns(obs, int, cc) {
    const patterns = [];
    
    // Kidney Yin Deficiency
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.body_color === 'red' && (obs.tongue?.coating_thickness === 'none' || obs.tongue?.coating_thickness === 'thin')) {
        score += 30;
        evidence.push('Red tongue with little/no coating indicates Yin deficiency');
    }
    if (obs.tongue?.moisture === 'dry') {
        score += 20;
        evidence.push('Dry tongue indicates Yin deficiency');
    }
    if (int.sweating?.type === 'night_sweats') {
        score += 25;
        evidence.push('Night sweats indicate Yin deficiency');
    }
    if (int.temperature?.fever === 'afternoon' || int.temperature?.fever === 'low_grade') {
        score += 25;
        evidence.push('Afternoon/low-grade fever indicates Yin deficiency');
    }
    if (int.temperature?.five_palm_heat === true) {
        score += 25;
        evidence.push('Five-palm heat indicates Yin deficiency');
    }
    if (int.back?.pain === 'lower_back' && int.back?.quality === 'soreness') {
        score += 20;
        evidence.push('Lower back soreness indicates Kidney Yin deficiency');
    }
    if (int.hearing?.tinnitus === true || int.hearing?.quality === 'declining') {
        score += 15;
        evidence.push('Tinnitus/hearing loss indicates Kidney Yin deficiency');
    }
    if (int.mouth?.dryness === 'night' || int.thirst?.quality === 'thirsty_night') {
        score += 20;
        evidence.push('Dry mouth at night indicates Yin deficiency');
    }
    if (int.sleep?.quality === 'insomnia' || int.sleep?.difficulty === 'staying_asleep') {
        score += 15;
        evidence.push('Insomnia indicates Yin deficiency with empty heat');
    }
    if (int.sexual?.nocturnal_emission === true || int.sexual?.premature_ejaculation === true) {
        score += 20;
        evidence.push('Sexual dysfunction indicates Kidney Yin deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Kidney Yin Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Kidney Yin with deficiency heat signs',
            treatment_principle: 'Nourish Kidney Yin, clear deficiency heat',
            herbal_formula: 'Liu Wei Di Huang Wan (Six Ingredient Pill) or Zhi Bai Di Huang Wan',
            acupuncture_points: 'KI3, KI6, BL23, SP6, KI10',
            dietary_advice: 'Yin-nourishing foods, adequate sleep, avoid late nights',
            category: 'Kidney Patterns'
        });
    }
    
    // Lung Yin Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.coating_thickness === 'none') {
        score += 25;
        evidence.push('Red tongue without coating indicates Lung Yin deficiency');
    }
    if (int.respiratory?.cough === 'dry' || int.respiratory?.cough === 'persistent') {
        score += 30;
        evidence.push('Dry cough indicates Lung Yin deficiency');
    }
    if (int.respiratory?.sputum === 'scanty' || int.respiratory?.sputum === 'sticky') {
        score += 20;
        evidence.push('Scanty sticky sputum indicates Lung Yin deficiency');
    }
    if (int.respiratory?.blood_in_sputum === true) {
        score += 25;
        evidence.push('Blood in sputum indicates Lung Yin deficiency with heat');
    }
    if (int.throat?.dryness === true || int.mouth?.dryness === 'constant') {
        score += 20;
        evidence.push('Dry throat/mouth indicates Yin deficiency');
    }
    if (int.voice?.quality === 'hoarse') {
        score += 15;
        evidence.push('Hoarse voice indicates Lung Yin deficiency');
    }
    if (int.sweating?.type === 'night_sweats') {
        score += 20;
        evidence.push('Night sweats indicate Yin deficiency');
    }
    if (int.temperature?.fever === 'afternoon') {
        score += 20;
        evidence.push('Afternoon fever indicates Yin deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Lung Yin Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Lung Yin with dry heat signs',
            treatment_principle: 'Nourish Lung Yin, moisten dryness, clear heat',
            herbal_formula: 'Bai He Gu Jin Tang (Lily Bulb Metal-Securing Decoction)',
            acupuncture_points: 'LU9, LU10, LU5, KI6, BL13',
            dietary_advice: 'Lung-moistening foods, adequate hydration',
            category: 'Lung Patterns'
        });
    }
    
    // Liver Yin Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red') {
        score += 20;
        evidence.push('Red tongue indicates Yin deficiency with heat');
    }
    if (obs.eyes?.dryness === true || obs.eyes?.quality === 'dry') {
        score += 25;
        evidence.push('Dry eyes indicate Liver Yin deficiency');
    }
    if (int.vision?.quality === 'blurred' || int.vision?.floaters === true) {
        score += 25;
        evidence.push('Blurred vision/floaters indicate Liver Yin deficiency');
    }
    if (int.head?.pain === 'vertex' || int.head?.dizziness === true) {
        score += 20;
        evidence.push('Vertex headache/dizziness indicates Liver Yin deficiency');
    }
    if (int.hearing?.tinnitus === true) {
        score += 15;
        evidence.push('Tinnitus indicates Liver-Kidney Yin deficiency');
    }
    if (int.neurological?.tremors === true || int.neurological?.numbness === true) {
        score += 20;
        evidence.push('Tremors/numbness indicate Liver Yin deficiency with internal wind');
    }
    if (int.emotions?.primary_emotion === 'irritable') {
        score += 15;
        evidence.push('Irritability indicates Liver Yin deficiency with heat');
    }
    if (int.menstruation?.amount === 'scanty') {
        score += 15;
        evidence.push('Scanty menstruation indicates Liver Blood/Yin deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Liver Yin Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Liver Yin with internal wind and heat signs',
            treatment_principle: 'Nourish Liver Yin, subdue wind, clear heat',
            herbal_formula: 'Qi Ju Di Huang Wan (Lycium-Chrysanthemum-Rehmannia Pill)',
            acupuncture_points: 'LV3, LV8, GB20, KI3, SP6, BL18',
            dietary_advice: 'Eye-nourishing foods, rest eyes frequently',
            category: 'Liver Patterns'
        });
    }
    
    // Heart Yin Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.features?.includes('red_tip')) {
        score += 30;
        evidence.push('Red tongue with red tip indicates Heart Yin deficiency with fire');
    }
    if (obs.tongue?.features?.includes('cracks_center')) {
        score += 20;
        evidence.push('Center cracks indicate Heart Yin deficiency');
    }
    if (int.cardiovascular?.palpitations === 'frequent') {
        score += 25;
        evidence.push('Palpitations indicate Heart Yin deficiency');
    }
    if (int.sleep?.quality === 'insomnia' || int.sleep?.difficulty === 'falling_asleep') {
        score += 25;
        evidence.push('Insomnia indicates Heart Yin deficiency');
    }
    if (int.sleep?.dreams === 'excessive' || int.sleep?.dreams === 'disturbing') {
        score += 20;
        evidence.push('Excessive dreams indicate Heart Yin deficiency');
    }
    if (int.emotions?.primary_emotion === 'anxious' || int.emotions?.restlessness === true) {
        score += 20;
        evidence.push('Anxiety/restlessness indicate Heart Yin deficiency');
    }
    if (int.memory?.quality === 'poor') {
        score += 15;
        evidence.push('Poor memory indicates Heart Yin deficiency');
    }
    if (int.sweating?.type === 'night_sweats') {
        score += 20;
        evidence.push('Night sweats indicate Yin deficiency');
    }
    if (int.mouth?.dryness === 'night') {
        score += 15;
        evidence.push('Dry mouth at night indicates Yin deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Heart Yin Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Heart Yin affecting mental functions with empty heat',
            treatment_principle: 'Nourish Heart Yin, calm the mind, clear heat',
            herbal_formula: 'Tian Wang Bu Xin Dan (Emperor of Heaven Heart-Supplementing Elixir)',
            acupuncture_points: 'HT7, HT6, PC7, KI3, SP6, BL15',
            dietary_advice: 'Heart-nourishing foods, adequate sleep, emotional calm',
            category: 'Heart Patterns'
        });
    }
    
    // Stomach Yin Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.features?.includes('cracks_center')) {
        score += 25;
        evidence.push('Red tongue with center cracks indicates Stomach Yin deficiency');
    }
    if (obs.tongue?.coating_thickness === 'none' || obs.tongue?.coating_thickness === 'peeled') {
        score += 25;
        evidence.push('No coating indicates severe Stomach Yin deficiency');
    }
    if (int.digestion?.appetite === 'no_appetite' && int.digestion?.hunger === 'hungry_but_no_desire') {
        score += 30;
        evidence.push('Hunger without desire to eat indicates Stomach Yin deficiency');
    }
    if (int.mouth?.dryness === 'constant' || int.throat?.dryness === true) {
        score += 25;
        evidence.push('Dry mouth/throat indicate Stomach Yin deficiency');
    }
    if (int.thirst?.quality === 'thirsty' && int.thirst?.preference === 'small_sips') {
        score += 25;
        evidence.push('Thirst with desire for small sips indicates Yin deficiency');
    }
    if (int.digestion?.stools === 'dry' || int.digestion?.stools === 'constipated') {
        score += 20;
        evidence.push('Dry stools indicate Stomach Yin deficiency');
    }
    if (int.digestion?.pain === 'epigastric' && int.digestion?.pain_quality === 'dull') {
        score += 15;
        evidence.push('Epigastric discomfort indicates Stomach Yin deficiency');
    }
    if (int.temperature?.fever === 'afternoon') {
        score += 15;
        evidence.push('Afternoon fever indicates Yin deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Stomach Yin Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Stomach Yin with dry heat signs',
            treatment_principle: 'Nourish Stomach Yin, generate fluids, clear heat',
            herbal_formula: 'Yi Wei Tang (Benefit the Stomach Decoction)',
            acupuncture_points: 'ST36, CV12, SP6, KI3, ST44',
            dietary_advice: 'Stomach-nourishing foods, small frequent meals',
            category: 'Stomach Patterns'
        });
    }
    
    return patterns;
}

// ==================== BLOOD PATTERNS ====================

function analyzeBloodPatterns(obs, int, cc) {
    const patterns = [];
    
    // Heart Blood Deficiency
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.body_color === 'pale' && obs.tongue?.body_shape === 'thin') {
        score += 25;
        evidence.push('Pale thin tongue indicates Blood deficiency');
    }
    if (obs.complexion?.primary_color === 'pale' || obs.lips?.color === 'pale') {
        score += 20;
        evidence.push('Pale complexion/lips indicate Blood deficiency');
    }
    if (int.cardiovascular?.palpitations === 'frequent') {
        score += 30;
        evidence.push('Palpitations indicate Heart Blood deficiency');
    }
    if (int.sleep?.quality === 'insomnia' || int.sleep?.dreams === 'excessive') {
        score += 25;
        evidence.push('Insomnia/excessive dreams indicate Heart Blood deficiency');
    }
    if (int.memory?.quality === 'poor') {
        score += 20;
        evidence.push('Poor memory indicates Heart Blood deficiency');
    }
    if (int.emotions?.primary_emotion === 'anxious' || int.emotions?.easily_startled === true) {
        score += 20;
        evidence.push('Anxiety/easily startled indicate Heart Blood deficiency');
    }
    if (int.head?.dizziness === true) {
        score += 15;
        evidence.push('Dizziness indicates Blood deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Heart Blood Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Heart Blood affecting mental functions and sleep',
            treatment_principle: 'Nourish Heart Blood, calm the mind',
            herbal_formula: 'Gui Pi Tang (Restore the Spleen Decoction)',
            acupuncture_points: 'HT7, PC6, SP6, BL15, BL17, CV4',
            dietary_advice: 'Blood-nourishing foods: dates, spinach, liver',
            category: 'Heart Patterns'
        });
    }
    
    // Liver Blood Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'pale' && obs.tongue?.body_shape === 'thin') {
        score += 20;
        evidence.push('Pale thin tongue indicates Blood deficiency');
    }
    if (int.vision?.quality === 'blurred' || obs.eyes?.dryness === true) {
        score += 25;
        evidence.push('Blurred vision/dry eyes indicate Liver Blood deficiency');
    }
    if (int.vision?.floaters === true || int.vision?.night_blindness === true) {
        score += 20;
        evidence.push('Floaters/night blindness indicate Liver Blood deficiency');
    }
    if (int.neurological?.numbness === true || int.neurological?.tingling === true) {
        score += 25;
        evidence.push('Numbness/tingling indicate Liver Blood deficiency');
    }
    if (int.muscles?.cramps === true || int.muscles?.twitching === true) {
        score += 20;
        evidence.push('Muscle cramps/twitching indicate Liver Blood deficiency');
    }
    if (int.menstruation?.amount === 'scanty' || int.menstruation?.delayed === true) {
        score += 25;
        evidence.push('Scanty/delayed menstruation indicate Liver Blood deficiency');
    }
    if (int.menstruation?.blood_color === 'pale') {
        score += 20;
        evidence.push('Pale menstrual blood indicates Blood deficiency');
    }
    if (obs.nails?.quality === 'brittle' || obs.nails?.color === 'pale') {
        score += 15;
        evidence.push('Brittle/pale nails indicate Liver Blood deficiency');
    }
    if (int.head?.dizziness === true) {
        score += 15;
        evidence.push('Dizziness indicates Blood deficiency');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Liver Blood Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Liver Blood affecting eyes, tendons, and menstruation',
            treatment_principle: 'Nourish Liver Blood, benefit eyes and tendons',
            herbal_formula: 'Si Wu Tang (Four Substance Decoction) or Bu Gan Tang',
            acupuncture_points: 'LV3, LV8, SP6, BL17, BL18, GB20',
            dietary_advice: 'Blood-nourishing foods, rest eyes frequently',
            category: 'Liver Patterns'
        });
    }
    
    return patterns;
}

// ==================== QI STAGNATION PATTERNS ====================

function analyzeQiStagnationPatterns(obs, int, cc) {
    const patterns = [];
    
    // Liver Qi Stagnation
    let score = 0;
    let evidence = [];
    
    if (int.emotions?.primary_emotion === 'irritable' || int.emotions?.primary_emotion === 'angry') {
        score += 30;
        evidence.push('Irritability/anger indicate Liver Qi stagnation');
    }
    if (int.emotions?.primary_emotion === 'depressed' || int.emotions?.mood_swings === true) {
        score += 25;
        evidence.push('Depression/mood swings indicate Liver Qi stagnation');
    }
    if (int.stress?.level === 'high' || int.stress?.level === 'severe') {
        score += 20;
        evidence.push('High stress contributes to Liver Qi stagnation');
    }
    if (int.chest?.distension === true || int.chest?.oppression === true) {
        score += 25;
        evidence.push('Chest distension indicates Liver Qi stagnation');
    }
    if (int.digestion?.bloating === 'moderate' || int.digestion?.bloating === 'severe') {
        score += 20;
        evidence.push('Abdominal bloating indicates Liver Qi stagnation');
    }
    if (int.digestion?.pain === 'hypochondriac' || int.chest?.pain === 'sides') {
        score += 25;
        evidence.push('Hypochondriac pain indicates Liver Qi stagnation');
    }
    if (int.breathing?.sighing === 'frequent') {
        score += 20;
        evidence.push('Frequent sighing indicates Liver Qi stagnation');
    }
    if (int.sleep?.quality === 'insomnia' && int.sleep?.difficulty === 'falling_asleep') {
        score += 15;
        evidence.push('Difficulty falling asleep indicates Liver Qi stagnation');
    }
    if (int.menstruation?.pms === 'severe' || int.menstruation?.breast_tenderness === true) {
        score += 20;
        evidence.push('Severe PMS/breast tenderness indicate Liver Qi stagnation');
    }
    if (int.menstruation?.cycle === 'irregular') {
        score += 15;
        evidence.push('Irregular menstruation indicates Liver Qi stagnation');
    }
    
    // Chief complaint context
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['stress', 'anxiety', 'irritable', 'angry', 'insomnia', 'depression', 'mood'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Liver Qi stagnation');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Liver Qi Stagnation',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Stagnation of Liver Qi causing emotional frustration and physical tension',
            treatment_principle: 'Soothe Liver, regulate Qi flow, calm spirit',
            herbal_formula: 'Xiao Yao San (Free and Easy Wanderer) or Chai Hu Shu Gan San',
            acupuncture_points: 'LV3, LV14, GB34, PC6, HT7, LI4',
            dietary_advice: 'Qi-moving foods, stress reduction, regular exercise',
            category: 'Liver Patterns'
        });
    }
    
    return patterns;
}

// ==================== BLOOD STASIS PATTERNS ====================

function analyzeBloodStasisPatterns(obs, int, cc) {
    const patterns = [];
    
    // Blood Stasis
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.body_color === 'purple' || obs.tongue?.body_color === 'dark') {
        score += 30;
        evidence.push('Purple/dark tongue indicates Blood stasis');
    }
    if (obs.tongue?.features?.includes('purple_spots') || obs.tongue?.features?.includes('purple_macules')) {
        score += 25;
        evidence.push('Purple spots on tongue indicate Blood stasis');
    }
    if (obs.complexion?.primary_color === 'dark' || obs.complexion?.primary_color === 'purple') {
        score += 20;
        evidence.push('Dark/purple complexion indicates Blood stasis');
    }
    if (int.pain?.quality === 'sharp' || int.pain?.quality === 'stabbing') {
        score += 30;
        evidence.push('Sharp/stabbing pain indicates Blood stasis');
    }
    if (int.pain?.location_fixed === true) {
        score += 25;
        evidence.push('Fixed pain location indicates Blood stasis');
    }
    if (int.menstruation?.blood_clots === true || int.menstruation?.blood_clots === 'large') {
        score += 30;
        evidence.push('Blood clots in menstruation indicate Blood stasis');
    }
    if (int.menstruation?.blood_color === 'dark' || int.menstruation?.blood_color === 'purple') {
        score += 25;
        evidence.push('Dark menstrual blood indicates Blood stasis');
    }
    if (int.masses?.present === true || int.masses?.location === 'abdomen') {
        score += 25;
        evidence.push('Fixed masses indicate Blood stasis');
    }
    if (obs.skin?.spider_veins === true || obs.skin?.varicose_veins === true) {
        score += 20;
        evidence.push('Spider/varicose veins indicate Blood stasis');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Blood Stasis',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Obstruction of blood circulation with stagnation and pain',
            treatment_principle: 'Invigorate Blood, remove stasis, stop pain',
            herbal_formula: 'Xue Fu Zhu Yu Tang (Drive Out Stasis from Mansion of Blood)',
            acupuncture_points: 'SP10, SP6, BL17, LV3, PC6, ST36',
            dietary_advice: 'Blood-moving foods: vinegar, hawthorn berry, avoid cold',
            category: 'Blood Disorders'
        });
    }
    
    return patterns;
}

// ==================== PHLEGM/DAMPNESS PATTERNS ====================

function analyzePhlegmDampnessPatterns(obs, int, cc) {
    const patterns = [];
    
    // Phlegm-Dampness
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.coating_quality === 'greasy' || obs.tongue?.coating_quality === 'sticky') {
        score += 30;
        evidence.push('Greasy tongue coating indicates Phlegm-Dampness');
    }
    if (obs.tongue?.coating_thickness === 'thick') {
        score += 20;
        evidence.push('Thick coating indicates Dampness accumulation');
    }
    if (obs.tongue?.body_shape === 'swollen') {
        score += 15;
        evidence.push('Swollen tongue indicates Dampness');
    }
    if (int.body?.heaviness === true || int.body?.feeling === 'heavy') {
        score += 25;
        evidence.push('Body heaviness indicates Dampness');
    }
    if (int.mouth?.sticky === true || int.mouth?.taste === 'sticky') {
        score += 20;
        evidence.push('Sticky sensation in mouth indicates Dampness');
    }
    if (int.digestion?.stools === 'loose' || int.digestion?.stools === 'sticky') {
        score += 20;
        evidence.push('Loose/sticky stools indicate Dampness');
    }
    if (int.respiratory?.sputum === 'copious' || int.respiratory?.sputum === 'white') {
        score += 25;
        evidence.push('Copious white sputum indicates Phlegm-Dampness');
    }
    if (int.head?.dizziness === true || int.head?.feeling === 'heavy') {
        score += 20;
        evidence.push('Dizziness/heavy head indicate Phlegm-Dampness');
    }
    if (int.chest?.oppression === true || int.chest?.fullness === true) {
        score += 20;
        evidence.push('Chest oppression indicates Phlegm-Dampness');
    }
    if (int.digestion?.poor_appetite === true && int.digestion?.bloating === 'moderate') {
        score += 15;
        evidence.push('Poor appetite with bloating indicates Dampness');
    }
    if (int.edema?.present === true) {
        score += 20;
        evidence.push('Edema indicates Dampness accumulation');
    }
    if (obs.body_type?.build === 'overweight') {
        score += 15;
        evidence.push('Obesity indicates Phlegm-Dampness accumulation');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Phlegm-Dampness',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Accumulation of Phlegm and Dampness causing heaviness and obstruction',
            treatment_principle: 'Resolve Phlegm, transform Dampness, strengthen Spleen',
            herbal_formula: 'Er Chen Tang (Two-Cured Decoction) or Wen Dan Tang',
            acupuncture_points: 'ST40, SP9, SP6, CV12, PC6, ST36',
            dietary_advice: 'Avoid greasy/dairy foods, eat warm/drying foods',
            category: 'Phlegm-Dampness Disorders'
        });
    }
    
    return patterns;
}

// ==================== HEAT/FIRE PATTERNS ====================

function analyzeHeatFirePatterns(obs, int, cc) {
    const patterns = [];
    
    // Liver Fire Rising
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.features?.includes('red_sides')) {
        score += 30;
        evidence.push('Red tongue with red sides indicates Liver Fire');
    }
    if (obs.tongue?.coating_color === 'yellow') {
        score += 20;
        evidence.push('Yellow coating indicates Heat');
    }
    if (obs.complexion?.primary_color === 'red' || obs.face?.flushing === true) {
        score += 25;
        evidence.push('Red face indicates Heat rising');
    }
    if (obs.eyes?.redness === true || obs.eyes?.bloodshot === true) {
        score += 25;
        evidence.push('Red eyes indicate Liver Fire');
    }
    if (int.head?.pain === 'temporal' || int.head?.pain === 'severe') {
        score += 25;
        evidence.push('Severe temporal headache indicates Liver Fire rising');
    }
    if (int.emotions?.primary_emotion === 'irritable' || int.emotions?.primary_emotion === 'angry') {
        score += 25;
        evidence.push('Irritability/anger indicate Liver Fire');
    }
    if (int.head?.dizziness === 'severe' || int.head?.vertigo === true) {
        score += 20;
        evidence.push('Severe dizziness/vertigo indicate Liver Fire rising');
    }
    if (int.hearing?.tinnitus === 'sudden' || int.hearing?.tinnitus === 'loud') {
        score += 20;
        evidence.push('Sudden loud tinnitus indicates Liver Fire rising');
    }
    if (int.mouth?.taste === 'bitter') {
        score += 20;
        evidence.push('Bitter taste indicates Liver/Gallbladder Fire');
    }
    if (int.thirst?.quality === 'very_thirsty') {
        score += 15;
        evidence.push('Strong thirst indicates Heat');
    }
    if (int.digestion?.stools === 'constipated' && int.urination?.color === 'dark') {
        score += 15;
        evidence.push('Constipation and dark urine indicate Heat');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Liver Fire Rising',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Liver Fire rising upward causing heat signs in head and eyes',
            treatment_principle: 'Clear Liver Fire, calm Liver, settle Yang',
            herbal_formula: 'Long Dan Xie Gan Tang (Gentiana Drain Liver Decoction)',
            acupuncture_points: 'LV2, LV3, GB20, GB43, LI11, TH5',
            dietary_advice: 'Cooling foods, avoid alcohol/spicy foods, stress reduction',
            category: 'Liver Patterns'
        });
    }
    
    // Heart Fire
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.features?.includes('red_tip')) {
        score += 30;
        evidence.push('Red tongue with red tip indicates Heart Fire');
    }
    if (obs.tongue?.features?.includes('ulcers_tip')) {
        score += 25;
        evidence.push('Ulcers on tongue tip indicate Heart Fire');
    }
    if (int.cardiovascular?.palpitations === 'severe') {
        score += 25;
        evidence.push('Severe palpitations indicate Heart Fire');
    }
    if (int.emotions?.primary_emotion === 'agitated' || int.emotions?.restlessness === 'severe') {
        score += 25;
        evidence.push('Severe agitation/restlessness indicate Heart Fire');
    }
    if (int.sleep?.quality === 'insomnia' && int.sleep?.dreams === 'disturbing') {
        score += 20;
        evidence.push('Insomnia with disturbing dreams indicates Heart Fire');
    }
    if (int.mouth?.ulcers === true || int.mouth?.sores === true) {
        score += 25;
        evidence.push('Mouth ulcers indicate Heart Fire');
    }
    if (int.thirst?.quality === 'very_thirsty') {
        score += 15;
        evidence.push('Strong thirst indicates Heat');
    }
    if (int.urination?.color === 'dark' || int.urination?.burning === true) {
        score += 20;
        evidence.push('Dark/burning urination indicates Heart Fire descending');
    }
    if (obs.face?.acne === 'severe' && int.emotions?.irritability === 'high') {
        score += 15;
        evidence.push('Severe facial acne with irritability indicates Heart Fire');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Heart Fire Blazing',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Heart Fire blazing upward disturbing the mind and spirit',
            treatment_principle: 'Clear Heart Fire, calm the mind, nourish Yin',
            herbal_formula: 'Dao Chi San (Guide Out the Red Powder) or Huang Lian Jie Du Tang',
            acupuncture_points: 'HT8, HT7, PC8, PC7, SI3, BL15',
            dietary_advice: 'Cooling foods, avoid stimulants, emotional calm',
            category: 'Heart Patterns'
        });
    }
    
    // Stomach Fire
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.coating_color === 'yellow') {
        score += 25;
        evidence.push('Red tongue with yellow coating indicates Stomach Fire');
    }
    if (int.digestion?.appetite === 'excessive' || int.digestion?.hunger === 'excessive') {
        score += 30;
        evidence.push('Excessive appetite indicates Stomach Fire');
    }
    if (int.thirst?.quality === 'very_thirsty' && int.thirst?.preference === 'cold_drinks') {
        score += 25;
        evidence.push('Strong thirst for cold drinks indicates Stomach Fire');
    }
    if (int.mouth?.bleeding_gums === true || int.gums?.swelling === true) {
        score += 25;
        evidence.push('Bleeding/swollen gums indicate Stomach Fire');
    }
    if (int.mouth?.ulcers === true || int.mouth?.sores === true) {
        score += 20;
        evidence.push('Mouth ulcers indicate Stomach Fire');
    }
    if (int.breath?.odor === 'bad' || int.mouth?.taste === 'foul') {
        score += 20;
        evidence.push('Bad breath/foul taste indicate Stomach Fire');
    }
    if (int.digestion?.pain === 'epigastric' && int.digestion?.pain_quality === 'burning') {
        score += 25;
        evidence.push('Burning epigastric pain indicates Stomach Fire');
    }
    if (int.digestion?.stools === 'constipated') {
        score += 15;
        evidence.push('Constipation indicates Stomach Heat');
    }
    if (int.urination?.color === 'dark') {
        score += 10;
        evidence.push('Dark urine indicates Heat');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Stomach Fire',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Stomach Fire blazing causing excessive hunger and heat signs',
            treatment_principle: 'Clear Stomach Fire, generate fluids',
            herbal_formula: 'Qing Wei San (Clear the Stomach Powder) or Bai Hu Tang',
            acupuncture_points: 'ST44, ST45, LI4, LI11, CV12',
            dietary_advice: 'Cooling foods, avoid spicy/fried foods',
            category: 'Stomach Patterns'
        });
    }
    
    return patterns;
}

// ==================== COLD PATTERNS ====================

function analyzeColdPatterns(obs, int, cc) {
    const patterns = [];
    
    // Internal Cold
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.body_color === 'pale' && obs.tongue?.coating_color === 'white') {
        score += 25;
        evidence.push('Pale tongue with white coating indicates Cold');
    }
    if (int.temperature?.feeling === 'very_cold' || int.temperature?.intolerance === 'severe') {
        score += 30;
        evidence.push('Severe cold intolerance indicates Internal Cold');
    }
    if (int.temperature?.extremities === 'icy_cold') {
        score += 25;
        evidence.push('Icy cold extremities indicate Internal Cold');
    }
    if (int.pain?.quality === 'cramping' && int.pain?.better_with === 'warmth') {
        score += 25;
        evidence.push('Cramping pain relieved by warmth indicates Cold');
    }
    if (int.digestion?.pain === 'abdominal' && int.pain?.better_with === 'warmth') {
        score += 25;
        evidence.push('Abdominal pain relieved by warmth indicates Stomach Cold');
    }
    if (int.urination?.color === 'clear' || int.urination?.color === 'pale') {
        score += 15;
        evidence.push('Clear pale urine indicates Cold');
    }
    if (int.thirst?.quality === 'no_thirst' || int.thirst?.preference === 'warm_drinks') {
        score += 20;
        evidence.push('No thirst or preference for warm drinks indicates Cold');
    }
    if (int.vomiting?.type === 'clear_fluid') {
        score += 20;
        evidence.push('Vomiting clear fluid indicates Cold');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Internal Cold',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Accumulation of internal Cold causing pain and dysfunction',
            treatment_principle: 'Warm the Interior, expel Cold, stop pain',
            herbal_formula: 'Li Zhong Tang (Regulate Middle Decoction) or Wu Zhu Yu Tang',
            acupuncture_points: 'CV12, CV6, ST36, SP6 (with moxa)',
            dietary_advice: 'Warming foods: ginger, cinnamon, avoid cold foods',
            category: 'Cold Disorders'
        });
    }
    
    return patterns;
}

// ==================== WIND PATTERNS ====================

function analyzeWindPatterns(obs, int, cc) {
    const patterns = [];
    
    // Internal Wind
    let score = 0;
    let evidence = [];
    
    if (int.neurological?.tremors === true || int.neurological?.tremors === 'severe') {
        score += 30;
        evidence.push('Tremors indicate Internal Wind');
    }
    if (int.muscles?.twitching === true || int.muscles?.spasms === true) {
        score += 25;
        evidence.push('Muscle twitching/spasms indicate Internal Wind');
    }
    if (int.head?.dizziness === 'severe' || int.head?.vertigo === true) {
        score += 25;
        evidence.push('Severe dizziness/vertigo indicate Internal Wind');
    }
    if (int.neurological?.numbness === 'severe' || int.neurological?.numbness === 'moving') {
        score += 20;
        evidence.push('Severe/moving numbness indicates Internal Wind');
    }
    if (int.neurological?.seizures === true || int.neurological?.convulsions === true) {
        score += 35;
        evidence.push('Seizures/convulsions indicate severe Internal Wind');
    }
    if (int.speech?.slurred === true || int.speech?.difficulty === true) {
        score += 25;
        evidence.push('Speech difficulty indicates Internal Wind');
    }
    if (int.movement?.deviation === true || int.facial?.asymmetry === true) {
        score += 30;
        evidence.push('Deviation/facial asymmetry indicate Internal Wind (stroke)');
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Internal Wind',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Internal Wind causing tremors, spasms, and neurological symptoms',
            treatment_principle: 'Extinguish Wind, nourish Liver and Kidney Yin',
            herbal_formula: 'Tian Ma Gou Teng Yin (Gastrodia-Uncaria Beverage)',
            acupuncture_points: 'LV3, GB20, GB34, LI4, LI11, GV20',
            dietary_advice: 'Wind-calming foods, avoid alcohol, adequate sleep',
            category: 'Wind Disorders'
        });
    }
    
    return patterns;
}

// ==================== EXTERIOR PATTERNS ====================

function analyzeExteriorPatterns(obs, int, cc) {
    const patterns = [];
    
    // Wind-Cold Attacking the Exterior
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.coating_color === 'white' && obs.tongue?.coating_thickness === 'thin') {
        score += 25;
        evidence.push('Thin white coating indicates Exterior Cold');
    }
    if (int.temperature?.feeling === 'cold' || int.temperature?.aversion_to === 'cold') {
        score += 30;
        evidence.push('Aversion to cold indicates Exterior Wind-Cold');
    }
    if (int.fever?.onset === 'sudden' && int.fever?.severity === 'mild') {
        score += 20;
        evidence.push('Mild fever with sudden onset suggests Wind-Cold');
    }
    if (int.respiratory?.symptoms?.includes('runny_nose') && int.respiratory?.discharge_color === 'clear') {
        score += 25;
        evidence.push('Clear nasal discharge indicates Wind-Cold');
    }
    if (int.head?.pain === 'occipital' || int.neck?.stiffness === true) {
        score += 25;
        evidence.push('Occipital headache and neck stiffness indicate Wind-Cold');
    }
    if (int.body?.aches === 'severe' || int.muscles?.soreness === true) {
        score += 20;
        evidence.push('Body aches indicate Wind-Cold invading muscles');
    }
    if (int.respiratory?.cough === 'mild' && int.respiratory?.phlegm_color === 'white') {
        score += 15;
        evidence.push('Cough with white phlegm indicates Wind-Cold');
    }
    if (int.sweating?.presence === 'absent' || int.sweating?.amount === 'none') {
        score += 20;
        evidence.push('Absence of sweating indicates Wind-Cold (exterior tight)');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['cold', 'chills', 'runny nose', 'nasal congestion', 'body aches', 'caught a cold'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Wind-Cold pattern');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Wind-Cold Attacking the Exterior',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Exterior pathogen of Wind-Cold invading the body surface causing acute symptoms',
            treatment_principle: 'Release the Exterior, expel Wind-Cold, warm the channels',
            herbal_formula: 'Gui Zhi Tang (Cinnamon Twig Decoction) or Ma Huang Tang',
            acupuncture_points: 'LI4, LU7, BL12, BL13, GB20, GV14 (with moxa)',
            dietary_advice: 'Warm ginger tea, avoid cold foods, keep warm, rest',
            category: 'Exterior Patterns'
        });
    }
    
    // Wind-Heat Attacking the Exterior
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.coating_color === 'yellow') {
        score += 25;
        evidence.push('Red tongue with yellow coating indicates Wind-Heat');
    }
    if (int.fever?.severity === 'high' || int.fever?.onset === 'sudden') {
        score += 30;
        evidence.push('High fever indicates Wind-Heat');
    }
    if (int.temperature?.aversion_to === 'wind' || int.temperature?.aversion_to === 'mild_cold') {
        score += 15;
        evidence.push('Slight aversion to wind indicates Exterior Wind-Heat');
    }
    if (int.throat?.pain === true || int.throat?.swollen === true) {
        score += 30;
        evidence.push('Sore throat indicates Wind-Heat');
    }
    if (int.respiratory?.discharge_color === 'yellow') {
        score += 25;
        evidence.push('Yellow nasal discharge indicates Wind-Heat');
    }
    if (int.thirst?.quality === 'thirsty') {
        score += 15;
        evidence.push('Thirst indicates Heat');
    }
    if (int.respiratory?.cough === 'severe' && int.respiratory?.phlegm_color === 'yellow') {
        score += 20;
        evidence.push('Cough with yellow phlegm indicates Wind-Heat');
    }
    if (int.sweating?.onset === 'early' || int.sweating?.amount === 'moderate') {
        score += 15;
        evidence.push('Sweating indicates Wind-Heat (exterior loose)');
    }
    if (obs.eyes?.redness === true || obs.eyes?.pain === true) {
        score += 20;
        evidence.push('Red painful eyes indicate Wind-Heat');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['sore throat', 'fever', 'hot', 'flu', 'yellow mucus', 'red eyes'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Wind-Heat pattern');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Wind-Heat Attacking the Exterior',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Exterior pathogen of Wind-Heat invading the body surface causing acute febrile symptoms',
            treatment_principle: 'Release the Exterior, expel Wind-Heat, clear Heat',
            herbal_formula: 'Yin Qiao San (Honeysuckle and Forsythia Powder) or Sang Ju Yin',
            acupuncture_points: 'LI4, LI11, LU11, GV14, GB20, SJ5',
            dietary_advice: 'Cooling foods, peppermint tea, avoid spicy/hot foods, rest',
            category: 'Exterior Patterns'
        });
    }
    
    // Summerheat
    score = 0;
    evidence = [];
    
    if (int.fever?.severity === 'high' && int.fever?.timing === 'afternoon') {
        score += 25;
        evidence.push('High afternoon fever indicates Summerheat');
    }
    if (int.sweating?.amount === 'profuse') {
        score += 30;
        evidence.push('Profuse sweating indicates Summerheat');
    }
    if (int.energy?.overall_energy === 'exhausted' || int.energy?.weakness === 'severe') {
        score += 25;
        evidence.push('Severe exhaustion indicates Summerheat damaging Qi');
    }
    if (int.thirst?.quality === 'very_thirsty') {
        score += 20;
        evidence.push('Extreme thirst indicates Summerheat');
    }
    if (int.head?.pain === 'heavy' || int.head?.heaviness === true) {
        score += 15;
        evidence.push('Heavy head indicates Summerheat with Dampness');
    }
    if (int.digestion?.nausea === true || int.vomiting?.present === true) {
        score += 20;
        evidence.push('Nausea/vomiting indicate Summerheat affecting Stomach');
    }
    if (int.urination?.amount === 'scanty' && int.urination?.color === 'dark') {
        score += 15;
        evidence.push('Scanty dark urine indicates Summerheat');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['heat stroke', 'summer', 'exhausted', 'profuse sweat', 'heat exhaustion'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Summerheat pattern');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Summerheat',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Summerheat pathogen damaging Qi and fluids causing heat exhaustion',
            treatment_principle: 'Clear Summerheat, generate fluids, tonify Qi',
            herbal_formula: 'Qing Shu Yi Qi Tang (Clear Summerheat and Augment Qi Decoction)',
            acupuncture_points: 'GV14, LI11, LI4, ST36, CV12, PC6',
            dietary_advice: 'Cooling fluids, watermelon, avoid hot sun exposure, rest in cool place',
            category: 'Exterior Patterns'
        });
    }
    
    return patterns;
}

// ==================== DAMP-HEAT PATTERNS ====================

function analyzeDampHeatPatterns(obs, int, cc) {
    const patterns = [];
    
    // Damp-Heat
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.coating_color === 'yellow' && obs.tongue?.coating_thickness === 'thick') {
        score += 30;
        evidence.push('Thick yellow coating indicates Damp-Heat');
    }
    if (obs.tongue?.coating_quality === 'greasy' || obs.tongue?.coating_quality === 'sticky') {
        score += 25;
        evidence.push('Greasy coating indicates Dampness with Heat');
    }
    if (int.digestion?.stools === 'sticky' || int.digestion?.stool_smell === 'foul') {
        score += 25;
        evidence.push('Sticky foul-smelling stools indicate Damp-Heat');
    }
    if (int.urination?.color === 'dark' && (int.urination?.sensation === 'burning' || int.urination?.sensation === 'painful')) {
        score += 30;
        evidence.push('Dark burning urination indicates Damp-Heat in Lower Jiao');
    }
    if (int.body?.heaviness === true || int.limbs?.heaviness === 'severe') {
        score += 20;
        evidence.push('Heavy sensation indicates Dampness');
    }
    if (int.temperature?.feeling === 'hot' && int.fever?.quality === 'persistent_low_grade') {
        score += 20;
        evidence.push('Persistent low fever with heat sensation indicates Damp-Heat');
    }
    if (int.skin?.conditions?.includes('eczema') || int.skin?.conditions?.includes('boils')) {
        score += 20;
        evidence.push('Skin eruptions indicate Damp-Heat');
    }
    if (int.genital?.discharge === 'yellow' || int.genital?.odor === 'foul') {
        score += 25;
        evidence.push('Yellow foul discharge indicates Damp-Heat in Lower Jiao');
    }
    if (int.digestion?.appetite === 'poor' && int.mouth?.taste === 'bitter') {
        score += 15;
        evidence.push('Poor appetite with bitter taste indicates Damp-Heat affecting Spleen');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['uti', 'urinary', 'burning', 'discharge', 'eczema', 'skin infection', 'vaginal'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Damp-Heat pattern');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Damp-Heat',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Combination of Dampness and Heat causing obstruction and inflammation',
            treatment_principle: 'Clear Heat, resolve Dampness, promote urination',
            herbal_formula: 'Long Dan Xie Gan Tang or Si Miao San',
            acupuncture_points: 'SP9, SP6, LV2, BL22, BL23, CV3',
            dietary_advice: 'Avoid greasy, spicy, and damp-forming foods; eat cooling bitter foods',
            category: 'Damp-Heat Patterns'
        });
    }
    
    // Lung Heat
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.coating_color === 'yellow') {
        score += 20;
        evidence.push('Red tongue with yellow coating indicates Heat');
    }
    if (int.respiratory?.cough === 'severe' || int.respiratory?.cough === 'barking') {
        score += 25;
        evidence.push('Severe cough indicates Lung Heat');
    }
    if (int.respiratory?.phlegm_color === 'yellow' || int.respiratory?.phlegm_quality === 'thick') {
        score += 30;
        evidence.push('Yellow thick phlegm indicates Lung Heat');
    }
    if (int.respiratory?.blood_in_phlegm === true) {
        score += 25;
        evidence.push('Blood in sputum indicates Lung Heat damaging vessels');
    }
    if (int.fever?.severity === 'high' || int.fever?.pattern === 'afternoon') {
        score += 20;
        evidence.push('Fever indicates Heat');
    }
    if (int.chest?.pain === true || int.breathing?.pain === true) {
        score += 20;
        evidence.push('Chest pain indicates Lung Heat');
    }
    if (int.thirst?.quality === 'thirsty' || int.thirst?.preference === 'cold_drinks') {
        score += 15;
        evidence.push('Thirst for cold drinks indicates Heat');
    }
    if (int.respiratory?.wheezing === true || int.breathing?.difficulty === 'severe') {
        score += 20;
        evidence.push('Wheezing/dyspnea indicate Lung Heat obstructing Lung Qi');
    }
    if (int.nose?.bleeding === true) {
        score += 20;
        evidence.push('Nosebleeds indicate Lung Heat forcing blood out');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['cough', 'pneumonia', 'bronchitis', 'lung infection', 'yellow phlegm', 'chest pain'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Lung Heat pattern');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Lung Heat',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Heat in the Lungs causing cough with yellow phlegm and respiratory symptoms',
            treatment_principle: 'Clear Lung Heat, resolve phlegm, restore descending of Lung Qi',
            herbal_formula: 'Ma Xing Shi Gan Tang (Ephedra-Apricot-Gypsum-Licorice Decoction)',
            acupuncture_points: 'LU5, LU10, LI4, LI11, BL13, CV17',
            dietary_advice: 'Cooling moistening foods, pears, avoid hot spicy foods',
            category: 'Heat Patterns'
        });
    }
    
    return patterns;
}

// ==================== ADDITIONAL ORGAN PATTERNS ====================

function analyzeAdditionalOrganPatterns(obs, int, cc) {
    const patterns = [];
    
    // Gallbladder Fire
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.coating_color === 'yellow' && obs.tongue?.coating_quality === 'greasy') {
        score += 20;
        evidence.push('Yellow greasy coating indicates Gallbladder Fire');
    }
    if (int.mouth?.taste === 'bitter') {
        score += 30;
        evidence.push('Bitter taste indicates Gallbladder Fire');
    }
    if (int.head?.pain === 'temporal' || int.head?.pain === 'one_sided') {
        score += 25;
        evidence.push('Temporal/one-sided headache indicates Gallbladder Fire');
    }
    if (int.hearing?.tinnitus === 'sudden' || int.hearing?.tinnitus === 'loud') {
        score += 25;
        evidence.push('Sudden loud tinnitus indicates Gallbladder Fire');
    }
    if (int.emotions?.primary_emotion === 'irritable' || int.emotions?.primary_emotion === 'angry') {
        score += 20;
        evidence.push('Irritability indicates Liver-Gallbladder Fire');
    }
    if (int.eyes?.redness === true || int.eyes?.pain === true) {
        score += 20;
        evidence.push('Red painful eyes indicate Liver-Gallbladder Fire rising');
    }
    if (int.hypochondrium?.pain === true || int.hypochondrium?.distention === true) {
        score += 25;
        evidence.push('Hypochondriac pain indicates Gallbladder Fire');
    }
    if (int.digestion?.nausea === true || int.vomiting?.content === 'bitter_fluid') {
        score += 20;
        evidence.push('Nausea/vomiting bitter fluid indicates Gallbladder Fire');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['bitter taste', 'gallbladder', 'side pain', 'hypochondriac', 'migraine'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Gallbladder Fire');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Gallbladder Fire',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Gallbladder Fire rising causing bitter taste, headache, and irritability',
            treatment_principle: 'Clear Gallbladder Fire, harmonize Liver and Gallbladder',
            herbal_formula: 'Long Dan Xie Gan Tang (Gentiana Drain Liver Decoction)',
            acupuncture_points: 'GB20, GB34, GB41, LV2, LV3, SJ6',
            dietary_advice: 'Cooling bitter foods, avoid alcohol and greasy foods',
            category: 'Gallbladder Patterns'
        });
    }
    
    // Small Intestine Heat
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.tip === 'very_red') {
        score += 30;
        evidence.push('Red tongue tip indicates Heart/Small Intestine Heat');
    }
    if (int.urination?.color === 'dark' && int.urination?.sensation === 'burning') {
        score += 35;
        evidence.push('Dark burning urination indicates Small Intestine Heat');
    }
    if (int.urination?.blood === true) {
        score += 25;
        evidence.push('Blood in urine indicates Small Intestine Heat');
    }
    if (int.mouth?.ulcers === true || int.tongue?.ulcers === true) {
        score += 25;
        evidence.push('Mouth/tongue ulcers indicate Heart Fire descending to Small Intestine');
    }
    if (int.emotions?.restlessness === 'severe' || int.sleep?.insomnia === 'severe') {
        score += 15;
        evidence.push('Restlessness/insomnia indicate Heart-Small Intestine Heat');
    }
    if (int.abdomen?.pain === 'lower' && int.abdomen?.pain_quality === 'burning') {
        score += 20;
        evidence.push('Lower abdominal burning pain indicates Small Intestine Heat');
    }
    if (int.thirst?.quality === 'thirsty') {
        score += 10;
        evidence.push('Thirst indicates Heat');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['urinary burning', 'uti', 'mouth ulcers', 'restless', 'blood in urine'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Small Intestine Heat');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Small Intestine Heat',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Heat in Small Intestine causing urinary symptoms and mouth ulcers',
            treatment_principle: 'Clear Heart Fire, drain Small Intestine Heat, promote urination',
            herbal_formula: 'Dao Chi San (Guide Out the Red Powder)',
            acupuncture_points: 'HT8, SI3, BL27, CV3, SP6',
            dietary_advice: 'Cooling diuretic foods, avoid spicy foods and alcohol',
            category: 'Small Intestine Patterns'
        });
    }
    
    // Bladder Damp-Heat
    score = 0;
    evidence = [];
    
    if (obs.tongue?.coating_color === 'yellow' && obs.tongue?.coating_thickness === 'thick') {
        score += 20;
        evidence.push('Thick yellow coating indicates Damp-Heat');
    }
    if (int.urination?.frequency === 'frequent' && int.urination?.amount === 'scanty') {
        score += 30;
        evidence.push('Frequent scanty urination indicates Bladder Damp-Heat');
    }
    if (int.urination?.sensation === 'burning' || int.urination?.sensation === 'painful') {
        score += 35;
        evidence.push('Painful burning urination indicates Bladder Damp-Heat');
    }
    if (int.urination?.color === 'dark' || int.urination?.color === 'cloudy') {
        score += 25;
        evidence.push('Dark cloudy urine indicates Bladder Damp-Heat');
    }
    if (int.urination?.urgency === true) {
        score += 20;
        evidence.push('Urinary urgency indicates Bladder Damp-Heat');
    }
    if (int.urination?.blood === true) {
        score += 25;
        evidence.push('Blood in urine indicates severe Bladder Damp-Heat');
    }
    if (int.lower_back?.pain === true || int.lower_back?.heaviness === true) {
        score += 15;
        evidence.push('Lower back heaviness indicates Bladder Damp-Heat');
    }
    if (int.fever?.quality === 'low_grade') {
        score += 10;
        evidence.push('Low-grade fever indicates Damp-Heat');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['uti', 'bladder infection', 'cystitis', 'painful urination', 'urinary urgency'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Bladder Damp-Heat');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Bladder Damp-Heat',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Damp-Heat in the Bladder causing urinary tract infection symptoms',
            treatment_principle: 'Clear Heat, resolve Dampness, promote urination',
            herbal_formula: 'Ba Zheng San (Eight Herb Powder for Rectification)',
            acupuncture_points: 'BL28, BL22, CV3, SP9, SP6, LV2',
            dietary_advice: 'Diuretic foods, cranberry juice, avoid spicy and damp-forming foods',
            category: 'Bladder Patterns'
        });
    }
    
    // Large Intestine Heat
    score = 0;
    evidence = [];
    
    if (obs.tongue?.coating_color === 'yellow' && obs.tongue?.coating_thickness === 'thick') {
        score += 20;
        evidence.push('Thick yellow coating indicates Heat');
    }
    if (int.digestion?.stools === 'constipated') {
        score += 30;
        evidence.push('Constipation indicates Large Intestine Heat');
    }
    if (int.digestion?.stool_quality === 'dry' || int.digestion?.stool_quality === 'hard') {
        score += 25;
        evidence.push('Dry hard stools indicate Large Intestine Heat');
    }
    if (int.digestion?.stool_smell === 'foul' || int.digestion?.stool_smell === 'burning') {
        score += 20;
        evidence.push('Foul-smelling stools indicate Heat');
    }
    if (int.abdomen?.pain === 'severe' && int.abdomen?.pain_quality === 'burning') {
        score += 25;
        evidence.push('Severe abdominal burning pain indicates Large Intestine Heat');
    }
    if (int.anus?.burning === true || int.anus?.hemorrhoids === true) {
        score += 20;
        evidence.push('Burning anus/hemorrhoids indicate Large Intestine Heat');
    }
    if (int.thirst?.quality === 'very_thirsty' || int.thirst?.preference === 'cold_drinks') {
        score += 15;
        evidence.push('Extreme thirst indicates Heat');
    }
    if (int.fever?.severity === 'high' || int.fever?.pattern === 'afternoon') {
        score += 15;
        evidence.push('High fever indicates Heat');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['constipation', 'hemorrhoids', 'anal burning', 'abdominal pain'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Large Intestine Heat');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Large Intestine Heat',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Heat in Large Intestine causing constipation and dry hard stools',
            treatment_principle: 'Clear Heat, moisten Intestines, promote bowel movement',
            herbal_formula: 'Ma Zi Ren Wan (Hemp Seed Pill) or Da Cheng Qi Tang',
            acupuncture_points: 'ST25, ST37, LI4, LI11, SJ6',
            dietary_advice: 'High fiber foods, increase fluids, avoid hot spicy foods',
            category: 'Large Intestine Patterns'
        });
    }
    
    return patterns;
}

// ==================== COMBINED PATTERNS ====================

function analyzeCombinedPatterns(obs, int, cc) {
    const patterns = [];
    
    // Liver-Spleen Disharmony
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.body_color === 'pale' && obs.tongue?.features?.includes('red_sides')) {
        score += 25;
        evidence.push('Pale tongue with red sides indicates Liver-Spleen disharmony');
    }
    if (int.emotions?.primary_emotion === 'irritable' || int.emotions?.mood === 'depressed') {
        score += 25;
        evidence.push('Emotional disturbance indicates Liver Qi stagnation');
    }
    if (int.digestion?.stools === 'loose' || int.digestion?.alternating === true) {
        score += 30;
        evidence.push('Loose/alternating stools indicate Spleen deficiency with Liver overacting');
    }
    if (int.hypochondrium?.distention === true || int.hypochondrium?.pain === true) {
        score += 20;
        evidence.push('Hypochondriac distention indicates Liver Qi stagnation');
    }
    if (int.digestion?.bloating === 'moderate' || int.digestion?.bloating === 'severe') {
        score += 25;
        evidence.push('Abdominal bloating indicates Spleen deficiency');
    }
    if (int.energy?.overall_energy === 'low') {
        score += 15;
        evidence.push('Fatigue indicates Spleen Qi deficiency');
    }
    if (int.digestion?.appetite === 'poor') {
        score += 15;
        evidence.push('Poor appetite indicates Spleen deficiency');
    }
    if (int.symptoms_relationship?.stress_worsens === true) {
        score += 20;
        evidence.push('Stress worsening symptoms indicates Liver overacting on Spleen');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['ibs', 'irritable bowel', 'stress digestion', 'alternating', 'bloating irritable'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Liver-Spleen disharmony');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Liver-Spleen Disharmony',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Liver Qi stagnation overacting on Spleen causing digestive and emotional symptoms',
            treatment_principle: 'Soothe Liver, strengthen Spleen, harmonize Middle Jiao',
            herbal_formula: 'Xiao Yao San (Free and Easy Wanderer) or Tong Xie Yao Fang',
            acupuncture_points: 'LV3, LV13, SP6, ST36, CV12, PC6',
            dietary_advice: 'Regular meals, avoid stress while eating, warm cooked foods',
            category: 'Combined Patterns'
        });
    }
    
    // Heart-Kidney Not Communicating
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.coating === 'none') {
        score += 25;
        evidence.push('Red peeled tongue indicates Yin deficiency with Heart-Kidney disharmony');
    }
    if (int.sleep?.insomnia === 'severe' || int.sleep?.dream_disturbed === true) {
        score += 30;
        evidence.push('Severe insomnia indicates Heart-Kidney not communicating');
    }
    if (int.emotions?.anxiety === 'severe' || int.emotions?.restlessness === 'severe') {
        score += 25;
        evidence.push('Anxiety/restlessness indicate Heart Fire with Kidney Yin deficiency');
    }
    if (int.heart?.palpitations === 'severe' || int.heart?.palpitations === 'night') {
        score += 25;
        evidence.push('Palpitations indicate Heart-Kidney disharmony');
    }
    if (int.night_sweats?.presence === true || int.night_sweats?.severity === 'severe') {
        score += 20;
        evidence.push('Night sweats indicate Yin deficiency');
    }
    if (int.lower_back?.pain === true || int.lower_back?.weakness === true) {
        score += 20;
        evidence.push('Lower back weakness indicates Kidney deficiency');
    }
    if (int.memory?.poor === true || int.concentration?.difficulty === true) {
        score += 15;
        evidence.push('Poor memory indicates Heart-Kidney not communicating');
    }
    if (int.tinnitus?.quality === 'high_pitched') {
        score += 15;
        evidence.push('High-pitched tinnitus indicates Kidney Yin deficiency');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['insomnia', 'anxiety', 'palpitations', 'restless', 'cant sleep'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Heart-Kidney not communicating');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Heart-Kidney Not Communicating',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Kidney Yin failing to nourish Heart, Heart Fire not warming Kidneys',
            treatment_principle: 'Nourish Kidney Yin, clear Heart Fire, promote Heart-Kidney communication',
            herbal_formula: 'Liu Wei Di Huang Wan with Huang Lian or Tian Wang Bu Xin Dan',
            acupuncture_points: 'HT7, KI3, KI6, BL15, BL23, CV4, GV20',
            dietary_advice: 'Yin-nourishing foods, reduce stress, adequate sleep',
            category: 'Combined Patterns'
        });
    }
    
    // Lung-Kidney Yin Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.coating === 'none') {
        score += 25;
        evidence.push('Red peeled tongue indicates Yin deficiency');
    }
    if (int.respiratory?.cough === 'chronic' && int.respiratory?.cough === 'dry') {
        score += 30;
        evidence.push('Chronic dry cough indicates Lung-Kidney Yin deficiency');
    }
    if (int.respiratory?.phlegm_amount === 'scanty' || int.respiratory?.phlegm_quality === 'sticky') {
        score += 20;
        evidence.push('Scanty sticky phlegm indicates Yin deficiency');
    }
    if (int.respiratory?.blood_in_phlegm === true) {
        score += 25;
        evidence.push('Blood-tinged sputum indicates Lung Yin deficiency with Heat');
    }
    if (int.lower_back?.soreness === true || int.lower_back?.weakness === true) {
        score += 20;
        evidence.push('Lower back soreness indicates Kidney deficiency');
    }
    if (int.night_sweats?.presence === true) {
        score += 20;
        evidence.push('Night sweats indicate Yin deficiency');
    }
    if (int.fever?.quality === 'afternoon_low_grade' || int.fever?.quality === 'tidal') {
        score += 20;
        evidence.push('Afternoon tidal fever indicates Yin deficiency');
    }
    if (int.voice?.hoarseness === true || int.voice?.quality === 'weak') {
        score += 15;
        evidence.push('Hoarse voice indicates Lung Yin deficiency');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['chronic cough', 'dry cough', 'tuberculosis', 'chronic bronchitis'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Lung-Kidney Yin deficiency');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Lung-Kidney Yin Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Kidney Yin failing to nourish Lung Yin causing chronic dry cough',
            treatment_principle: 'Nourish Lung and Kidney Yin, stop cough, clear deficiency Heat',
            herbal_formula: 'Bai He Gu Jin Tang (Lily Bulb to Preserve Metal Decoction)',
            acupuncture_points: 'LU9, KI3, KI6, BL13, BL23, CV17',
            dietary_advice: 'Yin-nourishing moistening foods, pears, honey, adequate rest',
            category: 'Combined Patterns'
        });
    }
    
    // Liver-Kidney Yin Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'red' && obs.tongue?.coating === 'thin') {
        score += 25;
        evidence.push('Red tongue with thin coating indicates Yin deficiency');
    }
    if (int.head?.dizziness === 'severe' || int.head?.vertigo === true) {
        score += 25;
        evidence.push('Dizziness/vertigo indicate Liver-Kidney Yin deficiency');
    }
    if (int.eyes?.dryness === true || int.eyes?.blurred_vision === true) {
        score += 25;
        evidence.push('Dry eyes/blurred vision indicate Liver-Kidney Yin deficiency');
    }
    if (int.lower_back?.soreness === true || int.knees?.weakness === true) {
        score += 25;
        evidence.push('Lower back/knee weakness indicates Kidney Yin deficiency');
    }
    if (int.tinnitus?.quality === 'high_pitched') {
        score += 20;
        evidence.push('High-pitched tinnitus indicates Kidney Yin deficiency');
    }
    if (int.night_sweats?.presence === true) {
        score += 20;
        evidence.push('Night sweats indicate Yin deficiency');
    }
    if (int.muscles?.twitching === true || int.numbness?.location === 'limbs') {
        score += 20;
        evidence.push('Muscle twitching/numbness indicate Liver Blood-Yin deficiency');
    }
    if (int.men?.nocturnal_emission === true || int.women?.menstrual_flow === 'scanty') {
        score += 15;
        evidence.push('Reproductive symptoms indicate Liver-Kidney Yin deficiency');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['dizziness', 'vertigo', 'tinnitus', 'dry eyes', 'blurred vision', 'weak knees'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Liver-Kidney Yin deficiency');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Liver-Kidney Yin Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Deficiency of Liver and Kidney Yin causing dizziness, dry eyes, and weakness',
            treatment_principle: 'Nourish Liver and Kidney Yin, benefit Essence',
            herbal_formula: 'Qi Ju Di Huang Wan (Lycium-Chrysanthemum-Rehmannia Pill)',
            acupuncture_points: 'LV3, KI3, KI6, BL18, BL23, GB20',
            dietary_advice: 'Yin-nourishing foods, black sesame, goji berries, adequate rest',
            category: 'Combined Patterns'
        });
    }
    
    // Spleen-Kidney Yang Deficiency
    score = 0;
    evidence = [];
    
    if (obs.tongue?.body_color === 'pale' && obs.tongue?.body_shape === 'swollen') {
        score += 30;
        evidence.push('Pale swollen tongue indicates Yang deficiency');
    }
    if (int.digestion?.stools === 'loose' || int.digestion?.timing === 'early_morning') {
        score += 30;
        evidence.push('Loose early morning stools (cock-crow diarrhea) indicate Spleen-Kidney Yang deficiency');
    }
    if (int.temperature?.feeling === 'cold' || int.temperature?.cold_limbs === true) {
        score += 25;
        evidence.push('Cold sensation/limbs indicate Yang deficiency');
    }
    if (int.energy?.overall_energy === 'exhausted') {
        score += 20;
        evidence.push('Severe exhaustion indicates Spleen-Kidney Yang deficiency');
    }
    if (int.lower_back?.pain === true && int.lower_back?.coldness === true) {
        score += 25;
        evidence.push('Cold lower back pain indicates Kidney Yang deficiency');
    }
    if (int.digestion?.undigested_food === true) {
        score += 25;
        evidence.push('Undigested food in stools indicates Spleen-Kidney Yang deficiency');
    }
    if (int.urination?.frequency === 'frequent' && int.urination?.color === 'clear') {
        score += 20;
        evidence.push('Frequent clear urination indicates Kidney Yang deficiency');
    }
    if (int.edema?.location === 'legs' || int.edema?.location === 'generalized') {
        score += 20;
        evidence.push('Edema indicates Spleen-Kidney Yang deficiency affecting water metabolism');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['chronic diarrhea', 'morning diarrhea', 'always cold', 'edema', 'exhausted'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Spleen-Kidney Yang deficiency');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Spleen-Kidney Yang Deficiency',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Combined Yang deficiency of Spleen and Kidney affecting digestion and water metabolism',
            treatment_principle: 'Warm and tonify Spleen and Kidney Yang, consolidate',
            herbal_formula: 'Si Shen Wan (Four-Miracle Pill)',
            acupuncture_points: 'BL20, BL21, BL23, GV4, CV4, CV6, ST36 (with moxa)',
            dietary_advice: 'Warming foods, avoid cold/raw foods, ginger, cinnamon',
            category: 'Combined Patterns'
        });
    }
    
    return patterns;
}

// ==================== WIND-DAMP PATTERNS ====================

function analyzeWindDampPatterns(obs, int, cc) {
    const patterns = [];
    
    // Wind-Damp Bi Syndrome (Painful Obstruction)
    let score = 0;
    let evidence = [];
    
    if (obs.tongue?.coating_color === 'white' && obs.tongue?.coating_thickness === 'thick') {
        score += 20;
        evidence.push('Thick white coating indicates Dampness');
    }
    if (obs.tongue?.coating_quality === 'greasy') {
        score += 15;
        evidence.push('Greasy coating indicates Dampness');
    }
    if (int.joints?.pain === 'multiple' || int.joints?.pain === 'migratory') {
        score += 35;
        evidence.push('Migratory joint pain indicates Wind-Damp Bi');
    }
    if (int.joints?.stiffness === true || int.joints?.morning_stiffness === true) {
        score += 25;
        evidence.push('Joint stiffness indicates Dampness obstructing joints');
    }
    if (int.joints?.swelling === true) {
        score += 25;
        evidence.push('Joint swelling indicates Damp Bi');
    }
    if (int.muscles?.heaviness === true || int.limbs?.heaviness === 'severe') {
        score += 20;
        evidence.push('Heavy sensation indicates Dampness');
    }
    if (int.body?.aches === 'generalized' || int.body?.aches === 'moving') {
        score += 20;
        evidence.push('Generalized/moving body aches indicate Wind-Damp');
    }
    if (int.joints?.worse_with?.includes('damp_weather') || int.joints?.worse_with?.includes('rain')) {
        score += 25;
        evidence.push('Pain worsening with damp weather indicates Wind-Damp Bi');
    }
    if (int.range_of_motion?.limited === true) {
        score += 15;
        evidence.push('Limited range of motion indicates Bi syndrome');
    }
    
    if (cc?.primary_concern) {
        const concern = cc.primary_concern.toLowerCase();
        const keywords = ['arthritis', 'joint pain', 'rheumatism', 'body aches', 'stiffness'];
        if (keywords.some(kw => concern.includes(kw))) {
            score += 10;
            evidence.push('Chief complaint aligns with Wind-Damp Bi syndrome');
        }
    }
    
    if (score >= 35) {
        patterns.push({
            name: 'Wind-Damp Bi Syndrome',
            confidence: Math.min(score, 95),
            supporting_evidence: evidence,
            description: 'Wind and Dampness obstructing channels causing joint pain and stiffness',
            treatment_principle: 'Expel Wind, dispel Dampness, unblock channels, stop pain',
            herbal_formula: 'Juan Bi Tang (Remove Painful Obstruction Decoction) or Du Huo Ji Sheng Tang',
            acupuncture_points: 'Local Ah-shi points, LI4, LI11, ST36, SP9, GB34',
            dietary_advice: 'Avoid damp-forming foods, warming anti-rheumatic herbs, gentle exercise',
            category: 'Wind-Damp Patterns'
        });
    }
    
    return patterns;
}

// ==================== HELPER FUNCTIONS ====================

function calculateDataCompleteness(observations, interrogations) {
    const obsCount = Object.keys(observations).length;
    const intCount = Object.keys(interrogations).length;
    const totalSections = 24; // 12 obs + 12 int
    const completedSections = obsCount + intCount;
    
    return Math.round((completedSections / totalSections) * 100);
}
