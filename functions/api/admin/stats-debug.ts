export const onRequestGet = async ({ env }) => {
  try {
    // 测试基本查询
    const totalUsersResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Basic query successful',
        totalUsers: totalUsersResult.count || 0,
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
        message: 'Basic query failed: ' + error.message,
        error: error.toString()
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