import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { generateRedemptionCode } from '../utils/generators'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

const createRedemptionCodeSchema = z.object({
  plan_id: z.number().int().positive().optional(),
  duration_days: z.number().int().positive().optional(),
  quantity: z.number().int().positive().max(100, '单次最多生成100个'),
  expires_at: z.string().optional(),
  note: z.string().optional(),
})

// Create redemption codes (admin only)
app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { plan_id, duration_days, quantity, expires_at, note } = createRedemptionCodeSchema.parse(body)

    if (!plan_id && !duration_days) {
      throw new HTTPException(400, { message: '请选择套餐或指定天数' })
    }

    const codes = []
    const payload = c.get('jwtPayload')

    for (let i = 0; i < quantity; i++) {
      const code = generateRedemptionCode()
      codes.push(code)

      await c.env.DB.prepare(`
        INSERT INTO redemption_codes (
          code, plan_id, duration_days, expires_at, note, 
          created_by, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
      `).bind(
        code,
        plan_id || null,
        duration_days || null,
        expires_at || null,
        note || null,
        payload.id
      ).run()
    }

    return c.json({
      success: true,
      message: `成功生成 ${quantity} 个兑换码`,
      data: { codes },
    })
  } catch (error) {
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
      total: countResult.total,
      page,
      limit,
    })
  } catch (error) {
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
  } catch (error) {
    console.error('Delete redemption code error:', error)
    throw new HTTPException(500, { message: '删除兑换码失败' })
  }
})

export { app as redemptionRoutes }