import { HTTPException } from 'hono/http-exception'

interface Env {
  DB: any;
  JWT_SECRET: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

export const onRequestOptions = async ({ request }: { request: Request }) => {
  const origin = request.headers.get('Origin');
  
  // 在开发环境中允许所有源，在生产环境中可以更严格
  const isDev = origin && (
    origin.startsWith('http://localhost:') || 
    origin.startsWith('http://127.0.0.1:') ||
    origin.endsWith('.pages.dev')
  );
  
  const allowedOrigin = isDev ? origin : '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const onRequestGet = async ({ request, env }: RequestContext) => {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: '未提供授权令牌' });
    }

    const token = authHeader.substring(7);
    
    // Import jwt module
    const jwt = await import('hono/jwt');
    
    try {
      // Verify the token
      const payload = await jwt.verify(token, env.JWT_SECRET);
      
      // Check if the token has expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new HTTPException(401, { message: '令牌已过期' });
      }
      
      // Get user from database
      const user = await env.DB.prepare(
        'SELECT id, email, username, role, status, referral_code, balance, commission_balance, created_at, last_login_at FROM users WHERE id = ?'
      ).bind(payload.id).first();
      
      if (!user) {
        throw new HTTPException(404, { message: '用户不存在' });
      }
      
      const origin = request.headers.get('Origin');
      
      // 在开发环境中允许所有源，在生产环境中可以更严格
      const isDev = origin && (
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.pages.dev')
      );
      
      const allowedOrigin = isDev ? origin : '*';
      
      return new Response(
        JSON.stringify({
          success: true,
          data: user,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
          },
        }
      );
    } catch (error) {
      throw new HTTPException(401, { message: '无效的授权令牌' });
    }
  } catch (error: any) {
    if (error instanceof HTTPException) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new HTTPException(500, { message: '服务器错误: ' + errorMessage });
  }
};