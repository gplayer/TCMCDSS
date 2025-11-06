// TCM Reasoning API - Cloudflare Pages Functions
// Simplified version - returns basic Eight Principles analysis

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
        
        // Simple TCM profile generation based on data
        const profile = generateTCMProfile(obsData, intData);
        
        // Save profile
        const now = new Date().toISOString();
        await env.DB.prepare(
            `INSERT OR REPLACE INTO tcm_reasoning_profiles (visit_id, profile_data, created_at)
             VALUES (?, ?, COALESCE((SELECT created_at FROM tcm_reasoning_profiles WHERE visit_id = ?), ?))`
        ).bind(
            visitId,
            JSON.stringify(profile),
            visitId,
            now
        ).run();
        
        return new Response(JSON.stringify({ profile }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function generateTCMProfile(observations, interrogations) {
    // Basic Eight Principles determination
    let interiorExterior = 'neutral';
    let hotCold = 'neutral';
    let excessDeficiency = 'neutral';
    let yinYang = 'neutral';
    const affectedOrgans = [];
    const pathogenicFactors = [];
    const qiBloodFluids = [];
    
    // Analyze tongue (if available)
    if (observations.tongue) {
        const tongue = observations.tongue;
        
        // Color analysis
        if (tongue.color === 'pale') {
            excessDeficiency = 'deficiency';
            hotCold = 'cold';
            qiBloodFluids.push('Blood Deficiency');
            affectedOrgans.push('Spleen');
        } else if (tongue.color === 'red') {
            hotCold = 'hot';
            excessDeficiency = 'excess';
        }
        
        // Coating analysis
        if (tongue.coating === 'thick_white') {
            pathogenicFactors.push('Cold-Dampness');
            affectedOrgans.push('Spleen');
        } else if (tongue.coating === 'yellow') {
            hotCold = 'hot';
            pathogenicFactors.push('Damp-Heat');
        }
        
        // Body type
        if (tongue.body_type === 'swollen') {
            qiBloodFluids.push('Fluid Retention');
            affectedOrgans.push('Spleen', 'Kidney');
        }
    }
    
    // Analyze complexion
    if (observations.complexion) {
        const complexion = observations.complexion;
        if (complexion.primary_color === 'pale') {
            qiBloodFluids.push('Qi Deficiency');
        } else if (complexion.primary_color === 'red') {
            hotCold = 'hot';
            affectedOrgans.push('Heart', 'Liver');
        }
    }
    
    // Analyze energy (from interrogation)
    if (interrogations.energy) {
        const energy = interrogations.energy;
        if (energy.overall_energy === 'low' || energy.overall_energy === 'fatigued') {
            excessDeficiency = 'deficiency';
            qiBloodFluids.push('Qi Deficiency');
            affectedOrgans.push('Spleen', 'Kidney');
        }
    }
    
    // Analyze digestion
    if (interrogations.digestion) {
        const digestion = interrogations.digestion;
        if (digestion.stools === 'loose' || digestion.stools === 'watery') {
            excessDeficiency = 'deficiency';
            affectedOrgans.push('Spleen');
            hotCold = 'cold';
        }
    }
    
    // Determine Yin/Yang based on other principles
    if (hotCold === 'hot' && excessDeficiency === 'excess') {
        yinYang = 'yang_excess';
    } else if (hotCold === 'cold' && excessDeficiency === 'deficiency') {
        yinYang = 'yang_deficiency';
    } else if (hotCold === 'hot' && excessDeficiency === 'deficiency') {
        yinYang = 'yin_deficiency';
    }
    
    // Deduplicate arrays
    const uniqueOrgans = [...new Set(affectedOrgans)];
    const uniquePathogens = [...new Set(pathogenicFactors)];
    const uniqueQiBF = [...new Set(qiBloodFluids)];
    
    return {
        eight_principles: {
            interior_exterior: interiorExterior,
            hot_cold: hotCold,
            excess_deficiency: excessDeficiency,
            yin_yang: yinYang
        },
        affected_organs: uniqueOrgans,
        pathogenic_factors: uniquePathogens,
        qi_blood_fluids: uniqueQiBF
    };
}
