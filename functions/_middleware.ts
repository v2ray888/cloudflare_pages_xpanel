/// <reference types="@cloudflare/workers-types" />

import { verify } from 'hono/jwt';

// Define the shape of the JWT payload we expect
interface JwtPayload {
  id: number;
  email: string;
  role: number;
  exp: number;
}

// Define the environment variables our functions expect
interface Env {
  JWT_SECRET: string;
  DB: D1Database;
}

// A helper to create a standardized JSON error response
const jsonError = (message: string, status: number = 500) => {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // 在开发环境中允许所有源
    },
  });
};

// The main middleware function that runs for every request in the /functions directory
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');

  // --- CORS Preflight for all routes ---
  // Handle all OPTIONS requests at the middleware level for simplicity.
  if (request.method === 'OPTIONS') {
    // 在开发环境中允许所有源，在生产环境中可以更严格
    const isDev = origin && (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.pages.dev')
    );
    
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isDev ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  // --- Admin Route Protection ---
  // Check if the requested path is an admin route
  if (url.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonError('未提供授权令牌', 401);
    }

    const token = authHeader.substring(7);

    try {
      // Verify the token
      const payload = await verify(token, env.JWT_SECRET) as unknown as JwtPayload;

      // Check if the token has expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return jsonError('令牌已过期', 401);
      }

      // Check if the user has the admin role (role === 1)
      if (payload.role !== 1) {
        return jsonError('没有管理员权限', 403);
      }

      // If all checks pass, proceed to the actual function
      const response = await next();
      
      // Add CORS headers to the response
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      return response;

    } catch (error) {
      // This catches errors from `verify` (e.g., invalid signature)
      return jsonError('无效的授权令牌', 401);
    }
  }

  // --- General Route Protection (Example for /api/user) ---
  // You can add more rules here for other protected routes like /api/user/*
  // For now, we'll just let them pass for simplicity, but you can implement
  // a similar JWT check without the role requirement.

  // For all other routes, proceed and add CORS headers
  const response = await next();
  
  // Add CORS headers to the response
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  return response;
};