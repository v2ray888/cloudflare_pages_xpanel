// functions/api/payments/callback.ts

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

export async function onRequestPost(context: any) {
  const { env, request } = context
  
  try {
    const { order_no, payment_method, status, transaction_id } = await request.json()

    // Validate required fields
    if (!order_no || !payment_method || !status) {
      return Response.json({
        success: false,
        message: '缺少必要参数'
      }, { status: 400 })
    }

    // Find order by order_no
    const order = await env.DB.prepare('SELECT * FROM orders WHERE order_no = ?')
      .bind(order_no)
      .first()

    if (!order) {
      return Response.json({
        success: false,
        message: '订单不存在'
      }, { status: 404 })
    }

    // Check if order is already paid
    if (order.status === 1) {
      return Response.json({
        success: false,
        message: '订单已支付'
      }, { status: 400 })
    }

    // Update order status based on payment status
    let orderStatus = 0 // pending
    if (status === 'success' || status === 'paid') {
      orderStatus = 1 // paid
    } else if (status === 'failed' || status === 'cancelled') {
      orderStatus = 2 // failed
    }

    // Update order
    await env.DB.prepare(`
      UPDATE orders 
      SET status = ?, transaction_id = ?, paid_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(orderStatus, transaction_id || null, order.id).run()

    // If payment successful, activate user subscription
    if (orderStatus === 1) {
      // Get plan details
      const plan = await env.DB.prepare('SELECT * FROM plans WHERE id = ?')
        .bind(order.plan_id)
        .first()

      if (plan) {
        // Update user subscription
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + plan.duration_days)

        await env.DB.prepare(`
          UPDATE users 
          SET 
            plan_id = ?,
            expires_at = ?,
            traffic_used = 0,
            traffic_total = ?,
            device_limit = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).bind(
          plan.id,
          expiresAt.toISOString(),
          plan.traffic_gb * 1024 * 1024 * 1024, // Convert GB to bytes
          plan.device_limit,
          order.user_id
        ).run()

        // Process referral commission if user has referrer
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
          .bind(order.user_id)
          .first()

        if (user && user.referrer_id) {
          // Calculate commission (assume 10% commission rate)
          const commissionRate = 0.1
          const commissionAmount = order.amount * commissionRate

          // Add commission to referrer
          await env.DB.prepare(`
            UPDATE users 
            SET commission_balance = commission_balance + ?
            WHERE id = ?
          `).bind(commissionAmount, user.referrer_id).run()

          // Record commission
          await env.DB.prepare(`
            INSERT INTO referral_commissions 
            (referrer_id, referee_id, order_id, commission_amount, status, created_at)
            VALUES (?, ?, ?, ?, 1, datetime('now'))
          `).bind(user.referrer_id, user.id, order.id, commissionAmount).run()
        }
      }
    }

    return Response.json({
      success: true,
      message: '支付状态更新成功',
      data: {
        order_no,
        status: orderStatus
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error) {
    console.error('Payment callback error:', error)
    return Response.json({
      success: false,
      message: '处理支付回调失败'
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