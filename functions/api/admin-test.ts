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
          message: '管理员账户不存在',
          debug: {
            email: email,
            role: 'admin'
          }
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
    
    return new Response(
      JSON.stringify({
        success: true,
        message: '密码验证结果',
        passwordValid: isValidPassword,
        debug: {
          providedPassword: password,
          storedHash: user.password_hash,
          userId: user.id,
          userEmail: user.email
        }
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