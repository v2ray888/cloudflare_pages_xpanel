import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

type Bindings = {
  DB: any
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

// Admin routes - get all plans (including inactive)
app.get('/admin', async (c) => {
  try {
    const plans = await c.env.DB.prepare(`
      SELECT id, name, description, price, original_price, duration_days, traffic_gb, device_limit, 
             features, sort_order, is_popular, status, created_at
      FROM plans 
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
    console.error('Get admin plans error:', error)
    throw new HTTPException(500, { message: '获取套餐列表失败' })
  }
})

// Admin route - create plan
app.post('/admin', async (c) => {
  try {
    const body = await c.req.json()
    
    const {
      name,
      description,
      price,
      original_price,
      duration_days,
      traffic_gb,
      device_limit,
      features,
      sort_order,
      is_popular,
      status
    } = body

    // Simple validation
    if (!name || !price || !duration_days || !traffic_gb) {
      throw new HTTPException(400, { message: '套餐名称、价格、有效天数和流量是必填项' })
    }

    const featuresJson = features ? JSON.stringify(features) : '[]'

    const result = await c.env.DB.prepare(`
      INSERT INTO plans (
        name, description, price, original_price, duration_days, traffic_gb, device_limit,
        features, sort_order, is_popular, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      name,
      description || '',
      price,
      original_price || price,
      duration_days,
      traffic_gb,
      device_limit || 3,
      featuresJson,
      sort_order || 0,
      is_popular ? 1 : 0,
      status !== undefined ? status : 1
    ).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '创建套餐失败' })
    }

    // Get created plan
    const plan = await c.env.DB.prepare(`
      SELECT id, name, description, price, original_price, duration_days, traffic_gb, device_limit, 
             features, sort_order, is_popular, status, created_at
      FROM plans 
      WHERE id = ?
    `).bind(result.meta.last_row_id).first()

    return c.json({
      success: true,
      message: '套餐创建成功',
      data: {
        ...plan,
        features: plan.features ? JSON.parse(plan.features) : [],
      },
    })
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Create plan error:', error)
    throw new HTTPException(500, { message: '创建套餐失败: ' + error.message })
  }
})

// Admin route - update plan
app.put('/admin/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const {
      name,
      description,
      price,
      original_price,
      duration_days,
      traffic_gb,
      device_limit,
      features,
      sort_order,
      is_popular,
      status
    } = body

    // Simple validation
    if (!name || !price || !duration_days || !traffic_gb) {
      throw new HTTPException(400, { message: '套餐名称、价格、有效天数和流量是必填项' })
    }

    const featuresJson = features ? JSON.stringify(features) : '[]'

    const result = await c.env.DB.prepare(`
      UPDATE plans SET
        name = ?, description = ?, price = ?, original_price = ?, duration_days = ?,
        traffic_gb = ?, device_limit = ?, features = ?, sort_order = ?,
        is_popular = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      name,
      description || '',
      price,
      original_price || price,
      duration_days,
      traffic_gb,
      device_limit || 3,
      featuresJson,
      sort_order !== undefined ? sort_order : 0,
      is_popular ? 1 : 0,
      status !== undefined ? status : 1,
      id
    ).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '更新套餐失败' })
    }

    // Get updated plan
    const plan = await c.env.DB.prepare(`
      SELECT id, name, description, price, original_price, duration_days, traffic_gb, device_limit, 
             features, sort_order, is_popular, status, created_at
      FROM plans 
      WHERE id = ?
    `).bind(id).first()

    return c.json({
      success: true,
      message: '套餐更新成功',
      data: {
        ...plan,
        features: plan.features ? JSON.parse(plan.features) : [],
      },
    })
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Update plan error:', error)
    throw new HTTPException(500, { message: '更新套餐失败: ' + error.message })
  }
})

// Admin route - delete plan
app.delete('/admin/:id', async (c) => {
  try {
    const id = c.req.param('id')

    // Check if plan has any orders
    const orderCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM orders WHERE plan_id = ?'
    ).bind(id).first()

    if (orderCount.count > 0) {
      throw new HTTPException(400, { message: '该套餐已有用户购买，无法删除' })
    }

    const result = await c.env.DB.prepare(
      'DELETE FROM plans WHERE id = ?'
    ).bind(id).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '删除套餐失败' })
    }

    return c.json({
      success: true,
      message: '套餐删除成功',
    })
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Delete plan error:', error)
    throw new HTTPException(500, { message: '删除套餐失败: ' + error.message })
  }
})

export { app as planRoutes }