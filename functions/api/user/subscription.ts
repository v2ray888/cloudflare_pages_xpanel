// functions/api/user/subscription.ts

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

// GET /api/user/subscription - Get user's current subscription
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

    // Get user's current subscription with plan details
    const subscription = await env.DB.prepare(`
      SELECT 
        us.*,
        p.name as plan_name,
        p.description as plan_description,
        p.price as plan_price,
        p.duration_days as plan_duration_days,
        p.traffic_gb as plan_traffic_gb,
        p.device_limit as plan_device_limit,
        p.features as plan_features
      FROM user_subscriptions us
      JOIN plans p ON us.plan_id = p.id
      WHERE us.user_id = ? AND us.status = 1
      ORDER BY us.end_date DESC
      LIMIT 1
    `).bind(userId).first();

    if (!subscription) {
      return new Response(JSON.stringify({ 
        success: true, 
        data: null,
        message: '您还没有有效的订阅' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Parse plan features if it's a JSON string
    if (subscription.plan_features && typeof subscription.plan_features === 'string') {
      try {
        subscription.plan_features = JSON.parse(subscription.plan_features);
      } catch (e) {
        subscription.plan_features = [];
      }
    }

    // Calculate usage percentage
    const usagePercentage = subscription.traffic_total > 0 
      ? Math.round((subscription.traffic_used / subscription.traffic_total) * 100)
      : 0;

    // Check if subscription is expired
    const isExpired = new Date(subscription.end_date) < new Date();
    
    // Calculate days remaining
    const daysRemaining = Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    const subscriptionData = {
      ...subscription,
      usage_percentage: usagePercentage,
      is_expired: isExpired,
      days_remaining: daysRemaining,
      traffic_used_gb: Math.round(subscription.traffic_used / (1024 * 1024 * 1024) * 100) / 100,
      traffic_total_gb: Math.round(subscription.traffic_total / (1024 * 1024 * 1024) * 100) / 100,
    };

    return new Response(JSON.stringify({ 
      success: true, 
      data: subscriptionData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: '获取订阅信息失败', 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};