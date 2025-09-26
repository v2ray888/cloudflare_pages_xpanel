export const onRequestGet = async ({ env }) => {
  try {
    // 测试数据库连接
    const result = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database connection successful',
        userCount: result.count,
        timestamp: new Date().toISOString()
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
        message: 'Database connection failed: ' + error.message,
        timestamp: new Date().toISOString()
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