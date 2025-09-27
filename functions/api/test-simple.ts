import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Simple test endpoint working',
    path: c.req.path,
    method: c.req.method
  })
})

app.post('/', (c) => {
  return c.json({
    success: true,
    message: 'Simple POST test endpoint working',
    path: c.req.path,
    method: c.req.method
  })
})

export default app