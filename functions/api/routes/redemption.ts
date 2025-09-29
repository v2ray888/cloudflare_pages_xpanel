import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { generateRedemptionCode } from '../../utils/generators';
import { verify } from 'hono/jwt';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
}

// 定义数据库记录的类型
type RedemptionCode = {
  id: number;
  code: string;
  plan_id: number;
  duration_days: number;
  traffic_gb: number;
  device_limit: number;
  status: number;
  used_by: number | null;
  used_at: string | null;
  expires_at: string | null;
  note: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  plan_name: string;
}

type UserSubscription = {
  id: number;
  user_id: number;
  plan_id: number;
  status: number;
  start_date: string;
  end_date: string;
  traffic_used: number;
  traffic_total: number;
  device_limit: number;
  created_at: string;
  updated_at: string;
}

const app = new Hono<{ Bindings: Bindings }>()

const createRedemptionCodeSchema = z.object({
  plan_id: z.number().int().positive().optional(),
  quantity: z.number().int().positive().max(100, '单次最多生成100个'),
  prefix: z.string().optional(),
  expires_at: z.string().optional(),
})

// Redeem a code
app.post('/redeem', async (c) => {
  try {
    const body = await c.req.json();
    const { code, email } = body;

    if (!code) {
      throw new HTTPException(400, { message: '请输入兑换码' });
    }

    // Check if code exists and is valid
    const redemptionCode = await c.env.DB.prepare(`
      SELECT rc.*, p.name as plan_name, p.duration_days, p.traffic_gb, p.device_limit
      FROM redemption_codes rc
      JOIN plans p ON rc.plan_id = p.id
      WHERE rc.code = ?
    `).bind(code).first<RedemptionCode>();

    if (!redemptionCode) {
      throw new HTTPException(400, { message: '兑换码不存在' });
    }

    // Check if code is already used
    if (redemptionCode.status !== 0) {
      // If code is already used, check if it was used by the same user (identified by email)
      if (email) {
        const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
          .bind(email).first();
        
        if (user && redemptionCode.used_by === user.id) {
          // Same user trying to redeem again, return success with info
          return c.json({ 
            success: true, 
            message: '兑换成功！套餐已激活',
            data: {
              plan_name: redemptionCode.plan_name,
              duration_days: redemptionCode.duration_days,
              traffic_gb: redemptionCode.traffic_gb,
              device_limit: redemptionCode.device_limit
            },
            already_redeemed: true
          }, 200);
        }
      }
      throw new HTTPException(400, { message: '兑换码已被使用或已过期' });
    }

    // Check if code is expired
    if (redemptionCode.expires_at && new Date(redemptionCode.expires_at) < new Date()) {
      // Mark as expired
      await c.env.DB.prepare('UPDATE redemption_codes SET status = 2 WHERE id = ?')
        .bind(redemptionCode.id).run();
      
      throw new HTTPException(400, { message: '兑换码已过期' });
    }

    let userId = null;

    // If user is logged in, get user ID from token
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const payload = await verify(token, c.env.JWT_SECRET);
        userId = (payload as any).id;
      } catch (error) {
        // Token is invalid, but we can still proceed with email
      }
    }

    // If no user ID and no email provided, return error
    if (!userId && !email) {
      throw new HTTPException(400, { message: '请登录或提供邮箱地址' });
    }

    // If email provided but no user ID, find or create user
    if (!userId && email) {
      const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(email).first();
      
      if (!existingUser) {
        throw new HTTPException(400, { message: '邮箱未注册，请先注册账户' });
      }
      userId = existingUser.id;
    }

    // Start transaction-like operations
    try {
      // Mark redemption code as used
      const updateCodeResult: any = await c.env.DB.prepare(`
        UPDATE redemption_codes 
        SET status = 1, used_by = ?, used_at = datetime('now') 
        WHERE id = ? AND status = 0
      `).bind(userId, redemptionCode.id).run();

      if (!updateCodeResult.success || updateCodeResult.meta.changes === 0) {
        throw new Error('兑换码已被使用');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + redemptionCode.duration_days * 24 * 60 * 60 * 1000);
      const trafficBytes = redemptionCode.traffic_gb * 1024 * 1024 * 1024;

      // Create or extend user subscription
      const existingSubscription = await c.env.DB.prepare(`
        SELECT * FROM user_subscriptions 
        WHERE user_id = ? AND status = 1 AND end_date > datetime('now')
        ORDER BY end_date DESC LIMIT 1
      `).bind(userId).first<UserSubscription>();

      if (existingSubscription) {
        // Extend existing subscription
        const newEndDate = new Date(Math.max(new Date(existingSubscription.end_date).getTime(), startDate.getTime()) + redemptionCode.duration_days * 24 * 60 * 60 * 1000);
        const newTrafficTotal = existingSubscription.traffic_total + trafficBytes;

        await c.env.DB.prepare(`
          UPDATE user_subscriptions 
          SET end_date = ?, traffic_total = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(newEndDate.toISOString(), newTrafficTotal, existingSubscription.id).run();
      } else {
        // Create new subscription
        await c.env.DB.prepare(`
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

      return c.json({ 
        success: true, 
        message: '兑换成功！套餐已激活',
        data: {
          plan_name: redemptionCode.plan_name,
          duration_days: redemptionCode.duration_days,
          traffic_gb: redemptionCode.traffic_gb,
          device_limit: redemptionCode.device_limit
        }
      }, 200);

    } catch (error) {
      // Rollback: mark code as unused if subscription creation failed
      await c.env.DB.prepare(`
        UPDATE redemption_codes 
        SET status = 0, used_by = NULL, used_at = NULL 
        WHERE id = ?
      `).bind(redemptionCode.id).run();
      
      throw error;
    }

  } catch (error: any) {
    console.error('Redeem code error:', error);
    let errorMessage = '兑换失败';
    let statusCode = 500;

    if (error instanceof HTTPException) {
      errorMessage = error.message;
      statusCode = error.status;
    } else if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(e => e.message).join(', ');
      statusCode = 400;
    } else {
      errorMessage = error.message || 'An unknown error occurred';
    }

    try {
      c.status(statusCode as any);
    } catch (e) {
      // 如果状态码设置失败，使用默认的500错误
      c.status(500);
    }
    return c.json({ success: false, message: errorMessage });

  }
});

// Create redemption codes (admin only)
app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { plan_id, quantity, prefix, expires_at } = createRedemptionCodeSchema.parse(body)

    if (!plan_id) {
      throw new HTTPException(400, { message: '请选择套餐' })
    }

    const codes = []
    const payload = c.get('jwtPayload')

    for (let i = 0; i < quantity; i++) {
      // 如果提供了前缀，则在生成的代码前加上前缀
      let code = generateRedemptionCode();
      if (prefix) {
        code = prefix + code;
      }
      codes.push(code);

      await c.env.DB.prepare(`
        INSERT INTO redemption_codes (
          code, plan_id, expires_at, 
          created_by, status, created_at
        ) VALUES (?, ?, ?, ?, 0, datetime('now'))
      `).bind(
        code,
        plan_id,
        expires_at || null,
        payload.id
      ).run()
    }

    return c.json({
      success: true,
      message: `成功生成 ${quantity} 个兑换码`,
      data: { codes },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: error.errors[0].message })
    }
    console.error('Create redemption codes error:', error)
    throw new HTTPException(500, { message: '生成兑换码失败' })
  }
})

// Get redemption codes with pagination (admin only)
app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const status = c.req.query('status')
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params = []

    if (status !== undefined && status !== '') {
      whereClause += ' AND rc.status = ?'
      params.push(parseInt(status))
    }

    const codes = await c.env.DB.prepare(`
      SELECT rc.*, p.name as plan_name, u.email as used_by_email,
             creator.email as created_by_email
      FROM redemption_codes rc
      LEFT JOIN plans p ON rc.plan_id = p.id
      LEFT JOIN users u ON rc.used_by = u.id
      LEFT JOIN users creator ON rc.created_by = creator.id
      ${whereClause}
      ORDER BY rc.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all()

    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM redemption_codes rc ${whereClause}
    `).bind(...params).first()

    return c.json({
      success: true,
      data: codes.results,
      total: (countResult?.total as number) || 0,
      page,
      limit,
    })
  } catch (error: any) {
    console.error('Get redemption codes error:', error)
    throw new HTTPException(500, { message: '获取兑换码列表失败' })
  }
})

// Delete redemption code (admin only)
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const code = await c.env.DB.prepare(
      'SELECT status FROM redemption_codes WHERE id = ?'
    ).bind(id).first()

    if (!code) {
      throw new HTTPException(404, { message: '兑换码不存在' })
    }

    if (code.status === 1) {
      throw new HTTPException(400, { message: '已使用的兑换码不能删除' })
    }

    await c.env.DB.prepare(
      'DELETE FROM redemption_codes WHERE id = ?'
    ).bind(id).run()

    return c.json({
      success: true,
      message: '兑换码已删除',
    })
  } catch (error: any) {
    console.error('Delete redemption code error:', error)
    throw new HTTPException(500, { message: '删除兑换码失败' })
  }
})

export { app as redemptionRoutes }