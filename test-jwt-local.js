// 测试本地环境中的 JWT 生成
import { sign } from 'hono/jwt'

async function testJWT() {
  try {
    // 使用与生产环境相同的密钥
    const secret = 'Q8|)X)+Ac37*fSP%6o5wC#J7K=D)V@Ut'
    
    // 模拟用户数据
    const userData = {
      id: 1,
      email: 'admin@xpanel.com',
      role: 1,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }
    
    console.log('JWT_SECRET length:', secret.length)
    console.log('User data:', userData)
    
    // 尝试生成 JWT
    const token = await sign(userData, secret)
    console.log('JWT token generated successfully:', token)
    console.log('Token length:', token.length)
  } catch (error) {
    console.error('JWT token generation failed:', error)
  }
}

// 运行测试
testJWT()