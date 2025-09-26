export const onRequestGet = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (email LIKE ? OR username LIKE ?)';
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    if (status !== undefined && status !== null && status !== '') {
      whereClause += ' AND status = ?';
      params.push(parseInt(status));
    }

    const users = await env.DB.prepare(`
      SELECT id, email, username, phone, referral_code, status, role,
             balance, commission_balance, created_at, last_login_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `).bind(...params).first();

    return new Response(
      JSON.stringify({
        success: true,
        data: users.results,
        total: countResult.total,
        page,
        limit,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取用户列表失败'
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

export const onRequestPut = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '用户ID是必填项'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (status !== 0 && status !== 1) {
      return new Response(
        JSON.stringify({
          success: false,
          message: '无效的状态值'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    await env.DB.prepare(
      'UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?'
    ).bind(status, userId).run();

    return new Response(
      JSON.stringify({
        success: true,
        message: status === 1 ? '用户已启用' : '用户已禁用',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Update user status error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '更新用户状态失败'
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