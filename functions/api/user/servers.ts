// functions/api/user/servers.ts

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

// GET /api/user/servers - Get servers available to user
export const onRequestGet = async ({ request, env }: { request: Request, env: any }) => {
  try {
    // Get user from JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, message: '未提供授权令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const token = authHeader.substring(7);
    const { verify } = await import('hono/jwt');
    
    let userId;
    try {
      const payload = await verify(token, env.JWT_SECRET) as any;
      userId = payload.id;
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: '无效的授权令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check if user has active subscription
    const subscription = await env.DB.prepare(`
      SELECT us.*, p.name as plan_name
      FROM user_subscriptions us
      JOIN plans p ON us.plan_id = p.id
      WHERE us.user_id = ? AND us.status = 1 AND us.end_date > datetime('now')
      ORDER BY us.end_date DESC
      LIMIT 1
    `).bind(userId).first();

    if (!subscription) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '您没有有效的订阅，请先购买套餐' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Get all active servers with connection details for subscribed users
    const { results: servers } = await env.DB.prepare(`
      SELECT id, name, host, port, protocol, method, password, uuid, path, country, city, flag_emoji, load_balance
      FROM servers 
      WHERE is_active = 1
      ORDER BY load_balance DESC, name ASC
    `).all();

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        servers,
        subscription: {
          plan_name: subscription.plan_name,
          end_date: subscription.end_date,
          traffic_used: subscription.traffic_used,
          traffic_total: subscription.traffic_total,
          device_limit: subscription.device_limit
        }
      }
    }), {
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