export const onRequestGet = async ({ env }) => {
  try {
    // 获取总用户数
    const totalUsersResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first();

    // 获取今日新增用户
    const newUsersTodayResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE("now")'
    ).first();

    // 获取总收入
    const totalRevenueResult = await env.DB.prepare(
      'SELECT SUM(final_amount) as total FROM orders WHERE status = 1'
    ).first();

    // 获取总订单数
    const totalOrdersResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM orders'
    ).first();

    // 获取服务器统计
    const activeServersResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM servers WHERE status = 1'
    ).first();

    const totalServersResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM servers'
    ).first();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalUsers: totalUsersResult.count || 0,
          newUsersToday: newUsersTodayResult.count || 0,
          totalRevenue: totalRevenueResult.total || 0,
          totalOrders: totalOrdersResult.count || 0,
          activeServers: activeServersResult.count || 0,
          totalServers: totalServersResult.count || 0,
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