import { Hono } from 'hono'
import { sign } from 'hono/jwt'

type Bindings = {
  DB: any
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Test environment variables
app.get('/env', async (c) => {
  try {
    // Check if JWT_SECRET is configured
    const hasJwtSecret = !!c.env.JWT_SECRET
    const jwtSecretLength = c.env.JWT_SECRET ? c.env.JWT_SECRET.length : 0
    
    // Check DB connection
    const dbTest = await c.env.DB.prepare('SELECT 1 as test').first()
    
    return c.json({
      success: true,
      data: {
        hasJwtSecret,
        jwtSecretLength,
        dbConnection: !!dbTest,
        dbTestResult: dbTest
      }
    })
  } catch (error) {
    console.error('Environment test error:', error)
    return c.json({
      success: false,
      message: 'Environment test failed',
      error: (error as Error).message
    }, 500)
  }
})

// Test JWT generation
app.post('/jwt', async (c) => {
  try {
    // Check if JWT_SECRET is configured
    if (!c.env.JWT_SECRET) {
      return c.json({
        success: false,
        message: 'JWT_SECRET is not configured'
      }, 500)
    }
    
    // Test user data
    const userData = {
      id: 1,
      email: 'test@example.com',
      role: 1,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }
    
    console.log('JWT_SECRET length:', c.env.JWT_SECRET.length)
    console.log('User data:', userData)
    
    // Try to generate JWT
    const token = await sign(userData, c.env.JWT_SECRET)
    
    return c.json({
      success: true,
      message: 'JWT generated successfully',
      data: {
        token,
        userData
      }
    })
  } catch (error) {
    console.error('JWT test error:', error)
    return c.json({
      success: false,
      message: 'JWT test failed',
      error: (error as Error).message
    }, 500)
  }
})

// Test login with forced token
app.post('/login-test', async (c) => {
  try {
    // Generate a test token
    const userData = {
      id: 1,
      email: 'admin@xpanel.com',
      role: 1,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }
    
    const token = await sign(userData, c.env.JWT_SECRET)
    
    return c.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: 1,
          email: 'admin@xpanel.com',
          username: 'Admin',
          role: 1
        },
        token
      }
    })
  } catch (error) {
    console.error('Login test error:', error)
    return c.json({
      success: false,
      message: 'Login test failed',
      error: (error as Error).message
    }, 500)
  }
})

export default app