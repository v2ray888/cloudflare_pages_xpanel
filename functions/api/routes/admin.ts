import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Get admin dashboard stats
app.get('/stats', async (c) => {
  try {
    // Get total users
    const totalUsersResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first()

    // Get new users today
    const newUsersTodayResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE("now")'
    ).first()

    // Get total revenue
    const totalRevenueResult = await c.env.DB.prepare(
      'SELECT SUM(final_amount) as total FROM orders WHERE status = 1'
    ).first()

    // Get today revenue
    const todayRevenueResult = await c.env.DB.prepare(
      'SELECT SUM(final_amount) as total FROM orders WHERE status = 1 AND DATE(created_at) = DATE("now")'
    ).first()

    // Get total orders
    const totalOrdersResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM orders'
    ).first()

    // Get today orders
    const todayOrdersResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE("now")'
    ).first()

    // Get server stats
    const activeServersResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM servers WHERE status = 1'
    ).first()

    const totalServersResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM servers'
    ).first()

    // Get redemption code stats
    const totalRedemptionCodesResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM redemption_codes'
    ).first()

    const usedRedemptionCodesResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM redemption_codes WHERE status = 1'
    ).first()

    // Get referral stats
    const totalReferralsResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users WHERE referrer_id IS NOT NULL'
    ).first()

    const totalCommissionsResult = await c.env.DB.prepare(
      'SELECT SUM(commission_amount) as total FROM referral_commissions WHERE status = 1'
    ).first()

    return c.json({
      success: true,
      data: {
        totalUsers: (totalUsersResult?.count as number) || 0,
        newUsersToday: (newUsersTodayResult?.count as number) || 0,
        totalRevenue: (totalRevenueResult?.total as number) || 0,
        todayRevenue: (todayRevenueResult?.total as number) || 0,
        totalOrders: (totalOrdersResult?.count as number) || 0,
        todayOrders: (todayOrdersResult?.count as number) || 0,
        activeServers: (activeServersResult?.count as number) || 0,
        totalServers: (totalServersResult?.count as number) || 0,
        totalRedemptionCodes: (totalRedemptionCodesResult?.count as number) || 0,
        usedRedemptionCodes: (usedRedemptionCodesResult?.count as number) || 0,
        totalReferrals: (totalReferralsResult?.count as number) || 0,
        totalCommissions: (totalCommissionsResult?.total as number) || 0,
      },
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    throw new HTTPException(500, { message: '获取统计数据失败' })
  }
})

// Get recent orders
app.get('/recent-orders', async (c) => {
  try {
    const orders = await c.env.DB.prepare(`
      SELECT o.*, p.name as plan_name, u.email as user_email
      FROM orders o
      LEFT JOIN plans p ON o.plan_id = p.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all()

    return c.json({
      success: true,
      data: orders.results,
    })
  } catch (error) {
    console.error('Get recent orders error:', error)
    throw new HTTPException(500, { message: '获取最近订单失败' })
  }
})

// Get recent users
app.get('/recent-users', async (c) => {
  try {
    const users = await c.env.DB.prepare(`
      SELECT id, email, username, status, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `).all()

    return c.json({
      success: true,
      data: users.results,
    })
  } catch (error) {
    console.error('Get recent users error:', error)
    throw new HTTPException(500, { message: '获取最近用户失败' })
  }
})

// Get all users with pagination
app.get('/users', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const status = c.req.query('status')
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (search) {
      whereClause += ' AND (email LIKE ? OR username LIKE ?)'
      params.push(`%${search}%`)
      params.push(`%${search}%`)
    }

    if (status !== undefined && status !== null && status !== '') {
      whereClause += ' AND status = ?'
      params.push(parseInt(status))
    }

    const users = await c.env.DB.prepare(`
      SELECT id, email, username, phone, referral_code, status, role,
             balance, commission_balance, created_at, last_login_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all()

    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `).bind(...params).first()

    return c.json({
      success: true,
      data: users.results,
      total: (countResult?.total as number) || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Get users error:', error)
    throw new HTTPException(500, { message: '获取用户列表失败' })
  }
})

// Update user status
app.put('/users/:id/status', async (c) => {
  try {
    const userId = c.req.param('id')
    const body = await c.req.json()
    const { status } = body

    if (status !== 0 && status !== 1) {
      throw new HTTPException(400, { message: '无效的状态值' })
    }

    await c.env.DB.prepare(
      'UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?'
    ).bind(status, userId).run()

    return c.json({
      success: true,
      message: status === 1 ? '用户已启用' : '用户已禁用',
    })
  } catch (error) {
    console.error('Update user status error:', error)
    throw new HTTPException(500, { message: '更新用户状态失败' })
  }
})

// Get all orders with pagination
app.get('/orders', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const status = c.req.query('status')
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (status !== undefined && status !== null && status !== '') {
      whereClause += ' AND o.status = ?'
      params.push(parseInt(status))
    }

    const orders = await c.env.DB.prepare(`
      SELECT o.*, p.name as plan_name, u.email as user_email
      FROM orders o
      LEFT JOIN plans p ON o.plan_id = p.id
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all()

    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM orders o ${whereClause}
    `).bind(...params).first()

    return c.json({
      success: true,
      data: orders.results,
      total: (countResult?.total as number) || 0,
      page,
      limit,
    })
  } catch (error) {
    console.error('Get orders error:', error)
    throw new HTTPException(500, { message: '获取订单列表失败' })
  }
})

// Get all active plans (Public)
app.get('/plans/public', async (c) => {
  try {
    const plans = await c.env.DB.prepare(`
      SELECT id, name, description, price, original_price, duration_days, traffic_gb, device_limit, 
             features, sort_order, is_popular, is_active as status, created_at
      FROM plans 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, price ASC
    `).all()

    return c.json({
      success: true,
      data: plans.results.map((plan: any) => ({
        ...plan,
        features: plan?.features ? JSON.parse(plan.features as string) : [],
      })),
    })
  } catch (error: any) {
    console.error('Get public plans error:', error)
    throw new HTTPException(500, { message: '获取套餐列表失败' })
  }
})

// Get plan by id (Public)
app.get('/plans/public/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const plan = await c.env.DB.prepare(`
      SELECT id, name, description, price, original_price, duration_days, traffic_gb, device_limit, 
             features, sort_order, is_popular, is_active as status, created_at
      FROM plans 
      WHERE id = ? AND is_active = 1
    `).bind(id).first()

    if (!plan) {
      throw new HTTPException(404, { message: '套餐不存在' })
    }

    return c.json({
      success: true,
      data: {
        ...plan,
        features: plan.features ? JSON.parse(plan.features as string) : [],
      },
    })
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Get public plan by id error:', error)
    throw new HTTPException(500, { message: '获取套餐失败' })
  }
})


// Admin plans routes
// Get all plans (including inactive)
app.get('/plans', async (c) => {
  try {
    const plans = await c.env.DB.prepare(`
      SELECT id, name, description, price, original_price, duration_days, traffic_gb, device_limit, 
             features, sort_order, is_popular, is_active as status, created_at
      FROM plans 
      ORDER BY sort_order ASC, price ASC
    `).all()

    return c.json({
      success: true,
      data: plans.results.map((plan: any) => ({
        ...plan,
        features: plan.features ? JSON.parse(plan.features as string) : [],
      })),
    })
  } catch (error) {
    console.error('Get admin plans error:', error)
    throw new HTTPException(500, { message: '获取套餐列表失败' })
  }
})

// Create plan
app.post('/plans', async (c) => {
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
        features, sort_order, is_popular, is_active, created_at
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
             features, sort_order, is_popular, is_active as status, created_at
      FROM plans 
      WHERE id = ?
    `).bind(result.meta.last_row_id).first()

    if (!plan) {
      throw new HTTPException(500, { message: '创建套餐失败' })
    }

    return c.json({
      success: true,
      message: '套餐创建成功',
      data: {
        ...plan,
        features: plan.features ? JSON.parse(plan.features as string) : [],
      },
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Create plan error:', error)
    throw new HTTPException(500, { message: '创建套餐失败: ' + error.message })
  }
})

// Update plan
app.put('/plans/:id', async (c) => {
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
        is_popular = ?, is_active = ?, updated_at = datetime('now')
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
             features, sort_order, is_popular, is_active as status, created_at
      FROM plans 
      WHERE id = ?
    `).bind(id).first()

    if (!plan) {
      throw new HTTPException(404, { message: '套餐不存在' })
    }

    return c.json({
      success: true,
      message: '套餐更新成功',
      data: {
        ...plan,
        features: plan.features ? JSON.parse(plan.features as string) : [],
      },
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Update plan error:', error)
    throw new HTTPException(500, { message: '更新套餐失败: ' + error.message })
  }
})

// Delete plan
app.delete('/plans/:id', async (c) => {
  try {
    const id = c.req.param('id')

    // Check if plan has any orders
    const orderCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM orders WHERE plan_id = ?'
    ).bind(id).first()

    if ((orderCount?.count as number) > 0) {
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
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Delete plan error:', error)
    throw new HTTPException(500, { message: '删除套餐失败: ' + error.message })
  }
})

export { app as adminRoutes }