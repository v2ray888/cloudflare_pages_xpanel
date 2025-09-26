import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { planRoutes } from './routes/plans'
import { orderRoutes } from './routes/orders'
import { serverRoutes } from './routes/servers'
import { redemptionRoutes } from './routes/redemption'
import { referralRoutes } from './routes/referrals'
import { adminRoutes } from './routes/admin'
import { paymentRoutes } from './routes/payments'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  PAYMENT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://your-domain.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err)
  
  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      message: err.message,
    }, err.status)
  }
  
  return c.json({
    success: false,
    message: 'Internal Server Error',
  }, 500)
})

// Health check
app.get('/health', (c) => {
  return c.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  })
})

// Public routes
app.route('/auth', authRoutes)
app.route('/plans', planRoutes)
app.route('/payments', paymentRoutes)

// Protected routes middleware
app.use('/api/*', async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  return jwtMiddleware(c, next)
})

// Protected routes
app.route('/api/users', userRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/servers', serverRoutes)
app.route('/api/redemption', redemptionRoutes)
app.route('/api/referrals', referralRoutes)

// Admin routes middleware
app.use('/api/admin/*', async (c, next) => {
  const payload = c.get('jwtPayload')
  if (!payload || payload.role !== 1) {
    throw new HTTPException(403, { message: 'Access denied' })
  }
  await next()
})

app.route('/api/admin', adminRoutes)

export default app