import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString()
  })
})

app.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json({ 
    success: true, 
    message: 'POST request successful',
    method: 'POST',
    body,
    timestamp: new Date().toISOString()
  })
})

export default app