// functions/api/withdrawals/admin.ts

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
      // Simple JWT decode for demo (in production, use proper JWT verification)
      const payload = token.split('.')[1]
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      decoded = JSON.parse(decodedPayload)
      
      // Check if token is expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        throw new Error('Token expired')
      }
    } catch (error) {
      return Response.json({ success: false, message: '无效的访问令牌' }, { status: 401 })
    }

    // Check if user is admin
    const user = await env.DB.prepare('SELECT * FROM users WHERE id = ? AND role = "admin"')
      .bind(decoded.userId)
      .first()

    if (!user) {
      return Response.json({ success: false, message: '权限不足' }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        w.*,
        u.email as user_email,
        u.username as user_name
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
    `
    const params: any[] = []

    if (status !== null && status !== '') {
      query += ' WHERE w.status = ?'
      params.push(parseInt(status))
    }

    query += ' ORDER BY w.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const withdrawals = await env.DB.prepare(query).bind(...params).all()

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM withdrawals w'
    const countParams: any[] = []

    if (status !== null && status !== '') {
      countQuery += ' WHERE w.status = ?'
      countParams.push(parseInt(status))
    }

    const totalResult = await env.DB.prepare(countQuery).bind(...countParams).first()
    const total = totalResult.total

    return Response.json({
      success: true,
      data: {
        withdrawals: withdrawals.results || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('Get admin withdrawals error:', error)
    return Response.json({
      success: false,
      message: '获取提现记录失败'
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