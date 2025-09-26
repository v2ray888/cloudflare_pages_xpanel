export const onRequestGet = async ({ env }) => {
  try {
    const result = await env.DB.prepare(
      'SELECT SUM(commission_amount) as total FROM referral_commissions WHERE status = 1'
    ).first();
    
    return new Response(
      JSON.stringify({
        success: true,
        result: result
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
        message: 'Commission query failed: ' + error.message,
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