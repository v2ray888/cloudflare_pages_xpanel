import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

const withdrawalSchema = z.object({
  amount: z.number().min(100, '最低提现金额为100元'),
  payment_method: z.enum(['alipay', 'wechat', 'bank'], { message: '无效的支付方式' }),
  payment_account: z.string().min(1, '支付账户不能为空'),
  real_name: z.string().min(1, '真实姓名不能为空'),
})

// Submit withdrawal request
app.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const body = await c.req.json()
    const data = withdrawalSchema.parse(body)

    // Get user's commission balance
    const user = await c.env.DB.prepare(
      'SELECT commission_balance FROM users WHERE id = ?'
    ).bind(payload.id).first<{ commission_balance: number }>()

    if (!user || (user.commission_balance as number) < data.amount) {
      throw new HTTPException(400, { message: '余额不足' })
    }

    // Create withdrawal request
    const result = await c.env.DB.prepare(`
      INSERT INTO commission_withdrawals (
        user_id, amount, payment_method, payment_account, real_name,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `).bind(
      payload.id, 
      data.amount, 
      data.payment_method, 
      data.payment_account,
      data.real_name
    ).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '提现申请失败' })
    }

    // Freeze the commission balance
    await c.env.DB.prepare(
      'UPDATE users SET commission_balance = commission_balance - ? WHERE id = ?'
    ).bind(data.amount, payload.id).run()

    return c.json({
      success: true,
      message: '提现申请已提交，请等待审核',
      data: { id: result.meta.last_row_id }
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: error.errors[0].message })
    }
    console.error('Submit withdrawal error:', error)
    throw new HTTPException(500, { message: '提现申请失败' })
  }
})

// Get user's withdrawal history
app.get('/', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit

    const withdrawals = await c.env.DB.prepare(`
      SELECT id, amount, payment_method, payment_account, real_name,
             status, created_at, processed_at, admin_note
      FROM commission_withdrawals
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(payload.id, limit, offset).all()

    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM commission_withdrawals WHERE user_id = ?'
    ).bind(payload.id).first()

    return c.json({
      success: true,
      data: withdrawals.results,
      total: (countResult?.total as number) || 0,
      page,
      limit,
    })
  } catch (error: any) {
    console.error('Get withdrawals error:', error)
    throw new HTTPException(500, { message: '获取提现记录失败' })
  }
})

// Admin: Get all withdrawal requests
app.get('/admin', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const status = c.req.query('status')
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (status !== undefined && status !== null && status !== '') {
      whereClause += ' AND w.status = ?'
      params.push(parseInt(status))
    }

    const withdrawals = await c.env.DB.prepare(`
      SELECT w.*, u.email as user_email, u.username
      FROM commission_withdrawals w
      LEFT JOIN users u ON w.user_id = u.id
      ${whereClause}
      ORDER BY w.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all()

    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM commission_withdrawals w ${whereClause}
    `).bind(...params).first()

    return c.json({
      success: true,
      data: withdrawals.results,
      total: (countResult?.total as number) || 0,
      page,
      limit,
    })
  } catch (error: any) {
    console.error('Get admin withdrawals error:', error)
    throw new HTTPException(500, { message: '获取提现记录失败' })
  }
})

// Admin: Process withdrawal request
app.put('/admin/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { status, admin_note } = body

    if (![1, 2].includes(status)) {
      throw new HTTPException(400, { message: '无效的状态' })
    }

    // Get withdrawal request
    const withdrawal = await c.env.DB.prepare(
      'SELECT * FROM commission_withdrawals WHERE id = ?'
    ).bind(id).first<{
      id: number
      user_id: number
      amount: number
      status: number
    }>()

    if (!withdrawal) {
      throw new HTTPException(404, { message: '提现记录不存在' })
    }

    if (withdrawal.status !== 0) {
      throw new HTTPException(400, { message: '该提现请求已处理' })
    }

    // Update withdrawal status
    await c.env.DB.prepare(`
      UPDATE commission_withdrawals
      SET status = ?, admin_note = ?, processed_at = datetime('now')
      WHERE id = ?
    `).bind(status, admin_note || null, id).run()

    // If rejected, return the amount to user's balance
    if (status === 2) {
      await c.env.DB.prepare(
        'UPDATE users SET commission_balance = commission_balance + ? WHERE id = ?'
      ).bind(withdrawal.amount, withdrawal.user_id).run()
    }

    return c.json({
      success: true,
      message: status === 1 ? '提现已批准' : '提现已拒绝',
    })
  } catch (error: any) {
    console.error('Process withdrawal error:', error)
    throw new HTTPException(500, { message: '处理提现请求失败' })
  }
})

export { app as withdrawalRoutes }