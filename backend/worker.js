// Cloudflare Worker for Python Flask backend
// This will proxy requests to the Flask API

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // For now, return a message - full implementation would use Cloudflare Workers + Durable Objects
    // or deploy backend separately
    if (url.pathname.startsWith('/api')) {
      return new Response(JSON.stringify({
        message: 'API endpoint - Backend needs to be deployed separately or use Cloudflare Workers for Platforms'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Serve frontend files
    return env.ASSETS.fetch(request);
  }
}
