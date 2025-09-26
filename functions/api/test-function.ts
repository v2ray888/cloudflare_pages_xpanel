import { Hono } from 'hono'

const app = new Hono()

// 测试 GET 请求
app.get('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'GET request successful',
    method: 'GET',
    timestamp: new Date().toISOString()
  })
})

// 测试 POST 请求
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

// 测试 PUT 请求
app.put('/', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json({ 
    success: true, 
    message: 'PUT request successful',
    method: 'PUT',
    body,
    timestamp: new Date().toISOString()
  })
})

// 测试 DELETE 请求
app.delete('/', (c) => {
  return c.json({ 
    success: true, 
    message: 'DELETE request successful',
    method: 'DELETE',
    timestamp: new Date().toISOString()
  })
})

export default app