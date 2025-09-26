import { Hono } from 'hono'
import { authRoutes } from './api/routes/auth'

const app = new Hono()

// 测试路由挂载
app.route('/api/auth', authRoutes)

// 简单的测试端点
app.get('/test-mount', (c) => {
  return c.json({ 
    success: true, 
    message: 'Route mounting test',
    routes: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/redeem'
    ]
  })
})

export default app