// functions/api/auth/login.ts
import { sign } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

// CORS preflight response
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequestPost = async ({ request, env }: { request: Request, env: any }) => {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, role, status FROM users WHERE email = ?'
    ).bind(email).first()

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

    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      env.JWT_SECRET
    )
    
    // Don't send password hash to client
    const { password_hash, ...userResponse } = user;

    const responseBody = {
      success: true,
      message: '登录成功',
      data: {
        user: userResponse,
        token,
      },
    }

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
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

    const errorBody = {
      success: false,
      message: errorMessage,
    }

    return new Response(JSON.stringify(errorBody), {
      status: statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}