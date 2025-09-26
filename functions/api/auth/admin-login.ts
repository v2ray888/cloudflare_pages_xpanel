export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 简单验证
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
      );
    }

    // 获取用户
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND role = 1'
    ).bind(email).first();

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '管理员账户不存在'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
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
      );
    }

    // 验证密码
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '密码错误'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 更新最后登录时间
    await env.DB.prepare(
      'UPDATE users SET last_login_at = datetime("now") WHERE id = ?'
    ).bind(user.id).run();

    // 移除密码字段
    const { password_hash, ...userWithoutPassword } = user;

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
    );
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
    );
  }
};