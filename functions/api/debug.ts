import { Hono } from 'hono'

type Env = {
  JWT_SECRET: string
  DB: any
}

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  // 检查环境变量
  const hasJwtSecret = !!c.env.JWT_SECRET
  const hasDbBinding = !!c.env.DB
  
  return c.json({
    success: true,
    message: 'Debug info',
    data: {
      hasJwtSecret,
      hasDbBinding,
      jwtSecretLength: c.env.JWT_SECRET ? c.env.JWT_SECRET.length : 0,
      timestamp: new Date().toISOString()
    }
  })
})

export default app