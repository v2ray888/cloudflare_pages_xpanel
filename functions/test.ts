import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString()
  })
})

export default app