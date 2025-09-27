import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${timestamp}${random}`
}

const createOrderSchema = z.object({
  plan_id: z.number().int().positive('请选择套餐'),
  coupon_code: z.string().optional(),
})

// Create order
app.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const body = await c.req.json()
    const { plan_id, coupon_code } = createOrderSchema.parse(body)

    // Get plan
    const plan = await c.env.DB.prepare(
      'SELECT * FROM plans WHERE id = ? AND is_active = 1'
    ).bind(plan_id).first<{ id: number, name: string, description: string, price: number, original_price: number, duration_days: number, traffic_gb: number, device_limit: number, features: string, sort_order: number, is_popular: number, is_active: number, created_at: string }>()

    if (!plan) {
      throw new HTTPException(404, { message: '套餐不存在' })
    }

    let discount_amount = 0
    let coupon_id: number | null = null

    // Apply coupon if provided
    if (coupon_code) {
      const coupon = await c.env.DB.prepare(`
        SELECT * FROM coupons
        WHERE code = ? AND status = 1
        AND (expires_at IS NULL OR expires_at > datetime('now'))
        AND (usage_limit IS NULL OR usage_count < usage_limit)
      `).bind(coupon_code).first<{ id: number, code: string, discount_type: 'percentage' | 'fixed', discount_value: number, usage_limit: number | null, usage_count: number, expires_at: string | null, status: number, created_at: string }>()

      if (coupon) {
        if (coupon.discount_type === 'percentage') {
          discount_amount = (plan.price * coupon.discount_value) / 100
        } else {
          discount_amount = coupon.discount_value
        }
        discount_amount = Math.min(discount_amount, plan.price)
        coupon_id = coupon.id
      }
    }

    const final_amount = plan.price - discount_amount
    const order_no = generateOrderNumber()

    // Create order
    const result = await c.env.DB.prepare(`
      INSERT INTO orders (
        user_id, plan_id, order_no, amount, discount_amount, final_amount,
        coupon_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `).bind(
      payload.id,
      plan_id,
      order_no,
      plan.price,
      discount_amount,
      final_amount,
      coupon_id
    ).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '创建订单失败' })
    }

    // Update coupon usage if used
    if (coupon_id) {
      await c.env.DB.prepare(
        'UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?'
      ).bind(coupon_id).run()
    }

    // Get created order with plan info
    const order = await c.env.DB.prepare(`
      SELECT o.*, p.name as plan_name
      FROM orders o
      LEFT JOIN plans p ON o.plan_id = p.id
      WHERE o.id = ?
    `).bind(result.meta.last_row_id).first()

    return c.json({
      success: true,
      message: '订单创建成功',
      data: order,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: error.errors[0].message })
    }
    console.error('Create order error:', error)
    throw new HTTPException(500, { message: '创建订单失败' })
  }
})

// Get order by id
app.get('/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const id = c.req.param('id')

    const order = await c.env.DB.prepare(`
      SELECT o.*, p.name as plan_name, p.duration_days, p.traffic_gb, p.device_limit
      FROM orders o
      LEFT JOIN plans p ON o.plan_id = p.id
      WHERE o.id = ? AND o.user_id = ?
    `).bind(id, payload.id).first()

    if (!order) {
      throw new HTTPException(404, { message: '订单不存在' })
    }

    return c.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Get order error:', error)
    throw new HTTPException(500, { message: '获取订单失败' })
  }
})

// Cancel order
app.put('/:id/cancel', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const id = c.req.param('id')

    // Get order
    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?'
    ).bind(id, payload.id).first()

    if (!order) {
      throw new HTTPException(404, { message: '订单不存在' })
    }

    if (order.status !== 0) {
      throw new HTTPException(400, { message: '只能取消待支付的订单' })
    }

    // Cancel order
    await c.env.DB.prepare(
      'UPDATE orders SET status = 2, updated_at = datetime("now") WHERE id = ?'
    ).bind(id).run()

    // Restore coupon usage if used
    if (order.coupon_id) {
      await c.env.DB.prepare(
        'UPDATE coupons SET usage_count = usage_count - 1 WHERE id = ?'
      ).bind(order.coupon_id).run()
    }

    return c.json({
      success: true,
      message: '订单已取消',
    })
  } catch (error) {
    console.error('Cancel order error:', error)
    throw new HTTPException(500, { message: '取消订单失败' })
  }
})

export { app as orderRoutes }