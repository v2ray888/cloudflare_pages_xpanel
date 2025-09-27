import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { generateSubscriptionToken } from '../../utils/generators';

type Bindings = {
  DB: D1Database
  PAYMENT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Payment callback (webhook)
app.post('/callback', async (c) => {
  try {
    const body = await c.req.json()
    const { order_no, status, transaction_id, payment_method } = body

    // Verify payment signature (implement based on your payment provider)
    // const signature = c.req.header('X-Payment-Signature')
    // if (!verifySignature(body, signature, c.env.PAYMENT_SECRET)) {
    //   throw new HTTPException(400, { message: 'Invalid signature' })
    // }

    // Get order
    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE order_no = ?'
    ).bind(order_no).first<{ id: number, user_id: number, plan_id: number, order_no: string, amount: number, discount_amount: number, final_amount: number, coupon_id: number | null, status: number, payment_method: string | null, transaction_id: string | null, paid_at: string | null, created_at: string, updated_at: string | null }>()

    if (!order) {
      throw new HTTPException(404, { message: 'Order not found' })
    }

    if (order.status !== 0) {
      return c.json({ success: true, message: 'Order already processed' })
    }

    if (status === 'success') {
      // Update order status
      await c.env.DB.prepare(`
        UPDATE orders
        SET status = 1, payment_method = ?, transaction_id = ?, paid_at = datetime('now')
        WHERE id = ?
      `).bind(payment_method, transaction_id, order.id).run()

      // Get plan details
      const plan = await c.env.DB.prepare(
        'SELECT * FROM plans WHERE id = ?'
      ).bind(order.plan_id).first<{ id: number, name: string, description: string, price: number, original_price: number, duration_days: number, traffic_gb: number, device_limit: number, features: string, sort_order: number, is_popular: number, is_active: number, created_at: string }>()

      if (plan) {
        // Create or extend subscription
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + (plan.duration_days as number))

        // Check if user has existing subscription
        const existingSubscription = await c.env.DB.prepare(`
          SELECT * FROM subscriptions
          WHERE user_id = ? AND status = 1
          ORDER BY expires_at DESC
          LIMIT 1
        `).bind(order.user_id).first<{ id: number, user_id: number, plan_id: number, token: string, expires_at: string, traffic_used: number, status: number, created_at: string, updated_at: string | null }>()

        if (existingSubscription && new Date(existingSubscription.expires_at as string) > new Date()) {
          // Extend existing subscription
          const newExpiresAt = new Date(existingSubscription.expires_at as string)
          newExpiresAt.setDate(newExpiresAt.getDate() + (plan.duration_days as number))

          await c.env.DB.prepare(`
            UPDATE subscriptions
            SET expires_at = ?, plan_id = ?, updated_at = datetime('now')
            WHERE id = ?
          `).bind(
            newExpiresAt.toISOString(),
            plan.id,
            existingSubscription.id
          ).run()
        } else {
          // Create new subscription
          const subscriptionToken = generateSubscriptionToken()
          
          await c.env.DB.prepare(`
            INSERT INTO subscriptions (
              user_id, plan_id, token, expires_at, traffic_used, status, created_at
            ) VALUES (?, ?, ?, ?, 0, 1, datetime('now'))
          `).bind(
            order.user_id,
            plan.id,
            subscriptionToken,
            expiresAt.toISOString()
          ).run()
        }

        // Handle referral commission
        const user = await c.env.DB.prepare(
          'SELECT referrer_id FROM users WHERE id = ?'
        ).bind(order.user_id).first<{ referrer_id: number | null }>()

        if (user && user.referrer_id) {
          const commissionRate = 10 // 10% commission
          const commissionAmount = (order.final_amount as number * commissionRate) / 100

          // Create commission record
          await c.env.DB.prepare(`
            INSERT INTO referral_commissions (
              referrer_id, referee_id, order_id, commission_rate, 
              commission_amount, status, created_at
            ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
          `).bind(
            user.referrer_id,
            order.user_id,
            order.id,
            commissionRate,
            commissionAmount
          ).run()

          // Update referrer's commission balance
          await c.env.DB.prepare(`
            UPDATE users 
            SET commission_balance = commission_balance + ?
            WHERE id = ?
          `).bind(commissionAmount, user.referrer_id).run()
        }
      }
    } else if (status === 'failed') {
      // Update order status to failed
      await c.env.DB.prepare(
        'UPDATE orders SET status = 3, updated_at = datetime("now") WHERE id = ?'
      ).bind(order.id).run()
    }

    return c.json({ success: true, message: 'Payment processed' })
  } catch (error: any) {
    console.error('Payment callback error:', error)
    throw new HTTPException(500, { message: 'Payment processing failed' })
  }
})

// Get payment methods
app.get('/methods', async (c) => {
  return c.json({
    success: true,
    data: [
      {
        id: 'alipay',
        name: '支付宝',
        icon: '/icons/alipay.png',
        enabled: true,
      },
      {
        id: 'wechat',
        name: '微信支付',
        icon: '/icons/wechat.png',
        enabled: true,
      },
      {
        id: 'stripe',
        name: '信用卡',
        icon: '/icons/stripe.png',
        enabled: true,
      },
    ],
  })
})

export { app as paymentRoutes }