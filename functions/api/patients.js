// Patients API - Cloudflare Pages Functions
// Longenix Health TCM CDSS

export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        const { results } = await env.DB.prepare(
            'SELECT * FROM patients ORDER BY created_at DESC'
        ).all();
        
        return new Response(JSON.stringify({ patients: results }), {
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
    const { request, env } = context;
    
    try {
        const data = await request.json();
        const now = new Date().toISOString();
        
        const result = await env.DB.prepare(
            `INSERT INTO patients (name, date_of_birth, gender, phone, email, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            data.name,
            data.date_of_birth || null,
            data.gender || null,
            data.phone || null,
            data.email || null,
            now,
            now
        ).run();
        
        return new Response(JSON.stringify({ 
            message: 'Patient created successfully',
            patient_id: result.meta.last_row_id
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
