// functions/api/admin/finance/stats.ts

// CORS preflight response
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function onRequestGet(context: any) {
  const { env, request } = context
  
  try {
    // Check admin authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ success: false, message: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    let decoded: any
    try {
      // Properly import and use JWT verification
      const jwt = await import('hono/jwt')
      decoded = await jwt.verify(token, env.JWT_SECRET)
    } catch (error) {
      return Response.json({ success: false, message: '无效的访问令牌' }, { status: 401 })
    }

    // Check if user is admin (role = 1 for admin)
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ? AND role = 1')
      .bind(decoded.id)
      .first()

    if (!user) {
      return Response.json({ success: false, message: '权限不足' }, { status: 403 })
    }

    // Get finance statistics
    const [
      totalRevenue,
      monthlyRevenue,
      totalWithdrawals,
      pendingWithdrawals,
      totalCommissions,
      totalUsers,
      activeUsers,
      totalOrders
    ] = await Promise.all([
      // Total revenue
      env.DB.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM orders 
        WHERE status = 1
      `).first(),
      
      // Monthly revenue
      env.DB.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM orders 
        WHERE status = 1 AND created_at >= date('now', '-30 days')
      `).first(),
      
      // Total withdrawals
      env.DB.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM withdrawals 
        WHERE status = 1
      `).first(),
      
      // Pending withdrawals
      env.DB.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM withdrawals 
        WHERE status = 0
      `).first(),
      
      // Total commissions
      env.DB.prepare(`
        SELECT COALESCE(SUM(commission_amount), 0) as total 
        FROM referral_commissions 
        WHERE status = 1
      `).first(),
      
      // Total users
      env.DB.prepare('SELECT COUNT(*) as total FROM users').first(),
      
      // Active users (last 30 days)
      env.DB.prepare(`
        SELECT COUNT(*) as total 
        FROM users 
        WHERE last_login_at >= date('now', '-30 days')
      `).first(),
      
      // Total orders
      env.DB.prepare('SELECT COUNT(*) as total FROM orders').first()
    ])

    // Get recent transactions
    const recentTransactions = await env.DB.prepare(`
      SELECT 
        'order' as type,
        o.id,
        o.order_no,
        o.amount,
        o.status,
        o.created_at,
        u.email as user_email,
        p.name as plan_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN plans p ON o.plan_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all()

    const stats = {
      revenue: {
        total: totalRevenue?.total || 0,
        monthly: monthlyRevenue?.total || 0,
        growth: 0 // TODO: Calculate growth percentage
      },
      withdrawals: {
        total: totalWithdrawals?.total || 0,
        pending: pendingWithdrawals?.total || 0
      },
      commissions: {
        total: totalCommissions?.total || 0
      },
      users: {
        total: totalUsers?.total || 0,
        active: activeUsers?.total || 0
      },
      orders: {
        total: totalOrders?.total || 0
      },
      recentTransactions: recentTransactions?.results || []
    }

    return Response.json({
      success: true,
      data: stats
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error: any) {
    console.error('Finance stats error:', error)
    return Response.json({
      success: false,
      message: '获取财务统计失败: ' + (error.message || '未知错误')
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }
}