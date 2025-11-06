// Individual Patient API - Cloudflare Pages Functions

export async function onRequestGet(context) {
    const { params, env } = context;
    const patientId = params.id;
    
    try {
        const patient = await env.DB.prepare(
            'SELECT * FROM patients WHERE id = ?'
        ).bind(patientId).first();
        
        if (!patient) {
            return new Response(JSON.stringify({ error: 'Patient not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ patient }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
