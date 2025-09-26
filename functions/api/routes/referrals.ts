import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Get referral stats
app.get('/stats', async (c) => {
  try {
    const payload = c.get('jwtPayload')

    // Get total referrals
    const totalReferralsResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users WHERE referrer_id = ?'
    ).bind(payload.id).first()

    // Get total commission
    const totalCommissionResult = await c.env.DB.prepare(
      'SELECT SUM(commission_amount) as total FROM referral_commissions WHERE referrer_id = ?'
    ).bind(payload.id).first()

    // Get monthly commission
    const monthlyCommissionResult = await c.env.DB.prepare(`
      SELECT SUM(commission_amount) as total 
      FROM referral_commissions 
      WHERE referrer_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).bind(payload.id).first()

    return c.json({
      success: true,
      data: {
        totalReferrals: totalReferralsResult.count || 0,
        totalCommission: totalCommissionResult.total || 0,
        monthlyCommission: monthlyCommissionResult.total || 0,
      },
    })
  } catch (error) {
    console.error('Get referral stats error:', error)
    throw new HTTPException(500, { message: '获取推广统计失败' })
  }
})

// Get referral commissions
app.get('/commissions', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit

    const commissions = await c.env.DB.prepare(`
      SELECT rc.*, u.email as referee_email, o.order_no
      FROM referral_commissions rc
      LEFT JOIN users u ON rc.referee_id = u.id
      LEFT JOIN orders o ON rc.order_id = o.id
      WHERE rc.referrer_id = ?
      ORDER BY rc.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(payload.id, limit, offset).all()

    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM referral_commissions WHERE referrer_id = ?'
    ).bind(payload.id).first()

    return c.json({
      success: true,
      data: commissions.results,
      total: countResult.total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Get referral commissions error:', error)
    throw new HTTPException(500, { message: '获取佣金记录失败' })
  }
})

// Get referred users
app.get('/users', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit

    const users = await c.env.DB.prepare(`
      SELECT id, email, username, status, created_at
      FROM users
      WHERE referrer_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(payload.id, limit, offset).all()

    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM users WHERE referrer_id = ?'
    ).bind(payload.id).first()

    return c.json({
      success: true,
      data: users.results,
      total: countResult.total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Get referred users error:', error)
    throw new HTTPException(500, { message: '获取推荐用户失败' })
  }
})

// Withdraw commission
app.post('/withdraw', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const body = await c.req.json()
    const { amount, payment_method, payment_account } = body

    if (!amount || amount < 100) {
      throw new HTTPException(400, { message: '最低提现金额为100元' })
    }

    // Get user's commission balance
    const user = await c.env.DB.prepare(
      'SELECT commission_balance FROM users WHERE id = ?'
    ).bind(payload.id).first()

    if (!user || user.commission_balance < amount) {
      throw new HTTPException(400, { message: '余额不足' })
    }

    // Create withdrawal request
    await c.env.DB.prepare(`
      INSERT INTO commission_withdrawals (
        user_id, amount, payment_method, payment_account, 
        status, created_at
      ) VALUES (?, ?, ?, ?, 0, datetime('now'))
    `).bind(payload.id, amount, payment_method, payment_account).run()

    // Update user's commission balance
    await c.env.DB.prepare(
      'UPDATE users SET commission_balance = commission_balance - ? WHERE id = ?'
    ).bind(amount, payload.id).run()

    return c.json({
      success: true,
      message: '提现申请已提交，请等待审核',
    })
  } catch (error) {
    console.error('Withdraw commission error:', error)
    throw new HTTPException(500, { message: '提现申请失败' })
  }
})

export { app as referralRoutes }