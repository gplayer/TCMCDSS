// TCM Reasoning API - Cloudflare Pages Functions
// Advanced Eight Principles Analysis with comprehensive diagnostic logic

export async function onRequestPost(context) {
    const { params, env } = context;
    const visitId = params.visitId;
    
    try {
        // Fetch all diagnostic data
        const { results: observations } = await env.DB.prepare(
            'SELECT * FROM observations WHERE visit_id = ?'
        ).bind(visitId).all();
        
        const { results: interrogations } = await env.DB.prepare(
            'SELECT * FROM interrogations WHERE visit_id = ?'
        ).bind(visitId).all();
        
        const chiefComplaint = await env.DB.prepare(
            'SELECT * FROM chief_complaints WHERE visit_id = ?'
        ).bind(visitId).first();
        
        // Parse data
        const obsData = {};
        observations.forEach(row => {
            obsData[row.section] = JSON.parse(row.data);
        });
        
        const intData = {};
        interrogations.forEach(row => {
            intData[row.section] = JSON.parse(row.data);
        });
        
        // Generate comprehensive TCM profile
        const profile = generateAdvancedTCMProfile(obsData, intData, chiefComplaint);
        
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

function generateAdvancedTCMProfile(observations, interrogations, chiefComplaint) {
    // Initialize scoring systems
    const scores = {
        interior: 0, exterior: 0,
        hot: 0, cold: 0,
        excess: 0, deficiency: 0,
        yin: 0, yang: 0
    };
    
    const affectedOrgans = new Set();
    const pathogenicFactors = new Set();
    const qiBloodFluids = new Set();
    const clinicalManifestations = [];
    const reasoningNotes = [];
    
    // ===== TONGUE DIAGNOSIS =====
    if (observations.tongue) {
        const tongue = observations.tongue;
        
        // Body Color Analysis
        if (tongue.body_color === 'pale') {
            scores.deficiency += 25;
            scores.cold += 20;
            scores.yang -= 15;
            qiBloodFluids.add('Blood Deficiency');
            qiBloodFluids.add('Qi Deficiency');
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Heart');
            clinicalManifestations.push('Pale tongue body indicates Qi and Blood deficiency');
            reasoningNotes.push('Pale tongue suggests insufficient Qi and Blood, commonly from Spleen-Stomach dysfunction');
        } else if (tongue.body_color === 'pale_red') {
            reasoningNotes.push('Normal pale-red tongue indicates balanced Qi and Blood');
        } else if (tongue.body_color === 'red') {
            scores.hot += 30;
            scores.excess += 15;
            scores.yin -= 20;
            pathogenicFactors.add('Heat');
            affectedOrgans.add('Heart');
            affectedOrgans.add('Liver');
            clinicalManifestations.push('Red tongue indicates Heat pattern');
            reasoningNotes.push('Red tongue reflects internal Heat, often from Yin deficiency or pathogenic Heat');
        } else if (tongue.body_color === 'dark_red') {
            scores.hot += 40;
            scores.excess += 20;
            scores.yin -= 30;
            pathogenicFactors.add('Extreme Heat');
            qiBloodFluids.add('Blood Stasis');
            clinicalManifestations.push('Dark red tongue indicates extreme Heat or Blood stasis');
            reasoningNotes.push('Dark red tongue suggests severe Heat entering Blood level or chronic Blood stasis');
        } else if (tongue.body_color === 'purple' || tongue.body_color === 'blue') {
            scores.cold += 30;
            scores.deficiency += 20;
            qiBloodFluids.add('Blood Stasis');
            qiBloodFluids.add('Qi Stagnation');
            pathogenicFactors.add('Cold');
            affectedOrgans.add('Heart');
            affectedOrgans.add('Liver');
            clinicalManifestations.push('Purple/blue tongue indicates Blood stasis with Cold');
            reasoningNotes.push('Purple-blue tongue reflects severe Qi and Blood stagnation, often with Cold obstruction');
        }
        
        // Body Shape Analysis
        if (tongue.body_shape === 'thin') {
            scores.deficiency += 20;
            scores.yin -= 15;
            qiBloodFluids.add('Blood Deficiency');
            qiBloodFluids.add('Yin Deficiency');
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Kidney');
            clinicalManifestations.push('Thin tongue indicates Yin and Blood deficiency');
        } else if (tongue.body_shape === 'swollen') {
            scores.deficiency += 15;
            scores.cold += 15;
            qiBloodFluids.add('Dampness');
            qiBloodFluids.add('Phlegm');
            pathogenicFactors.add('Dampness');
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Kidney');
            clinicalManifestations.push('Swollen tongue indicates Spleen Qi deficiency with Dampness');
            reasoningNotes.push('Swollen tongue reflects impaired fluid metabolism from Spleen-Kidney Yang deficiency');
        }
        
        // Special Features
        if (tongue.features && Array.isArray(tongue.features)) {
            if (tongue.features.includes('tooth_marked')) {
                scores.deficiency += 20;
                qiBloodFluids.add('Qi Deficiency');
                affectedOrgans.add('Spleen');
                clinicalManifestations.push('Tooth-marked edges indicate Spleen Qi deficiency with Dampness');
                reasoningNotes.push('Tooth marks result from tongue swelling pressing against teeth, indicating Spleen Qi weakness');
            }
            if (tongue.features.includes('cracks')) {
                scores.deficiency += 15;
                scores.yin -= 20;
                qiBloodFluids.add('Yin Deficiency');
                clinicalManifestations.push('Cracked tongue indicates Yin deficiency or chronic Qi consumption');
            }
            if (tongue.features.includes('red_tip')) {
                scores.hot += 15;
                affectedOrgans.add('Heart');
                pathogenicFactors.add('Heart Fire');
                clinicalManifestations.push('Red tip indicates Heart Fire disturbing Spirit');
            }
            if (tongue.features.includes('red_sides')) {
                scores.hot += 15;
                affectedOrgans.add('Liver');
                affectedOrgans.add('Gallbladder');
                pathogenicFactors.add('Liver Fire');
                clinicalManifestations.push('Red sides indicate Liver-Gallbladder Heat');
            }
        }
        
        // Moisture Analysis
        if (tongue.moisture === 'dry') {
            scores.hot += 20;
            scores.deficiency += 15;
            scores.yin -= 25;
            qiBloodFluids.add('Yin Deficiency');
            qiBloodFluids.add('Fluid Depletion');
            clinicalManifestations.push('Dry tongue indicates Yin and Fluid deficiency');
        } else if (tongue.moisture === 'wet' || tongue.moisture === 'very_wet') {
            scores.cold += 20;
            scores.deficiency += 15;
            qiBloodFluids.add('Dampness');
            pathogenicFactors.add('Dampness');
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Kidney');
            clinicalManifestations.push('Excessively wet tongue indicates Spleen-Kidney Yang deficiency with Dampness');
        }
        
        // Coating Thickness
        if (tongue.coating_thickness === 'thick') {
            scores.excess += 25;
            pathogenicFactors.add('Dampness');
            pathogenicFactors.add('Phlegm');
            affectedOrgans.add('Spleen');
            clinicalManifestations.push('Thick coating indicates pathogenic accumulation');
        } else if (tongue.coating_thickness === 'none' || tongue.coating_thickness === 'peeled') {
            scores.deficiency += 25;
            scores.yin -= 30;
            qiBloodFluids.add('Stomach Yin Deficiency');
            affectedOrgans.add('Stomach');
            affectedOrgans.add('Kidney');
            clinicalManifestations.push('Absent coating indicates severe Yin deficiency');
        }
        
        // Coating Color
        if (tongue.coating_color === 'white') {
            scores.cold += 15;
            scores.exterior += 10;
            pathogenicFactors.add('Cold');
        } else if (tongue.coating_color === 'yellow') {
            scores.hot += 25;
            scores.interior += 15;
            pathogenicFactors.add('Heat');
        } else if (tongue.coating_color === 'gray' || tongue.coating_color === 'black') {
            scores.interior += 30;
            if (tongue.moisture === 'dry') {
                scores.hot += 30;
                pathogenicFactors.add('Extreme Heat');
            } else {
                scores.cold += 30;
                pathogenicFactors.add('Extreme Cold');
            }
        }
    }
    
    // ===== COMPLEXION & APPEARANCE =====
    if (observations.complexion) {
        const complexion = observations.complexion;
        if (complexion.primary_color === 'pale' || complexion.primary_color === 'white') {
            scores.deficiency += 20;
            scores.cold += 15;
            qiBloodFluids.add('Blood Deficiency');
            affectedOrgans.add('Lung');
            affectedOrgans.add('Spleen');
            clinicalManifestations.push('Pale complexion indicates Qi and Blood deficiency');
        } else if (complexion.primary_color === 'red' || complexion.primary_color === 'flushed') {
            scores.hot += 20;
            affectedOrgans.add('Heart');
            affectedOrgans.add('Liver');
            clinicalManifestations.push('Red face indicates Heat rising upward');
        } else if (complexion.primary_color === 'yellow' || complexion.primary_color === 'sallow') {
            scores.deficiency += 15;
            qiBloodFluids.add('Dampness');
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Stomach');
            clinicalManifestations.push('Yellow complexion indicates Spleen deficiency with Dampness');
        } else if (complexion.primary_color === 'dark' || complexion.primary_color === 'gray') {
            qiBloodFluids.add('Blood Stasis');
            affectedOrgans.add('Kidney');
            affectedOrgans.add('Liver');
        }
        
        if (complexion.luster === 'dull' || complexion.luster === 'withered') {
            scores.deficiency += 15;
            qiBloodFluids.add('Essence Deficiency');
        } else if (complexion.luster === 'shiny' || complexion.luster === 'greasy') {
            qiBloodFluids.add('Dampness');
            qiBloodFluids.add('Phlegm');
        }
    }
    
    // ===== PULSE DIAGNOSIS (if available) =====
    if (observations.pulse) {
        const pulse = observations.pulse;
        if (pulse.rate === 'rapid') {
            scores.hot += 25;
            scores.excess += 10;
        } else if (pulse.rate === 'slow') {
            scores.cold += 25;
            scores.deficiency += 10;
        }
        
        if (pulse.depth === 'floating') {
            scores.exterior += 25;
        } else if (pulse.depth === 'deep') {
            scores.interior += 25;
        }
        
        if (pulse.strength === 'forceful') {
            scores.excess += 20;
        } else if (pulse.strength === 'weak') {
            scores.deficiency += 20;
        }
        
        if (pulse.quality === 'slippery') {
            qiBloodFluids.add('Phlegm');
            qiBloodFluids.add('Dampness');
        } else if (pulse.quality === 'wiry') {
            affectedOrgans.add('Liver');
            qiBloodFluids.add('Qi Stagnation');
        } else if (pulse.quality === 'thready') {
            scores.deficiency += 20;
            qiBloodFluids.add('Blood Deficiency');
        }
    }
    
    // ===== INTERROGATION ANALYSIS =====
    
    // Temperature Preferences
    if (interrogations.temperature) {
        if (interrogations.temperature.feeling === 'cold' || interrogations.temperature.feeling === 'chilly') {
            scores.cold += 25;
            scores.deficiency += 15;
            scores.yang -= 25;
            clinicalManifestations.push('Aversion to cold indicates Yang deficiency');
        } else if (interrogations.temperature.feeling === 'hot') {
            scores.hot += 25;
            scores.yin -= 20;
            clinicalManifestations.push('Feeling hot indicates Heat pattern or Yin deficiency');
        }
        
        if (interrogations.temperature.preference === 'cold_drinks') {
            scores.hot += 15;
        } else if (interrogations.temperature.preference === 'warm_drinks') {
            scores.cold += 15;
        }
    }
    
    // Energy & Fatigue
    if (interrogations.energy) {
        if (interrogations.energy.overall_energy === 'low' || interrogations.energy.overall_energy === 'fatigued') {
            scores.deficiency += 30;
            qiBloodFluids.add('Qi Deficiency');
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Kidney');
            affectedOrgans.add('Lung');
            clinicalManifestations.push('Chronic fatigue indicates Qi deficiency');
        }
        
        if (interrogations.energy.time_of_day === 'worse_morning') {
            affectedOrgans.add('Kidney');
        } else if (interrogations.energy.time_of_day === 'worse_afternoon') {
            affectedOrgans.add('Spleen');
            scores.yin -= 10;
        }
    }
    
    // Digestion
    if (interrogations.digestion) {
        if (interrogations.digestion.appetite === 'poor' || interrogations.digestion.appetite === 'no_appetite') {
            scores.deficiency += 15;
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Stomach');
        } else if (interrogations.digestion.appetite === 'excessive') {
            scores.hot += 15;
            scores.excess += 10;
            pathogenicFactors.add('Stomach Fire');
        }
        
        if (interrogations.digestion.stools === 'loose' || interrogations.digestion.stools === 'watery') {
            scores.deficiency += 25;
            scores.cold += 20;
            qiBloodFluids.add('Spleen Qi Deficiency');
            qiBloodFluids.add('Dampness');
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Kidney');
            clinicalManifestations.push('Loose stools indicate Spleen Yang deficiency');
        } else if (interrogations.digestion.stools === 'constipated') {
            scores.hot += 15;
            qiBloodFluids.add('Fluid Deficiency');
            clinicalManifestations.push('Constipation may indicate Heat or Fluid deficiency');
        }
        
        if (interrogations.digestion.bloating === 'severe' || interrogations.digestion.bloating === 'moderate') {
            qiBloodFluids.add('Qi Stagnation');
            qiBloodFluids.add('Dampness');
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Liver');
        }
    }
    
    // Sleep Patterns
    if (interrogations.sleep) {
        if (interrogations.sleep.quality === 'poor') {
            if (interrogations.sleep.difficulty === 'falling_asleep') {
                affectedOrgans.add('Liver');
                qiBloodFluids.add('Qi Stagnation');
            } else if (interrogations.sleep.difficulty === 'staying_asleep') {
                affectedOrgans.add('Heart');
                affectedOrgans.add('Kidney');
                qiBloodFluids.add('Yin Deficiency');
            } else if (interrogations.sleep.difficulty === 'early_waking') {
                affectedOrgans.add('Liver');
                affectedOrgans.add('Gallbladder');
            }
        }
        
        if (interrogations.sleep.dreams === 'excessive' || interrogations.sleep.dreams === 'disturbing') {
            affectedOrgans.add('Heart');
            qiBloodFluids.add('Heart Blood Deficiency');
        }
    }
    
    // Emotional State
    if (interrogations.emotions) {
        if (interrogations.emotions.primary_emotion === 'anxious' || interrogations.emotions.primary_emotion === 'worried') {
            affectedOrgans.add('Spleen');
            affectedOrgans.add('Heart');
            qiBloodFluids.add('Qi Stagnation');
            clinicalManifestations.push('Anxiety affects Heart and Spleen');
        } else if (interrogations.emotions.primary_emotion === 'irritable' || interrogations.emotions.primary_emotion === 'angry') {
            affectedOrgans.add('Liver');
            qiBloodFluids.add('Liver Qi Stagnation');
            clinicalManifestations.push('Irritability indicates Liver Qi stagnation');
        } else if (interrogations.emotions.primary_emotion === 'sad' || interrogations.emotions.primary_emotion === 'depressed') {
            affectedOrgans.add('Lung');
            affectedOrgans.add('Heart');
            qiBloodFluids.add('Qi Stagnation');
        } else if (interrogations.emotions.primary_emotion === 'fearful') {
            affectedOrgans.add('Kidney');
            scores.deficiency += 10;
        }
    }
    
    // Urination
    if (interrogations.urination) {
        if (interrogations.urination.frequency === 'frequent') {
            if (interrogations.urination.color === 'clear' || interrogations.urination.color === 'pale') {
                scores.cold += 20;
                scores.deficiency += 20;
                scores.yang -= 25;
                affectedOrgans.add('Kidney');
                qiBloodFluids.add('Kidney Yang Deficiency');
                clinicalManifestations.push('Frequent clear urination indicates Kidney Yang deficiency');
            } else if (interrogations.urination.color === 'dark') {
                scores.hot += 15;
                pathogenicFactors.add('Damp-Heat');
            }
        } else if (interrogations.urination.frequency === 'scanty') {
            qiBloodFluids.add('Fluid Deficiency');
            if (interrogations.urination.color === 'dark') {
                scores.hot += 20;
            }
        }
    }
    
    // Pain Analysis
    if (interrogations.pain) {
        if (interrogations.pain.location && interrogations.pain.location.length > 0) {
            if (interrogations.pain.quality === 'dull' || interrogations.pain.quality === 'heavy') {
                scores.deficiency += 15;
                qiBloodFluids.add('Qi Deficiency');
            } else if (interrogations.pain.quality === 'sharp' || interrogations.pain.quality === 'stabbing') {
                qiBloodFluids.add('Blood Stasis');
                qiBloodFluids.add('Qi Stagnation');
            } else if (interrogations.pain.quality === 'distending') {
                qiBloodFluids.add('Qi Stagnation');
            }
            
            if (interrogations.pain.temperature_effect === 'better_with_warmth') {
                scores.cold += 15;
            } else if (interrogations.pain.temperature_effect === 'better_with_cold') {
                scores.hot += 15;
            }
        }
    }
    
    // Chief Complaint Integration
    if (chiefComplaint) {
        reasoningNotes.push(`Chief Concern: ${chiefComplaint.primary_concern || 'Not specified'}`);
        if (chiefComplaint.western_conditions) {
            reasoningNotes.push(`Western Diagnosis Context: ${chiefComplaint.western_conditions}`);
        }
    }
    
    // ===== DETERMINE EIGHT PRINCIPLES =====
    const eightPrinciples = determineEightPrinciples(scores);
    
    return {
        eight_principles: eightPrinciples,
        affected_organs: Array.from(affectedOrgans).sort(),
        pathogenic_factors: Array.from(pathogenicFactors).sort(),
        qi_blood_fluids: Array.from(qiBloodFluids).sort(),
        clinical_manifestations: clinicalManifestations,
        reasoning_notes: reasoningNotes,
        diagnostic_confidence: calculateConfidence(scores, observations, interrogations)
    };
}

function determineEightPrinciples(scores) {
    // Interior vs Exterior
    let interiorExterior = 'neutral';
    const ieDiff = Math.abs(scores.interior - scores.exterior);
    if (ieDiff > 15) {
        interiorExterior = scores.interior > scores.exterior ? 'interior' : 'exterior';
    }
    
    // Hot vs Cold
    let hotCold = 'neutral';
    const hcDiff = Math.abs(scores.hot - scores.cold);
    if (hcDiff > 20) {
        hotCold = scores.hot > scores.cold ? 'hot' : 'cold';
    } else if (hcDiff > 10) {
        hotCold = scores.hot > scores.cold ? 'warm' : 'cool';
    }
    
    // Excess vs Deficiency
    let excessDeficiency = 'neutral';
    const edDiff = Math.abs(scores.excess - scores.deficiency);
    if (edDiff > 20) {
        excessDeficiency = scores.excess > scores.deficiency ? 'excess' : 'deficiency';
    } else if (edDiff > 10) {
        excessDeficiency = scores.excess > scores.deficiency ? 'mild_excess' : 'mild_deficiency';
    }
    
    // Yin vs Yang (synthesized from other principles)
    let yinYang = 'neutral';
    const yinYangScore = scores.yin + scores.yang;
    
    // Complex Yin-Yang determination
    if (hotCold === 'hot' && excessDeficiency === 'excess') {
        yinYang = 'yang_excess';
    } else if (hotCold === 'cold' && excessDeficiency === 'deficiency') {
        yinYang = 'yang_deficiency';
    } else if (hotCold === 'hot' && excessDeficiency === 'deficiency') {
        yinYang = 'yin_deficiency';
    } else if (hotCold === 'cold' && excessDeficiency === 'excess') {
        yinYang = 'yin_excess';
    } else if (yinYangScore < -20) {
        yinYang = 'yin_deficiency';
    } else if (yinYangScore > 20) {
        yinYang = 'yang_deficiency';
    }
    
    return {
        interior_exterior: interiorExterior,
        hot_cold: hotCold,
        excess_deficiency: excessDeficiency,
        yin_yang: yinYang
    };
}

function calculateConfidence(scores, observations, interrogations) {
    // Calculate confidence based on data completeness and score strength
    const obsCount = Object.keys(observations).length;
    const intCount = Object.keys(interrogations).length;
    const totalData = obsCount + intCount;
    
    // Data completeness factor (0-50)
    const completeness = Math.min((totalData / 24) * 50, 50);
    
    // Score strength factor (0-50)
    const totalScore = Math.abs(scores.hot - scores.cold) + 
                      Math.abs(scores.excess - scores.deficiency) +
                      Math.abs(scores.interior - scores.exterior);
    const strength = Math.min((totalScore / 200) * 50, 50);
    
    return Math.round(completeness + strength);
}
