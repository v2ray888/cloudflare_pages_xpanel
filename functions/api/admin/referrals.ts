import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Get referral commissions with pagination (Admin)
app.get('/commissions', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const status = c.req.query('status')
    const search = c.req.query('search') || ''
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (status !== undefined && status !== null && status !== '') {
      whereClause += ' AND rc.status = ?'
      params.push(parseInt(status))
    }

    if (search) {
      whereClause += ' AND (u.email LIKE ? OR u.username LIKE ? OR o.order_no LIKE ?)'
      params.push(`%${search}%`)
      params.push(`%${search}%`)
      params.push(`%${search}%`)
    }

    const commissions = await c.env.DB.prepare(`
      SELECT rc.*, u.email as referrer_email, u2.email as referee_email, o.order_no
      FROM referral_commissions rc
      LEFT JOIN users u ON rc.referrer_id = u.id
      LEFT JOIN users u2 ON rc.referee_id = u2.id
      LEFT JOIN orders o ON rc.order_id = o.id
      ${whereClause}
      ORDER BY rc.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all()

    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM referral_commissions rc
      LEFT JOIN users u ON rc.referrer_id = u.id
      LEFT JOIN users u2 ON rc.referee_id = u2.id
      LEFT JOIN orders o ON rc.order_id = o.id
      ${whereClause}
    `).bind(...params).first()

    return c.json({
      success: true,
      data: commissions.results,
      total: (countResult?.total as number) || 0,
      page,
      limit,
    })
  } catch (error: any) {
    console.error('Get referral commissions error:', error)
    throw new HTTPException(500, { message: '获取佣金记录失败: ' + (error.message || '未知错误') })
  }
})

// Settle referral commission (Admin)
app.post('/commissions/:id/settle', async (c) => {
  try {
    const id = c.req.param('id')

    // Get commission details
    const commission = await c.env.DB.prepare(
      'SELECT * FROM referral_commissions WHERE id = ? AND status = 0'
    ).bind(id).first()

    if (!commission) {
      throw new HTTPException(404, { message: '佣金记录不存在或已结算' })
    }

    // Start transaction
    const tx = await c.env.DB.batch([
      // Update commission status
      c.env.DB.prepare(
        'UPDATE referral_commissions SET status = 1, settled_at = datetime("now") WHERE id = ?'
      ).bind(id),
      
      // Update user's commission balance
      c.env.DB.prepare(
        'UPDATE users SET commission_balance = commission_balance + ? WHERE id = ?'
      ).bind(commission.commission_amount, commission.referrer_id)
    ])

    if (!tx[0].success || !tx[1].success) {
      throw new HTTPException(500, { message: '结算佣金失败' })
    }

    return c.json({
      success: true,
      message: '佣金结算成功',
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Settle referral commission error:', error)
    throw new HTTPException(500, { message: '结算佣金失败: ' + (error.message || '未知错误') })
  }
})

// Get referral settings (Admin)
app.get('/settings', async (c) => {
  try {
    // Get referral settings from settings table
    const settings = await c.env.DB.prepare(`
      SELECT key, value FROM settings 
      WHERE key IN ('referral_commission_rate', 'referral_min_withdrawal')
    `).all()

    const settingsMap: Record<string, string> = {}
    settings.results.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value
    })

    return c.json({
      success: true,
      data: {
        commission_rate: parseFloat(settingsMap['referral_commission_rate'] || '0.1'),
        min_withdrawal: parseFloat(settingsMap['referral_min_withdrawal'] || '100'),
      },
    })
  } catch (error: any) {
    console.error('Get referral settings error:', error)
    throw new HTTPException(500, { message: '获取推广设置失败: ' + (error.message || '未知错误') })
  }
})

// Update referral settings (Admin)
app.put('/settings', async (c) => {
  try {
    const body = await c.req.json()
    const { commission_rate, min_withdrawal } = body

    // Validate input
    if (commission_rate === undefined || min_withdrawal === undefined) {
      throw new HTTPException(400, { message: '请提供完整的设置参数' })
    }

    if (commission_rate < 0 || commission_rate > 1) {
      throw new HTTPException(400, { message: '佣金比例必须在0-1之间' })
    }

    if (min_withdrawal < 0) {
      throw new HTTPException(400, { message: '最低提现金额不能为负数' })
    }

    // Update settings
    await c.env.DB.batch([
      c.env.DB.prepare(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
      ).bind('referral_commission_rate', commission_rate.toString()),
      
      c.env.DB.prepare(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
      ).bind('referral_min_withdrawal', min_withdrawal.toString())
    ])

    return c.json({
      success: true,
      message: '推广设置更新成功',
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Update referral settings error:', error)
    throw new HTTPException(500, { message: '更新推广设置失败: ' + (error.message || '未知错误') })
  }
})

export { app as referralAdminRoutes }