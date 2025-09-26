import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Get user servers (subscription required)
app.get('/', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    // Check if user has active subscription
    const subscription = await c.env.DB.prepare(`
      SELECT s.*, p.name as plan_name
      FROM subscriptions s
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = ? AND s.status = 1 AND s.expires_at > datetime('now')
      ORDER BY s.expires_at DESC
      LIMIT 1
    `).bind(payload.id).first()

    if (!subscription) {
      throw new HTTPException(403, { message: '请先购买套餐' })
    }

    // Get available servers
    const servers = await c.env.DB.prepare(`
      SELECT id, name, host, port, protocol, country, city, 
             load_percentage, status, created_at
      FROM servers 
      WHERE status = 1 
      ORDER BY sort_order ASC, load_percentage ASC
    `).all()

    return c.json({
      success: true,
      data: {
        subscription,
        servers: servers.results,
      },
    })
  } catch (error) {
    console.error('Get servers error:', error)
    throw new HTTPException(500, { message: '获取服务器列表失败' })
  }
})

// Get server config
app.get('/:id/config', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const serverId = c.req.param('id')
    
    // Check if user has active subscription
    const subscription = await c.env.DB.prepare(`
      SELECT * FROM subscriptions 
      WHERE user_id = ? AND status = 1 AND expires_at > datetime('now')
      ORDER BY expires_at DESC
      LIMIT 1
    `).bind(payload.id).first()

    if (!subscription) {
      throw new HTTPException(403, { message: '请先购买套餐' })
    }

    // Get server
    const server = await c.env.DB.prepare(
      'SELECT * FROM servers WHERE id = ? AND status = 1'
    ).bind(serverId).first()

    if (!server) {
      throw new HTTPException(404, { message: '服务器不存在' })
    }

    // Get user info for generating config
    const user = await c.env.DB.prepare(
      'SELECT id, email, referral_code FROM users WHERE id = ?'
    ).bind(payload.id).first()

    // Generate subscription URL/config based on protocol
    let config = ''
    const userToken = `${user.id}-${subscription.id}-${Date.now()}`
    
    switch (server.protocol) {
      case 'vmess':
        config = generateVmessConfig(server, user, userToken)
        break
      case 'vless':
        config = generateVlessConfig(server, user, userToken)
        break
      case 'trojan':
        config = generateTrojanConfig(server, user, userToken)
        break
      case 'shadowsocks':
        config = generateShadowsocksConfig(server, user, userToken)
        break
      default:
        throw new HTTPException(400, { message: '不支持的协议类型' })
    }

    return c.json({
      success: true,
      data: {
        server: {
          id: server.id,
          name: server.name,
          country: server.country,
          city: server.city,
          protocol: server.protocol,
        },
        config,
        subscription_url: `${c.req.url.split('/api')[0]}/api/subscription/${userToken}`,
      },
    })
  } catch (error) {
    console.error('Get server config error:', error)
    throw new HTTPException(500, { message: '获取配置失败' })
  }
})

// Helper functions to generate configs
function generateVmessConfig(server: any, user: any, token: string) {
  const config = {
    v: '2',
    ps: server.name,
    add: server.host,
    port: server.port,
    id: token,
    aid: '0',
    scy: 'auto',
    net: 'tcp',
    type: 'none',
    host: '',
    path: '',
    tls: server.tls ? 'tls' : '',
  }
  
  return `vmess://${btoa(JSON.stringify(config))}`
}

function generateVlessConfig(server: any, user: any, token: string) {
  const params = new URLSearchParams({
    type: 'tcp',
    security: server.tls ? 'tls' : 'none',
  })
  
  return `vless://${token}@${server.host}:${server.port}?${params.toString()}#${encodeURIComponent(server.name)}`
}

function generateTrojanConfig(server: any, user: any, token: string) {
  const params = new URLSearchParams({
    type: 'tcp',
    security: 'tls',
  })
  
  return `trojan://${token}@${server.host}:${server.port}?${params.toString()}#${encodeURIComponent(server.name)}`
}

function generateShadowsocksConfig(server: any, user: any, token: string) {
  const method = 'aes-256-gcm'
  const password = token
  const userInfo = btoa(`${method}:${password}`)
  
  return `ss://${userInfo}@${server.host}:${server.port}#${encodeURIComponent(server.name)}`
}

export { app as serverRoutes }