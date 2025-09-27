import { Hono } from 'hono'

type Bindings = {
  DB: any
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Test POST to admin plans endpoint
app.post('/', async (c) => {
  try {
    // Simulate the admin plans POST endpoint logic
    const body = await c.req.json()
    
    return c.json({
      success: true,
      message: 'Admin plans POST endpoint is working',
      receivedData: body,
      endpoint: '/api/admin/plans',
      method: 'POST',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Test admin plans error:', error)
    return c.json({
      success: false,
      message: 'Error in admin plans POST endpoint',
      error: errorMessage
    }, 500)
  }
})

// Test GET to admin plans endpoint
app.get('/', async (c) => {
  try {
    return c.json({
      success: true,
      message: 'Admin plans GET endpoint is working',
      endpoint: '/api/admin/plans',
      method: 'GET',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Test admin plans GET error:', error)
    return c.json({
      success: false,
      message: 'Error in admin plans GET endpoint',
      error: errorMessage
    }, 500)
  }
})

export default app