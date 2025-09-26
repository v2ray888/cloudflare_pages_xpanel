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

    // Get user
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '邮箱或密码错误'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (user.status !== 1) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '账户已被禁用'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Verify password
    const bcrypt = await import('bcryptjs')
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '邮箱或密码错误'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // Update last login
    await env.DB.prepare(
      'UPDATE users SET last_login_at = datetime("now") WHERE id = ?'
    ).bind(user.id).run()

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user

    return new Response(
      JSON.stringify({
        success: true,
        message: '登录成功',
        data: {
          user: userWithoutPassword,
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