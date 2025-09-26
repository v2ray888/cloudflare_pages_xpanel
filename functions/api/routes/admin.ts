import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

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
        totalUsers: totalUsersResult.count || 0,
        newUsersToday: newUsersTodayResult.count || 0,
        totalRevenue: totalRevenueResult.total || 0,
        todayRevenue: todayRevenueResult.total || 0,
        totalOrders: totalOrdersResult.count || 0,
        todayOrders: todayOrdersResult.count || 0,
        activeServers: activeServersResult.count || 0,
        totalServers: totalServersResult.count || 0,
        totalRedemptionCodes: totalRedemptionCodesResult.count || 0,
        usedRedemptionCodes: usedRedemptionCodesResult.count || 0,
        totalReferrals: totalReferralsResult.count || 0,
        totalCommissions: totalCommissionsResult.total || 0,
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
    const params = []

    if (search) {
      whereClause += ' AND (email LIKE ? OR username LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
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
      total: countResult.total,
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

    if (![0, 1].includes(status)) {
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
    const params = []

    if (status !== undefined && status !== '') {
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
      total: countResult.total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Get orders error:', error)
    throw new HTTPException(500, { message: '获取订单列表失败' })
  }
})

export { app as adminRoutes }