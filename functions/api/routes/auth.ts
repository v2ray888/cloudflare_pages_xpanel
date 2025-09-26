import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateReferralCode, generateRedemptionCode } from '../utils/generators'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  username: z.string().min(2, '用户名至少2个字符').optional(),
  referral_code: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

const redeemSchema = z.object({
  code: z.string().min(1, '请输入兑换码'),
  email: z.string().email('请输入有效的邮箱地址').optional(),
})

// Register
app.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, username, referral_code } = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      throw new HTTPException(400, { message: '邮箱已被注册' })
    }

    // Validate referral code if provided
    let referrer_id = null
    if (referral_code) {
      const referrer = await c.env.DB.prepare(
        'SELECT id FROM users WHERE referral_code = ? AND status = 1'
      ).bind(referral_code).first()

      if (!referrer) {
        throw new HTTPException(400, { message: '推广码无效' })
      }
      referrer_id = referrer.id
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const userReferralCode = generateReferralCode()

    // Create user
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password, username, referral_code, referrer_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
    `).bind(
      email,
      hashedPassword,
      username || null,
      userReferralCode,
      referrer_id
    ).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '注册失败' })
    }

    // Get created user
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, referral_code, status, role, created_at FROM users WHERE id = ?'
    ).bind(result.meta.last_row_id).first()

    // Generate JWT token
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      c.env.JWT_SECRET
    )

    return c.json({
      success: true,
      message: '注册成功',
      data: {
        user,
        token,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: error.errors[0].message })
    }
    throw error
  }
})

// Login
app.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = loginSchema.parse(body)

    // Get user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      throw new HTTPException(400, { message: '邮箱或密码错误' })
    }

    if (user.status !== 1) {
      throw new HTTPException(400, { message: '账户已被禁用' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new HTTPException(400, { message: '邮箱或密码错误' })
    }

    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login_at = datetime("now") WHERE id = ?'
    ).bind(user.id).run()

    // Generate JWT token
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      c.env.JWT_SECRET
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return c.json({
      success: true,
      message: '登录成功',
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: error.errors[0].message })
    }
    throw error
  }
})

// Redeem code (no auth required)
app.post('/redeem', async (c) => {
  try {
    const body = await c.req.json()
    const { code, email } = redeemSchema.parse(body)

    // Get redemption code
    const redemptionCode = await c.env.DB.prepare(`
      SELECT rc.*, p.name as plan_name, p.duration_days, p.traffic_gb, p.device_limit
      FROM redemption_codes rc
      LEFT JOIN plans p ON rc.plan_id = p.id
      WHERE rc.code = ? AND rc.status = 0
    `).bind(code).first()

    if (!redemptionCode) {
      throw new HTTPException(400, { message: '兑换码无效或已使用' })
    }

    if (redemptionCode.expires_at && new Date(redemptionCode.expires_at) < new Date()) {
      throw new HTTPException(400, { message: '兑换码已过期' })
    }

    let user_id = null
    let created_user = false

    if (email) {
      // Check if user exists
      let user = await c.env.DB.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).bind(email).first()

      if (!user) {
        // Create temporary user
        const tempPassword = generateRedemptionCode(12)
        const hashedPassword = await bcrypt.hash(tempPassword, 10)
        const userReferralCode = generateReferralCode()

        const result = await c.env.DB.prepare(`
          INSERT INTO users (email, password, referral_code, status, created_at)
          VALUES (?, ?, ?, 1, datetime('now'))
        `).bind(email, hashedPassword, userReferralCode).run()

        if (!result.success) {
          throw new HTTPException(500, { message: '创建用户失败' })
        }

        user_id = result.meta.last_row_id
        created_user = true
      } else {
        user_id = user.id
      }
    }

    // Mark redemption code as used
    await c.env.DB.prepare(`
      UPDATE redemption_codes 
      SET status = 1, used_by = ?, used_at = datetime('now')
      WHERE id = ?
    `).bind(user_id, redemptionCode.id).run()

    if (user_id && redemptionCode.plan_id) {
      // Create subscription
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + redemptionCode.duration_days)

      await c.env.DB.prepare(`
        INSERT INTO subscriptions (user_id, plan_id, expires_at, traffic_used, status, created_at)
        VALUES (?, ?, ?, 0, 1, datetime('now'))
      `).bind(
        user_id,
        redemptionCode.plan_id,
        expiresAt.toISOString()
      ).run()
    }

    return c.json({
      success: true,
      message: '兑换成功',
      data: {
        plan_name: redemptionCode.plan_name,
        duration_days: redemptionCode.duration_days,
        traffic_gb: redemptionCode.traffic_gb,
        created_user,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: error.errors[0].message })
    }
    throw error
  }
})

// Verify token
app.get('/verify', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Token required' })
  }

  try {
    const token = authHeader.substring(7)
    const payload = await sign(token, c.env.JWT_SECRET)
    
    // Get fresh user data
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, referral_code, status, role, balance, commission_balance, created_at FROM users WHERE id = ?'
    ).bind(payload.id).first()

    if (!user || user.status !== 1) {
      throw new HTTPException(401, { message: 'Invalid token' })
    }

    return c.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    throw new HTTPException(401, { message: 'Invalid token' })
  }
})

export { app as authRoutes }