// functions/api/admin/settings.ts
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// 安全的JSON解析函数
const safeJsonParse = (str: string, defaultValue: any) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
};

// Get all system settings
app.get('/', async (c) => {
  try {
    const settings = await c.env.DB.prepare(`
      SELECT key, value, description FROM settings
    `).all()

    // Convert to key-value map for easier access
    const settingsMap: Record<string, string> = {}
    settings.results.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value
    })

    return c.json({
      success: true,
      data: {
        site_name: settingsMap['site_name'] || 'XPanel',
        site_description: settingsMap['site_description'] || '专业VPN服务提供商',
        site_logo: settingsMap['site_logo'] || '/logo.png',
        commission_rate: parseFloat(settingsMap['commission_rate'] || '0.10'),
        min_withdrawal: parseFloat(settingsMap['min_withdrawal'] || '100.00'),
        currency: settingsMap['currency'] || 'CNY',
        payment_methods: settingsMap['payment_methods'] ? safeJsonParse(settingsMap['payment_methods'], ['alipay', 'wechat']) : ['alipay', 'wechat'],
        smtp_host: settingsMap['smtp_host'] || '',
        smtp_port: settingsMap['smtp_port'] || '587',
        smtp_user: settingsMap['smtp_user'] || '',
        smtp_pass: settingsMap['smtp_pass'] || '',
      },
    })
  } catch (error: any) {
    console.error('Get system settings error:', error)
    throw new HTTPException(500, { message: '获取系统设置失败: ' + (error.message || '未知错误') })
  }
})

// Update system settings
app.put('/', async (c) => {
  try {
    const body = await c.req.json()
    
    // Prepare batch updates
    const updates: Array<{ key: string; value: string }> = []
    
    // Add all settings to update array
    Object.keys(body).forEach(key => {
      if (body[key] !== undefined) {
        // Convert arrays to JSON strings
        const value = Array.isArray(body[key]) ? JSON.stringify(body[key]) : String(body[key])
        updates.push({ key, value })
      }
    })

    // Execute batch update
    if (updates.length > 0) {
      const statements = updates.map(update => 
        c.env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(update.key, update.value)
      )
      
      await c.env.DB.batch(statements)
    }

    return c.json({
      success: true,
      message: '系统设置更新成功',
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Update system settings error:', error)
    throw new HTTPException(500, { message: '更新系统设置失败: ' + (error.message || '未知错误') })
  }
})

// Batch update system settings
app.put('/batch', async (c) => {
  try {
    const body = await c.req.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      throw new HTTPException(400, { message: '请提供有效的设置参数' })
    }

    // Prepare batch updates
    const updates: Array<{ key: string; value: string }> = []
    
    // Add all settings to update array
    Object.keys(settings).forEach(key => {
      if (settings[key] !== undefined) {
        // Convert arrays to JSON strings
        const value = Array.isArray(settings[key]) ? JSON.stringify(settings[key]) : String(settings[key])
        updates.push({ key, value })
      }
    })

    // Execute batch update
    if (updates.length > 0) {
      const statements = updates.map(update => 
        c.env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(update.key, update.value)
      )
      
      await c.env.DB.batch(statements)
    }

    return c.json({
      success: true,
      message: '系统设置批量更新成功',
    })
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error
    }
    console.error('Batch update system settings error:', error)
    throw new HTTPException(500, { message: '批量更新系统设置失败: ' + (error.message || '未知错误') })
  }
})

export { app as settingsAdminRoutes }