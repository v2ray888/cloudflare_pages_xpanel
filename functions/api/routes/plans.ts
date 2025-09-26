import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Get all active plans
app.get('/', async (c) => {
  try {
    const plans = await c.env.DB.prepare(`
      SELECT id, name, description, price, duration_days, traffic_gb, device_limit, 
             features, sort_order, status, created_at
      FROM plans 
      WHERE status = 1 
      ORDER BY sort_order ASC, price ASC
    `).all()

    return c.json({
      success: true,
      data: plans.results.map(plan => ({
        ...plan,
        features: plan.features ? JSON.parse(plan.features) : [],
      })),
    })
  } catch (error) {
    console.error('Get plans error:', error)
    throw new HTTPException(500, { message: '获取套餐失败' })
  }
})

// Get plan by id
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const plan = await c.env.DB.prepare(`
      SELECT id, name, description, price, duration_days, traffic_gb, device_limit, 
             features, sort_order, status, created_at
      FROM plans 
      WHERE id = ? AND status = 1
    `).bind(id).first()

    if (!plan) {
      throw new HTTPException(404, { message: '套餐不存在' })
    }

    return c.json({
      success: true,
      data: {
        ...plan,
        features: plan.features ? JSON.parse(plan.features) : [],
      },
    })
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Get plan error:', error)
    throw new HTTPException(500, { message: '获取套餐失败' })
  }
})

export { app as planRoutes }