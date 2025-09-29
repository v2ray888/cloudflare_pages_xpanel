const jwt = require('jsonwebtoken');

// 使用与wrangler.toml中相同的JWT_SECRET
const JWT_SECRET = "Q8|)X)+Ac37*fSP%6o5wC#J7K=D)V@Ut";

// 为用户ID为2的用户生成令牌（user1@example.com）
const payload = {
  id: 2,
  username: "用户1",
  email: "user1@example.com",
  role: 0, // 普通用户
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天后过期
};

const token = jwt.sign(payload, JWT_SECRET);
console.log("Generated JWT Token:");
console.log(token);

// 为管理员用户生成令牌
const adminPayload = {
  id: 1,
  username: "Admin",
  email: "admin@xpanel.com",
  role: 1, // 管理员
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天后过期
};

const adminToken = jwt.sign(adminPayload, JWT_SECRET);
console.log("\nGenerated Admin JWT Token:");
console.log(adminToken);