export const onRequestGet = async ({ env }) => {
  try {
    // 获取总用户数
    const totalUsersResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalUsers: totalUsersResult.count || 0,
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
    console.error('Get admin stats error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取统计数据失败: ' + error.message
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