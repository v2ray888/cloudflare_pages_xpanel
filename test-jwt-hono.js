// 测试使用hono/jwt生成和验证JWT令牌
import { sign, verify } from 'hono/jwt';

// 使用与wrangler.toml中相同的JWT_SECRET
const JWT_SECRET = "Q8|)X)+Ac37*fSP%6o5wC#J7K=D)V@Ut";

async function testJwt() {
  try {
    // 生成令牌
    const token = await sign(
      {
        id: 2,
        username: "用户1",
        email: "user1@example.com",
        role: 0,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      },
      JWT_SECRET
    );
    
    console.log("生成的JWT令牌:");
    console.log(token);
    
    // 验证令牌
    const payload = await verify(token, JWT_SECRET);
    console.log("\nJWT验证成功:");
    console.log(payload);
  } catch (error) {
    console.log("JWT操作失败:");
    console.log(error.message);
  }
}

testJwt();