interface Env {
  DB: any;
}

interface RequestContext {
  env: Env;
}

export const onRequestGet = async ({ env }: RequestContext) => {
  try {
    // 测试数据库连接
    const result: any = await env.DB.prepare(
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database connection failed: ' + errorMessage,
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