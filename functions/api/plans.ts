// functions/api/plans.ts

/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

// Handle OPTIONS for CORS
export const onRequestOptions: PagesFunction<Env> = async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // The most direct and simple query possible
    const query = 'SELECT * FROM plans WHERE is_active = 1 AND is_public = 1 ORDER BY sort_order DESC, id DESC;';
    
    const { results } = await env.DB.prepare(query).all();

    return new Response(JSON.stringify({ success: true, data: results || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

// Block any other method
export const onRequest: PagesFunction<Env> = async ({ request }) => {
    if (request.method !== 'GET' && request.method !== 'OPTIONS') {
        return new Response(`Method ${request.method} not allowed.`, { 
            status: 405,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
    // This should not be reached if GET and OPTIONS are handled above.
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}
