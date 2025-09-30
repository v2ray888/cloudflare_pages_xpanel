import { Hono } from 'hono'
import { jwt, sign } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { adminRoutes } from './api/routes/admin'
import { userRoutes } from './api/routes/users'
import { orderRoutes } from './api/routes/orders'
import { paymentRoutes } from './api/routes/payments'
import { redemptionRoutes } from './api/routes/redemption'
import { referralRoutes } from './api/routes/referrals'
import { serverRoutes } from './api/routes/servers'
import { withdrawalRoutes } from './api/routes/withdrawals'
import { financeRoutes } from './api/admin/finance'
import { redemptionAdminRoutes } from './api/admin/redemption'
import { serversAdminRoutes } from './api/admin/servers'
import { referralAdminRoutes } from './api/admin/referrals'
import { settingsAdminRoutes } from './api/admin/settings'
// Import Cloudflare Pages Functions
// import { onRequestPost as loginHandler } from './api/auth/login' // Merged into this worker
import { onRequestPost as registerHandler } from './api/auth/register'
import { onRequestPost as adminLoginHandler } from './api/auth/admin-login'
import { onRequestGet as meHandler, onRequestOptions as meOptionsHandler } from './api/auth/me'
import { onRequestGet as plansHandler, onRequestOptions as plansOptionsHandler } from './api/plans'


type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  PAYMENT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Add CORS middleware for all routes
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  
  // 在开发环境中允许所有源，在生产环境中可以更严格
  const isDev = origin && (
    origin.startsWith('http://localhost:') || 
    origin.startsWith('http://127.0.0.1:') ||
    origin.endsWith('.pages.dev')
  );
  
  const allowedOrigin = isDev ? origin : '*';
  
  // Set CORS headers with proper encoding
  c.res.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  c.res.headers.set('Content-Type', 'application/json; charset=utf-8');
  
  await next();
  
  // Set CORS headers for the response
  c.res.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  c.res.headers.set('Content-Type', 'application/json; charset=utf-8');
});

// Add OPTIONS handlers before JWT middleware
// Admin redemption codes routes OPTIONS handlers
app.options('/api/admin/redemption', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/redemption/generate', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/redemption/:id', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/redemption/batch-delete', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Admin referrals routes OPTIONS handlers
app.options('/api/admin/referrals', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/referrals/commissions', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/referrals/commissions/:id/settle', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/referrals/settings', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Admin settings routes OPTIONS handlers
app.options('/api/admin/settings', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/settings/batch', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// JWT middleware for protected routes
const jwtMiddleware = async (c: any, next: any) => {
  console.log('JWT middleware called for:', c.req.url);
  try {
    console.log('Verifying with secret:', c.env.JWT_SECRET);
    const authMiddleware = jwt({ secret: c.env.JWT_SECRET, alg: 'HS256' })
    const result = await authMiddleware(c, next)
    console.log('JWT verification successful');
    return result;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }
}

// Apply JWT middleware to protected routes
app.use('/api/users/*', jwtMiddleware);
app.use('/api/servers/*', jwtMiddleware);
app.use('/api/user/servers', jwtMiddleware);
app.use('/api/orders/*', jwtMiddleware);
// 注意：兑换路由不需要JWT认证，所以不应用中间件
// app.use('/api/redemption/*', jwtMiddleware);
app.use('/api/referrals/*', jwtMiddleware);
app.use('/api/withdrawals', jwtMiddleware);
app.use('/api/admin/*', jwtMiddleware);

// Health check
app.get('/', (c) => {
  return c.json({ message: 'XPanel API is running!' })
})

// API routes
console.log('Registering API routes');
app.route('/api/admin', adminRoutes)
app.route('/api/admin/finance', financeRoutes)
app.route('/api/admin/redemption', redemptionAdminRoutes)
app.route('/api/admin/referrals', referralAdminRoutes)
app.route('/api/admin/servers', serversAdminRoutes)
app.route('/api/admin/settings', settingsAdminRoutes)
app.route('/api/users', userRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/payments', paymentRoutes)
app.route('/api/redemption', redemptionRoutes)
app.route('/api/referrals', referralRoutes)
app.route('/api/user/servers', serverRoutes)
app.route('/api/withdrawals', withdrawalRoutes)
console.log('API routes registered');

// Public API routes
app.get('/api/plans', async (c) => {
  const response = await plansHandler({ request: c.req.raw, env: c.env } as any)
  // 确保响应头设置正确的字符编码
  response.headers.set('Content-Type', 'application/json; charset=utf-8')
  return response
})

app.options('/api/plans', (c) => {
  const origin = c.req.header('Origin');
  
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
})

// Auth routes
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, role, status FROM users WHERE email = ?'
    ).bind(email).first<{ id: number; email: string; password_hash: string; role: number; status: number }>()

    if (!user) {
      throw new HTTPException(401, { message: '用户不存在或密码错误' })
    }

    if (user.status !== 1) {
      throw new HTTPException(403, { message: '账户已被禁用' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: '用户不存在或密码错误' })
    }

    console.log('Signing with secret:', c.env.JWT_SECRET);
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      c.env.JWT_SECRET
    )
    
    const { password_hash, ...userResponse } = user;

    // 使用手动创建的 Response 来确保字符编码正确
    const response = {
      success: true,
      message: '登录成功',
      data: {
        user: userResponse,
        token: token, // 确保token是字符串
      },
    };

    // 获取请求来源
    const origin = c.req.header('Origin');
    
    // 在开发环境中允许所有源，在生产环境中可以更严格
    const isDev = origin && (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.pages.dev')
    );
    
    const allowedOrigin = isDev ? origin : '*';

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': allowedOrigin
      },
    });

  } catch (error: any) {
    let errorMessage = '登录失败';
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = error.errors.map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error instanceof HTTPException) {
      errorMessage = error.message;
      statusCode = error.status;
    } else {
        errorMessage = error.message || '发生未知错误';
    }
    
    // 获取请求来源
    const origin = c.req.header('Origin');
    
    // 在开发环境中允许所有源，在生产环境中可以更严格
    const isDev = origin && (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.pages.dev')
    );
    
    const allowedOrigin = isDev ? origin : '*';
    
    c.status(statusCode as any);
    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      status: statusCode,
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': allowedOrigin
      },
    });
  }
})

app.options('/api/auth/login', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

app.post('/api/auth/register', async (c) => {
  const response = await registerHandler({ request: c.req.raw, env: c.env } as any)
  return response
})

app.options('/api/auth/register', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

app.post('/api/auth/admin-login', async (c) => {
  const response = await adminLoginHandler({ request: c.req.raw, env: c.env } as any)
  return response
})

app.options('/api/auth/admin-login', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

app.get('/api/auth/me', async (c) => {
  const response = await meHandler({ request: c.req.raw, env: c.env } as any)
  return response
})

app.options('/api/auth/me', (c) => {
  const origin = c.req.header('Origin');
  
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
})

// Admin dashboard routes
app.options('/api/admin/recent-orders', (c) => {
  const origin = c.req.header('Origin');
  
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
})

app.options('/api/admin/recent-users', (c) => {
  const origin = c.req.header('Origin');
  
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
})

app.options('/api/admin/stats', (c) => {
  const origin = c.req.header('Origin');
  
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
})

app.options('/api/admin/users', (c) => {
  const origin = c.req.header('Origin');
  
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
})

app.options('/api/admin/users/:id/status', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

app.options('/api/admin/servers', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

app.options('/api/admin/servers/:id', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

app.options('/api/admin/redemption/:id', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Admin referrals routes OPTIONS handlers
app.options('/api/admin/referrals', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/referrals/commissions', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/referrals/commissions/:id/settle', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

app.options('/api/admin/referrals/settings', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Admin orders routes OPTIONS handlers
app.options('/api/admin/orders', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
});

// Admin servers routes OPTIONS handlers
app.options('/api/admin/servers', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  })

})

app.options('/api/admin/servers/:id', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

// User routes OPTIONS handlers
app.options('/api/users/profile', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

app.options('/api/users/password', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

app.options('/api/users/subscription', (c) => {
  const origin = c.req.header('Origin');
  
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
})

app.options('/api/users/orders', (c) => {
  const origin = c.req.header('Origin');
  
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
})

app.options('/api/users/stats', (c) => {
  const origin = c.req.header('Origin');
  
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
})

// Withdrawals routes OPTIONS handlers
app.options('/api/withdrawals', (c) => {
  const origin = c.req.header('Origin');
  
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
})

// Finance routes OPTIONS handlers
app.options('/api/admin/finance/stats', (c) => {
  const origin = c.req.header('Origin');
  
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
});

// Test environment variables route
app.get('/api/test-env', async (c) => {
  // This is a placeholder - the actual implementation is in functions/api/test-env.ts
  return c.json({ success: false, message: 'Route not implemented' }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, message: 'API route not found' }, 404)
})

export default app