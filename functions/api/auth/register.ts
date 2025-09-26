export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await request.json()
    const { email, password } = body

    // Simple validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '邮箱和密码是必填项'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Check if user exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '邮箱已被注册'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)
    const userReferralCode = 'TEMP' + Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create user
    const result = await env.DB.prepare(`
      INSERT INTO users (email, password_hash, referral_code, status, created_at)
      VALUES (?, ?, ?, 1, datetime('now'))
    `).bind(
      email,
      hashedPassword,
      userReferralCode
    ).run()

    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '注册失败'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Get created user
    const user = await env.DB.prepare(
      'SELECT id, email, referral_code, status, role, created_at FROM users WHERE id = ?'
    ).bind(result.meta.last_row_id).first()

    return new Response(
      JSON.stringify({
        success: true,
        message: '注册成功',
        data: {
          user,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '服务器错误: ' + error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}