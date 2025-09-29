// 测试JWT验证
const { verify } = require('hono/jwt');

// 使用与wrangler.toml中相同的JWT_SECRET
const JWT_SECRET = "Q8|)X)+Ac37*fSP%6o5wC#J7K=D)V@Ut";

// 测试令牌
const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiLnlKjmiLcxIiwiZW1haWwiOiJ1c2VyMUBleGFtcGxlLmNvbSIsInJvbGUiOjAsImV4cCI6MTc1OTY3NzM3NCwiaWF0IjoxNzU5MDcyNTc0fQ.h3QjiAFi2hwVpb_sTe8xpneO5Tss5Dfp4VN7iuOn3o4";

async function testJwt() {
  try {
    const payload = await verify(testToken, JWT_SECRET);
    console.log("JWT验证成功:");
    console.log(payload);
  } catch (error) {
    console.log("JWT验证失败:");
    console.log(error.message);
  }
}

testJwt();