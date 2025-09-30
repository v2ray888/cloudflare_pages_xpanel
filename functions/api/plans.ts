// functions/api/plans.ts

/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

// Handle OPTIONS for CORS
export const onRequestOptions: PagesFunction<Env> = async ({ request }) => {
  const origin = request.headers.get('Origin');
  
  // 在开发环境中允许所有源，在生产环境中可以更严格
  const isDev = origin && (
    origin.startsWith('http://localhost:') || 
    origin.startsWith('http://127.0.0.1:') ||
    origin.endsWith('.pages.dev')
  );
  
  const allowedOrigin = isDev ? origin : '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// GET /api/plans - Get all public plans (for users)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context;

    // Check if the DB binding exists
    if (!env.DB) {
      const errorResponse = {
        success: false,
        message: 'Database binding (DB) not found. Please check Cloudflare Pages project settings.',
        internal_error_code: 'EDB_BINDING_NOT_FOUND'
      };
      // 获取请求来源
      const origin = context.request.headers.get('Origin');
      
      // 在开发环境中允许所有源，在生产环境中可以更严格
      const isDev = origin && (
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.pages.dev')
      );
      
      const allowedOrigin = isDev ? origin : '*';
      
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    // The most direct and simple query possible
    const query = 'SELECT * FROM plans WHERE is_active = 1 ORDER BY sort_order DESC, id DESC;';
    
    const { results } = await env.DB.prepare(query).all();
    
    // Parse JSON fields
    const parsedResults = results.map((plan: any) => ({
      ...plan,
      features: plan.features ? JSON.parse(plan.features) : []
    }));

    // 获取请求来源
    const origin = context.request.headers.get('Origin');
    
    // 在开发环境中允许所有源，在生产环境中可以更严格
    const isDev = origin && (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.pages.dev')
    );
    
    const allowedOrigin = isDev ? origin : '*';
    
    return new Response(JSON.stringify({ success: true, data: parsedResults || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': allowedOrigin },
    });

  } catch (error: any) {
    // Catch any error and return it in the response for debugging
    const errorResponse = {
      success: false,
      message: 'A server error occurred while fetching plans.',
      error: {
        message: error.message,
        stack: error.stack,
        cause: error.cause ? String(error.cause) : 'N/A',
      },
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

// Block any other method
export const onRequest: PagesFunction<Env> = async ({ request }) => {
    if (request.method !== 'GET' && request.method !== 'OPTIONS') {
        // 获取请求来源
        const origin = request.headers.get('Origin');
        
        // 在开发环境中允许所有源，在生产环境中可以更严格
        const isDev = origin && (
          origin.startsWith('http://localhost:') || 
          origin.startsWith('http://127.0.0.1:') ||
          origin.endsWith('.pages.dev')
        );
        
        const allowedOrigin = isDev ? origin : '*';
        
        return new Response(`Method ${request.method} not allowed.`, { 
            status: 405,
            headers: { 'Access-Control-Allow-Origin': allowedOrigin }
        });
    }
    // 获取请求来源
    const origin = request.headers.get('Origin');
    
    // 在开发环境中允许所有源，在生产环境中可以更严格
    const isDev = origin && (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.pages.dev')
    );
    
    const allowedOrigin = isDev ? origin : '*';
    
    // This should not be reached if GET and OPTIONS are handled above.
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': allowedOrigin } });
}