import { Hono } from 'hono'
import { onRequestGet as getStatsHandler } from './stats'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Finance stats
app.get('/stats', async (c) => {
  const response = await getStatsHandler({ 
    request: c.req.raw, 
    env: c.env 
  } as any)
  return response
})

app.options('/stats', (c) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
})

export { app as financeRoutes }