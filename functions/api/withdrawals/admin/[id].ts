// functions/api/withdrawals/admin/[id].ts

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

export async function onRequestPut(context: any) {
  const { env, request, params } = context
  
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

    const withdrawalId = parseInt(params.id)
    const { status, admin_note } = await request.json()

    // Validate input
    if (![0, 1, 2].includes(status)) {
      return Response.json({
        success: false,
        message: '无效的状态值'
      }, { status: 400 })
    }

    // Get withdrawal record
    const withdrawal = await env.DB.prepare('SELECT * FROM withdrawals WHERE id = ?')
      .bind(withdrawalId)
      .first()

    if (!withdrawal) {
      return Response.json({
        success: false,
        message: '提现记录不存在'
      }, { status: 404 })
    }

    // Update withdrawal status
    await env.DB.prepare(`
      UPDATE withdrawals 
      SET status = ?, admin_note = ?, processed_at = datetime('now')
      WHERE id = ?
    `).bind(status, admin_note || null, withdrawalId).run()

    // If rejected, return commission to user
    if (status === 2 && withdrawal.status === 0) {
      await env.DB.prepare(`
        UPDATE users 
        SET commission_balance = commission_balance + ?
        WHERE id = ?
      `).bind(withdrawal.amount, withdrawal.user_id).run()
    }

    return Response.json({
      success: true,
      message: '提现状态更新成功'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('Process withdrawal error:', error)
    return Response.json({
      success: false,
      message: '处理提现请求失败'
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