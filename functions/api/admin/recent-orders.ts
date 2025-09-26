export const onRequestGet = async ({ env }) => {
  try {
    const orders = await env.DB.prepare(`
      SELECT o.*, p.name as plan_name, u.email as user_email
      FROM orders o
      LEFT JOIN plans p ON o.plan_id = p.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();

    return new Response(
      JSON.stringify({
        success: true,
        data: orders.results,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Get recent orders error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: '获取最近订单失败'
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