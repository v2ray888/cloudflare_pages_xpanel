// functions/api/servers.ts

// CORS preflight response
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

// GET /api/servers - Get all active servers (public)
export const onRequestGet = async ({ request, env }: { request: Request, env: any }) => {
  try {
    // Get all active servers
    const { results: servers } = await env.DB.prepare(`
      SELECT id, name, host, port, protocol, country, city, flag_emoji, load_balance, is_active
      FROM servers 
      WHERE is_active = 1
      ORDER BY load_balance DESC, name ASC
    `).all();

    return new Response(JSON.stringify({ success: true, data: servers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: '获取服务器列表失败', 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};