import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Admin test endpoint working',
    timestamp: new Date().toISOString()
  })
})

app.post('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'Admin POST test endpoint working',
    timestamp: new Date().toISOString()
  })
})

export default app