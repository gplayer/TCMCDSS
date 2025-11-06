// Patient Visits API - Cloudflare Pages Functions

export async function onRequestGet(context) {
    const { params, env } = context;
    const patientId = params.id;
    
    try {
        const { results } = await env.DB.prepare(
            'SELECT * FROM visits WHERE patient_id = ? ORDER BY visit_date DESC'
        ).bind(patientId).all();
        
        return new Response(JSON.stringify({ visits: results }), {
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
    const patientId = params.id;
    
    try {
        const data = await request.json();
        const now = new Date().toISOString();
        
        const result = await env.DB.prepare(
            `INSERT INTO visits (patient_id, visit_date, chief_complaint, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
            patientId,
            now,
            data.chief_complaint || '',
            'in_progress',
            now,
            now
        ).run();
        
        return new Response(JSON.stringify({ 
            message: 'Visit created successfully',
            visit_id: result.meta.last_row_id
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
