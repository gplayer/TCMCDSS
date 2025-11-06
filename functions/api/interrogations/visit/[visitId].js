// Interrogations API - Cloudflare Pages Functions

export async function onRequestGet(context) {
    const { params, env } = context;
    const visitId = params.visitId;
    
    try {
        const { results } = await env.DB.prepare(
            'SELECT * FROM interrogations WHERE visit_id = ?'
        ).bind(visitId).all();
        
        // Transform to expected format
        const interrogations = {};
        results.forEach(row => {
            interrogations[row.section] = {
                data: JSON.parse(row.data),
                completed: Boolean(row.completed),
                updated_at: row.updated_at
            };
        });
        
        return new Response(JSON.stringify({ 
            interrogations,
            visit_id: parseInt(visitId)
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
