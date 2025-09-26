export const onRequestGet = async ({ env }) => {
  try {
    const results: any = {};
    
    // 1. 获取总用户数
    try {
      results.totalUsers = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM users'
      ).first();
    } catch (error) {
      results.totalUsers = { error: error.message };
    }
    
    // 2. 获取今日新增用户
    try {
      results.newUsersToday = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = DATE("now")'
      ).first();
    } catch (error) {
      results.newUsersToday = { error: error.message };
    }
    
    // 3. 获取总收入
    try {
      results.totalRevenue = await env.DB.prepare(
        'SELECT SUM(final_amount) as total FROM orders WHERE status = 1'
      ).first();
    } catch (error) {
      results.totalRevenue = { error: error.message };
    }
    
    // 4. 获取今日收入
    try {
      results.todayRevenue = await env.DB.prepare(
        'SELECT SUM(final_amount) as total FROM orders WHERE status = 1 AND DATE(created_at) = DATE("now")'
      ).first();
    } catch (error) {
      results.todayRevenue = { error: error.message };
    }
    
    // 5. 获取总订单数
    try {
      results.totalOrders = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM orders'
      ).first();
    } catch (error) {
      results.totalOrders = { error: error.message };
    }
    
    // 6. 获取今日订单数
    try {
      results.todayOrders = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE("now")'
      ).first();
    } catch (error) {
      results.todayOrders = { error: error.message };
    }
    
    // 7. 获取服务器统计
    try {
      results.activeServers = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM servers WHERE status = 1'
      ).first();
    } catch (error) {
      results.activeServers = { error: error.message };
    }
    
    try {
      results.totalServers = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM servers'
      ).first();
    } catch (error) {
      results.totalServers = { error: error.message };
    }
    
    // 8. 获取兑换码统计
    try {
      results.totalRedemptionCodes = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM redemption_codes'
      ).first();
    } catch (error) {
      results.totalRedemptionCodes = { error: error.message };
    }
    
    try {
      results.usedRedemptionCodes = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM redemption_codes WHERE status = 1'
      ).first();
    } catch (error) {
      results.usedRedemptionCodes = { error: error.message };
    }
    
    // 9. 获取推广统计
    try {
      results.totalReferrals = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM users WHERE referrer_id IS NOT NULL'
      ).first();
    } catch (error) {
      results.totalReferrals = { error: error.message };
    }
    
    try {
      results.totalCommissions = await env.DB.prepare(
        'SELECT SUM(commission_amount) as total FROM referral_commissions WHERE status = 1'
      ).first();
    } catch (error) {
      results.totalCommissions = { error: error.message };
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Detailed debug query results',
        results
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
        message: 'Detailed debug query failed: ' + error.message,
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