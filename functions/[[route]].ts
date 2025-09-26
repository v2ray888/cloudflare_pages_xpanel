import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import { authRoutes } from './api/routes/auth'
import { userRoutes } from './api/routes/users'
import { planRoutes } from './api/routes/plans'
import { orderRoutes } from './api/routes/orders'
import { serverRoutes } from './api/routes/servers'
import { redemptionRoutes } from './api/routes/redemption'
import { referralRoutes } from './api/routes/referrals'
import { adminRoutes } from './api/routes/admin'
import { paymentRoutes } from './api/routes/payments'

type Bindings = {
  DB: any
  JWT_SECRET: string
  PAYMENT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://xpanel.121858.xyz', 'https://*.cloudflare-pages-xpanel.pages.dev'],
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

// Public routes (这些路由不需要认证)
app.route('/api/auth', authRoutes)
app.route('/api/plans', planRoutes)
app.route('/api/payments', paymentRoutes)

// Protected routes middleware
// 注意：我们排除了认证路由，因为登录和注册应该是公开的
app.use('/api/*', async (c, next) => {
  // 排除公开路由
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/redeem', '/api/auth/verify'];
  const currentPath = c.req.path;
  
  if (publicRoutes.includes(currentPath)) {
    return next();
  }
  
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Token required' })
  }

  const token = authHeader.substring(7)
  try {
    const secret = c.env.JWT_SECRET;
    const payload = await jwt({ secret })(c, async () => {});
    c.set('jwtPayload', payload);
    await next()
  } catch (error) {
    throw new HTTPException(401, { message: 'Invalid token' })
  }
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