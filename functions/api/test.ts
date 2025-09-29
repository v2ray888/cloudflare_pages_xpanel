interface Env {
  DB: any;
}

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    // 测试数据库连接
    const result = await env.DB.prepare('SELECT 1 as test').first();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test endpoint working',
        dbTest: result
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Test endpoint error',
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};