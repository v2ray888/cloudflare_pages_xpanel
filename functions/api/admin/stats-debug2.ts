export const onRequestGet = async ({ env }) => {
  try {
    // 测试基本查询
    const totalUsersResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first();
    
    // 测试订单表查询
    let ordersQuerySuccess = true;
    let ordersResult: any = null;
    try {
      ordersResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM orders'
      ).first();
    } catch (ordersError) {
      ordersQuerySuccess = false;
      ordersResult = { error: ordersError.message };
    }
    
    // 测试服务器表查询
    let serversQuerySuccess = true;
    let serversResult: any = null;
    try {
      serversResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM servers'
      ).first();
    } catch (serversError) {
      serversQuerySuccess = false;
      serversResult = { error: serversError.message };
    }
    
    // 测试兑换码表查询
    let redemptionQuerySuccess = true;
    let redemptionResult: any = null;
    try {
      redemptionResult = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM redemption_codes'
      ).first();
    } catch (redemptionError) {
      redemptionQuerySuccess = false;
      redemptionResult = { error: redemptionError.message };
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Debug query results',
        totalUsers: totalUsersResult.count || 0,
        orders: {
          success: ordersQuerySuccess,
          result: ordersResult
        },
        servers: {
          success: serversQuerySuccess,
          result: serversResult
        },
        redemption: {
          success: redemptionQuerySuccess,
          result: redemptionResult
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
        message: 'Debug query failed: ' + error.message,
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