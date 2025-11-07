// Pattern Analysis API - Cloudflare Pages Functions
// Comprehensive pattern matching based on Maciocia's diagnostic framework
import { analyzePatterns } from '../comprehensive-analyzer.js';

export async function onRequestPost(context) {
    const { params, env } = context;
    const visitId = params.visitId;
    
    try {
        // Fetch all diagnostic data including chief complaint
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
        
        // Generate comprehensive pattern analysis with chief complaint context
        const patterns = await analyzePatterns(obsData, intData, chiefComplaint);
        
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
        console.error('Pattern analysis error:', error);
        return new Response(JSON.stringify({ 
            error: error.message,
            stack: error.stack 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
