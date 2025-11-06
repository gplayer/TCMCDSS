// Pattern Analysis API - Cloudflare Pages Functions
// Simplified pattern matching based on TCM principles

export async function onRequestPost(context) {
    const { params, env } = context;
    const visitId = params.visitId;
    
    try {
        // Fetch observations and interrogations
        const { results: observations } = await env.DB.prepare(
            'SELECT * FROM observations WHERE visit_id = ?'
        ).bind(visitId).all();
        
        const { results: interrogations } = await env.DB.prepare(
            'SELECT * FROM interrogations WHERE visit_id = ?'
        ).bind(visitId).all();
        
        // Parse data
        const obsData = {};
        observations.forEach(row => {
            obsData[row.section] = JSON.parse(row.data);
        });
        
        const intData = {};
        interrogations.forEach(row => {
            intData[row.section] = JSON.parse(row.data);
        });
        
        // Generate pattern matches
        const patterns = analyzePatterns(obsData, intData);
        
        // Save analysis
        const now = new Date().toISOString();
        await env.DB.prepare(
            `INSERT INTO pattern_analyses (visit_id, patterns, confidence, created_at)
             VALUES (?, ?, ?, ?)`
        ).bind(
            visitId,
            JSON.stringify(patterns),
            patterns.overall_confidence || 0,
            now
        ).run();
        
        return new Response(JSON.stringify(patterns), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function analyzePatterns(observations, interrogations) {
    const patterns = [];
    let totalConfidence = 0;
    
    // Pattern 1: Spleen Qi Deficiency
    let spleenQiScore = 0;
    const spleenQiEvidence = [];
    
    if (observations.tongue?.color === 'pale') {
        spleenQiScore += 20;
        spleenQiEvidence.push('Pale tongue indicates Qi/Blood deficiency');
    }
    if (observations.tongue?.body_type === 'swollen') {
        spleenQiScore += 15;
        spleenQiEvidence.push('Swollen tongue indicates Spleen Qi deficiency with dampness');
    }
    if (interrogations.digestion?.stools === 'loose') {
        spleenQiScore += 25;
        spleenQiEvidence.push('Loose stools indicate Spleen Qi deficiency');
    }
    if (interrogations.energy?.overall_energy === 'low' || interrogations.energy?.overall_energy === 'fatigued') {
        spleenQiScore += 20;
        spleenQiEvidence.push('Low energy indicates Qi deficiency');
    }
    if (interrogations.digestion?.appetite === 'poor') {
        spleenQiScore += 10;
        spleenQiEvidence.push('Poor appetite indicates Spleen Qi deficiency');
    }
    
    if (spleenQiScore > 0) {
        patterns.push({
            name: 'Spleen Qi Deficiency',
            confidence: Math.min(spleenQiScore, 95),
            supporting_evidence: spleenQiEvidence,
            description: 'Spleen Qi Deficiency results in poor digestion, loose stools, fatigue, and dampness accumulation.',
            treatment_principle: 'Tonify Spleen Qi, resolve dampness, strengthen digestion',
            herbal_formula: 'Si Jun Zi Tang (Four Gentlemen Decoction)',
            acupuncture_points: 'ST36, SP6, SP3, CV12, BL20'
        });
        totalConfidence += spleenQiScore;
    }
    
    // Pattern 2: Kidney Yang Deficiency
    let kidneyYangScore = 0;
    const kidneyYangEvidence = [];
    
    if (observations.complexion?.primary_color === 'pale') {
        kidneyYangScore += 15;
        kidneyYangEvidence.push('Pale complexion may indicate Yang deficiency');
    }
    if (interrogations.temperature?.feeling === 'cold' || interrogations.temperature?.feeling === 'chilly') {
        kidneyYangScore += 25;
        kidneyYangEvidence.push('Feeling cold indicates Yang deficiency');
    }
    if (interrogations.energy?.overall_energy === 'low') {
        kidneyYangScore += 15;
        kidneyYangEvidence.push('Chronic fatigue may indicate Kidney Yang deficiency');
    }
    if (interrogations.urination?.frequency === 'frequent' && interrogations.urination?.color === 'clear') {
        kidneyYangScore += 20;
        kidneyYangEvidence.push('Frequent clear urination indicates Kidney Yang deficiency');
    }
    
    if (kidneyYangScore > 0) {
        patterns.push({
            name: 'Kidney Yang Deficiency',
            confidence: Math.min(kidneyYangScore, 95),
            supporting_evidence: kidneyYangEvidence,
            description: 'Kidney Yang Deficiency manifests as chronic fatigue, coldness, frequent pale urination, and lower back weakness.',
            treatment_principle: 'Warm and tonify Kidney Yang, strengthen lower back',
            herbal_formula: 'Jin Gui Shen Qi Wan (Golden Cabinet Kidney Qi Pill)',
            acupuncture_points: 'GV4, BL23, KI3, KI7, CV4, CV6'
        });
        totalConfidence += kidneyYangScore;
    }
    
    // Pattern 3: Liver Qi Stagnation
    let liverQiScore = 0;
    const liverQiEvidence = [];
    
    if (interrogations.emotions?.primary_emotion === 'irritable' || interrogations.emotions?.primary_emotion === 'angry') {
        liverQiScore += 25;
        liverQiEvidence.push('Irritability and anger indicate Liver Qi stagnation');
    }
    if (interrogations.stress?.level === 'high') {
        liverQiScore += 15;
        liverQiEvidence.push('High stress contributes to Liver Qi stagnation');
    }
    if (interrogations.sleep?.quality === 'poor' || interrogations.sleep?.difficulty === 'falling_asleep') {
        liverQiScore += 10;
        liverQiEvidence.push('Sleep difficulties may relate to Liver Qi stagnation');
    }
    
    if (liverQiScore > 0) {
        patterns.push({
            name: 'Liver Qi Stagnation',
            confidence: Math.min(liverQiScore, 95),
            supporting_evidence: liverQiEvidence,
            description: 'Liver Qi Stagnation causes emotional frustration, irritability, stress, and may affect sleep and digestion.',
            treatment_principle: 'Soothe Liver, regulate Qi flow, calm spirit',
            herbal_formula: 'Xiao Yao San (Free and Easy Wanderer)',
            acupuncture_points: 'LV3, LV14, GB34, PC6, HT7'
        });
        totalConfidence += liverQiScore;
    }
    
    // Sort by confidence
    patterns.sort((a, b) => b.confidence - a.confidence);
    
    return {
        patterns: patterns,
        overall_confidence: patterns.length > 0 ? Math.min(Math.round(totalConfidence / patterns.length), 95) : 0,
        data_completeness: calculateDataCompleteness(observations, interrogations)
    };
}

function calculateDataCompleteness(observations, interrogations) {
    const obsCount = Object.keys(observations).length;
    const intCount = Object.keys(interrogations).length;
    const totalSections = 24; // 12 obs + 12 int
    const completedSections = obsCount + intCount;
    
    return Math.round((completedSections / totalSections) * 100);
}
