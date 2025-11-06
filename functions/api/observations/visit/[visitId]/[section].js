// Observation Section Save API - Cloudflare Pages Functions

export async function onRequestPost(context) {
    const { params, request, env } = context;
    const { visitId, section } = params;
    
    try {
        const requestData = await request.json();
        const now = new Date().toISOString();
        
        // Use REPLACE to insert or update
        await env.DB.prepare(
            `INSERT OR REPLACE INTO observations (visit_id, section, data, completed, created_at, updated_at)
             VALUES (?, ?, ?, ?, COALESCE((SELECT created_at FROM observations WHERE visit_id = ? AND section = ?), ?), ?)`
        ).bind(
            visitId,
            section,
            JSON.stringify(requestData.data || {}),
            requestData.completed ? 1 : 0,
            visitId,
            section,
            now,
            now
        ).run();
        
        return new Response(JSON.stringify({ message: 'Observation saved successfully' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestGet(context) {
    const { params, env } = context;
    const { visitId, section } = params;
    
    try {
        const row = await env.DB.prepare(
            'SELECT * FROM observations WHERE visit_id = ? AND section = ?'
        ).bind(visitId, section).first();
        
        if (!row) {
            return new Response(JSON.stringify({ observation: null }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ 
            observation: {
                data: JSON.parse(row.data),
                completed: Boolean(row.completed),
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
