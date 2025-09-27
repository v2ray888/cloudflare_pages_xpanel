// functions/api/orders.ts
import { z } from 'zod';

const createOrderSchema = z.object({
  plan_id: z.number().int().positive('请选择有效的套餐'),
  payment_method: z.string().min(1, '请选择支付方式'),
});

// Generate order number
function generateOrderNo(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${timestamp}${random}`;
}

// CORS preflight response
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

// POST /api/orders - Create new order
export const onRequestPost = async ({ request, env }: { request: Request, env: any }) => {
  try {
    // Get user from JWT token (should be set by middleware)
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

    const body = await request.json();
    const { plan_id, payment_method } = createOrderSchema.parse(body);

    // Check if plan exists and is active
    const plan = await env.DB.prepare(
      'SELECT * FROM plans WHERE id = ? AND is_active = 1 AND is_public = 1'
    ).bind(plan_id).first();

    if (!plan) {
      return new Response(JSON.stringify({ success: false, message: '套餐不存在或已下架' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Generate order number
    const orderNo = generateOrderNo();
    
    // Calculate expiry time (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Create order
    const result = await env.DB.prepare(`
      INSERT INTO orders (order_no, user_id, plan_id, amount, discount_amount, final_amount, status, payment_method, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      orderNo,
      userId,
      plan_id,
      plan.price,
      0, // discount_amount
      plan.price, // final_amount
      0, // status: pending
      payment_method,
      expiresAt
    ).run();

    if (!result.success) {
      throw new Error('创建订单失败');
    }

    // Get created order with plan info
    const newOrder = await env.DB.prepare(`
      SELECT o.*, p.name as plan_name, p.description as plan_description, p.duration_days, p.traffic_gb
      FROM orders o
      JOIN plans p ON o.plan_id = p.id
      WHERE o.id = ?
    `).bind(result.meta.last_row_id).first();

    return new Response(JSON.stringify({ 
      success: true, 
      message: '订单创建成功', 
      data: newOrder 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error: any) {
    let errorMessage = '创建订单失败';
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(e => e.message).join(', ');
      statusCode = 400;
    } else {
      errorMessage = error.message || 'An unknown error occurred';
    }

    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};