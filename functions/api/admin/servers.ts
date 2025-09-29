// functions/api/admin/servers.ts
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Server validation schema
const serverSchema = z.object({
  name: z.string().min(1, '服务器名称不能为空'),
  host: z.string().min(1, '服务器地址不能为空'),
  port: z.number().int().min(1).max(65535, '端口范围1-65535'),
  protocol: z.enum(['vmess', 'vless', 'trojan', 'shadowsocks']),
  method: z.string().optional(),
  password: z.string().optional(),
  uuid: z.string().optional(),
  path: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  flag_emoji: z.string().optional(),
  load_balance: z.number().int().min(0).optional().default(0),
  max_users: z.number().int().min(0).optional().default(1000),
  device_limit: z.number().int().min(0).optional().default(3),
  is_active: z.preprocess((val) => (val === true || val === 1 || val === 'true' ? 1 : 0), z.number().int().min(0).max(1)).optional().default(1),
  sort_order: z.number().int().min(0).optional().default(0),
})

// Get all servers with pagination (Admin)
app.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const search = c.req.query('search') || ''
    const status = c.req.query('status')
    const offset = (page - 1) * limit

    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (search) {
      whereClause += ' AND (name LIKE ? OR host LIKE ?)'
      params.push(`%${search}%`)
      params.push(`%${search}%`)
    }

    if (status !== undefined && status !== null && status !== '') {
      whereClause += ' AND is_active = ?'
      params.push(parseInt(status))
    }

    const servers = await c.env.DB.prepare(`
      SELECT * FROM servers
      ${whereClause}
      ORDER BY sort_order ASC, id DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all()

    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM servers ${whereClause}
    `).bind(...params).first()

    return c.json({
      success: true,
      data: servers.results,
      total: (countResult?.total as number) || 0,
      page,
      limit,
    })
  } catch (error: any) {
    console.error('Get servers error:', error)
    throw new HTTPException(500, { message: '获取服务器列表失败: ' + (error.message || '未知错误') })
  }
})

// Create server (Admin)
app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    
    const {
      name,
      host,
      port,
      protocol,
      method,
      password,
      uuid,
      path,
      country,
      city,
      flag_emoji,
      load_balance,
      max_users,
      device_limit,
      is_active,
      sort_order
    } = body

    // Simple validation
    if (!name || !host || !port || !protocol) {
      throw new HTTPException(400, { message: '服务器名称、地址、端口和协议是必填项' })
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO servers (
        name, host, port, protocol, method, password, uuid, path,
        country, city, flag_emoji, load_balance, max_users, device_limit,
        is_active, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      name,
      host,
      port,
      protocol,
      method || null,
      password || null,
      uuid || null,
      path || null,
      country || null,
      city || null,
      flag_emoji || null,
      load_balance || 0,
      max_users || 1000,
      device_limit || 3,
      is_active !== undefined ? is_active : 1,
      sort_order || 0
    ).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '创建服务器失败' })
    }

    // Get created server
    const server = await c.env.DB.prepare(
      'SELECT * FROM servers WHERE id = ?'
    ).bind(result.meta.last_row_id).first()

    return c.json({
      success: true,
      message: '服务器创建成功',
      data: server,
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Create server error:', error)
    throw new HTTPException(500, { message: '创建服务器失败: ' + error.message })
  }
})

// Update server (Admin)
app.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const {
      name,
      host,
      port,
      protocol,
      method,
      password,
      uuid,
      path,
      country,
      city,
      flag_emoji,
      load_balance,
      max_users,
      device_limit,
      is_active,
      sort_order
    } = body

    // Simple validation
    if (!name || !host || !port || !protocol) {
      throw new HTTPException(400, { message: '服务器名称、地址、端口和协议是必填项' })
    }

    const result = await c.env.DB.prepare(`
      UPDATE servers SET
        name = ?, host = ?, port = ?, protocol = ?, method = ?, password = ?,
        uuid = ?, path = ?, country = ?, city = ?, flag_emoji = ?,
        load_balance = ?, max_users = ?, device_limit = ?, is_active = ?,
        sort_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      name,
      host,
      port,
      protocol,
      method || null,
      password || null,
      uuid || null,
      path || null,
      country || null,
      city || null,
      flag_emoji || null,
      load_balance !== undefined ? load_balance : 0,
      max_users !== undefined ? max_users : 1000,
      device_limit !== undefined ? device_limit : 3,
      is_active !== undefined ? is_active : 1,
      sort_order !== undefined ? sort_order : 0,
      id
    ).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '更新服务器失败' })
    }

    // Get updated server
    const server = await c.env.DB.prepare(
      'SELECT * FROM servers WHERE id = ?'
    ).bind(id).first()

    if (!server) {
      throw new HTTPException(404, { message: '服务器不存在' })
    }

    return c.json({
      success: true,
      message: '服务器更新成功',
      data: server,
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Update server error:', error)
    throw new HTTPException(500, { message: '更新服务器失败: ' + error.message })
  }
})

// Delete server (Admin)
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    // Check if server exists
    const server = await c.env.DB.prepare(
      'SELECT id FROM servers WHERE id = ?'
    ).bind(id).first()

    if (!server) {
      throw new HTTPException(404, { message: '服务器不存在' })
    }

    const result = await c.env.DB.prepare(
      'DELETE FROM servers WHERE id = ?'
    ).bind(id).run()

    if (!result.success) {
      throw new HTTPException(500, { message: '删除服务器失败' })
    }

    return c.json({
      success: true,
      message: '服务器删除成功',
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Delete server error:', error)
    throw new HTTPException(500, { message: '删除服务器失败: ' + error.message })
  }
})

export { app as serversAdminRoutes }