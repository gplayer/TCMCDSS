// Chief Complaints API - Cloudflare Pages Functions

export async function onRequestGet(context) {
    const { params, env } = context;
    const visitId = params.visitId;
    
    try {
        const row = await env.DB.prepare(
            'SELECT * FROM chief_complaints WHERE visit_id = ?'
        ).bind(visitId).first();
        
        if (!row) {
            return new Response(JSON.stringify({ chief_complaint: null }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ 
            chief_complaint: {
                western_conditions: row.western_conditions,
                primary_concern: row.primary_concern,
                recent_symptoms: row.recent_symptoms,
                updated_at: row.updated_at
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { params, request, env } = context;
    const visitId = params.visitId;
    
    try {
        const data = await request.json();
        const now = new Date().toISOString();
        
        // Use REPLACE to insert or update
        await env.DB.prepare(
            `INSERT OR REPLACE INTO chief_complaints (visit_id, western_conditions, primary_concern, recent_symptoms, created_at, updated_at)
             VALUES (?, ?, ?, ?, COALESCE((SELECT created_at FROM chief_complaints WHERE visit_id = ?), ?), ?)`
        ).bind(
            visitId,
            data.western_conditions || '',
            data.primary_concern || '',
            data.recent_symptoms || '',
            visitId,
            now,
            now
        ).run();
        
        return new Response(JSON.stringify({ message: 'Chief complaint saved successfully' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
