// functions/api/redemption/redeem.ts
import { z } from 'zod';

const redeemSchema = z.object({
  code: z.string().min(1, '请输入兑换码'),
  email: z.string().email('请输入有效的邮箱地址').optional(),
});

// CORS preflight response
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

// POST /api/redemption/redeem - Redeem a code
export const onRequestPost = async ({ request, env }: { request: Request, env: any }) => {
  try {
    const body = await request.json();
    const { code, email } = redeemSchema.parse(body);

    // Check if code exists and is valid
    const redemptionCode = await env.DB.prepare(`
      SELECT rc.*, p.name as plan_name, p.duration_days, p.traffic_gb, p.device_limit
      FROM redemption_codes rc
      JOIN plans p ON rc.plan_id = p.id
      WHERE rc.code = ?
    `).bind(code).first();

    if (!redemptionCode) {
      return new Response(JSON.stringify({ success: false, message: '兑换码不存在' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (redemptionCode.status !== 0) {
      return new Response(JSON.stringify({ success: false, message: '兑换码已被使用或已过期' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Check if code is expired
    if (redemptionCode.expires_at && new Date(redemptionCode.expires_at) < new Date()) {
      // Mark as expired
      await env.DB.prepare('UPDATE redemption_codes SET status = 2 WHERE id = ?')
        .bind(redemptionCode.id).run();
      
      return new Response(JSON.stringify({ success: false, message: '兑换码已过期' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    let userId = null;

    // If user is logged in, get user ID from token
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { verify } = await import('hono/jwt');
      
      try {
        const payload = await verify(token, env.JWT_SECRET) as any;
        userId = payload.id;
      } catch (error) {
        // Token is invalid, but we can still proceed with email
      }
    }

    // If no user ID and no email provided, return error
    if (!userId && !email) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '请登录或提供邮箱地址' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // If email provided but no user ID, find or create user
    if (!userId && email) {
      const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(email).first();
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '邮箱未注册，请先注册账户' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    // Start transaction-like operations
    try {
      // Mark redemption code as used
      const updateCodeResult = await env.DB.prepare(`
        UPDATE redemption_codes 
        SET status = 1, used_by = ?, used_at = datetime('now') 
        WHERE id = ? AND status = 0
      `).bind(userId, redemptionCode.id).run();

      if (!updateCodeResult.success || updateCodeResult.changes === 0) {
        throw new Error('兑换码已被使用');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + redemptionCode.duration_days * 24 * 60 * 60 * 1000);
      const trafficBytes = redemptionCode.traffic_gb * 1024 * 1024 * 1024;

      // Create or extend user subscription
      const existingSubscription = await env.DB.prepare(`
        SELECT * FROM user_subscriptions 
        WHERE user_id = ? AND status = 1 AND end_date > datetime('now')
        ORDER BY end_date DESC LIMIT 1
      `).bind(userId).first();

      if (existingSubscription) {
        // Extend existing subscription
        const newEndDate = new Date(Math.max(new Date(existingSubscription.end_date).getTime(), startDate.getTime()) + redemptionCode.duration_days * 24 * 60 * 60 * 1000);
        const newTrafficTotal = existingSubscription.traffic_total + trafficBytes;

        await env.DB.prepare(`
          UPDATE user_subscriptions 
          SET end_date = ?, traffic_total = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(newEndDate.toISOString(), newTrafficTotal, existingSubscription.id).run();
      } else {
        // Create new subscription
        await env.DB.prepare(`
          INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, traffic_used, traffic_total, device_limit, created_at, updated_at)
          VALUES (?, ?, 1, ?, ?, 0, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          userId,
          redemptionCode.plan_id,
          startDate.toISOString(),
          endDate.toISOString(),
          trafficBytes,
          redemptionCode.device_limit
        ).run();
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: '兑换成功！套餐已激活',
        data: {
          plan_name: redemptionCode.plan_name,
          duration_days: redemptionCode.duration_days,
          traffic_gb: redemptionCode.traffic_gb,
          device_limit: redemptionCode.device_limit
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });

    } catch (error) {
      // Rollback: mark code as unused if subscription creation failed
      await env.DB.prepare(`
        UPDATE redemption_codes 
        SET status = 0, used_by = NULL, used_at = NULL 
        WHERE id = ?
      `).bind(redemptionCode.id).run();
      
      throw error;
    }

  } catch (error: any) {
    let errorMessage = '兑换失败';
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