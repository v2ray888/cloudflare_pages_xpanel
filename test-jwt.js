// 测试 JWT 生成的脚本
import { sign } from 'hono/jwt'

async function testJWT() {
  try {
    // 模拟用户数据
    const userData = {
      id: 1,
      email: 'admin@xpanel.com',
      role: 1,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    // 使用一个测试密钥
    const secret = 'test-secret-key-for-testing';
    
    console.log('User data for token:', userData);
    console.log('Secret length:', secret.length);
    
    // 尝试生成 JWT
    const token = await sign(userData, secret);
    console.log('JWT token generated successfully:', token);
  } catch (error) {
    console.error('JWT token generation failed:', error);
  }
}

// 运行测试
testJWT();