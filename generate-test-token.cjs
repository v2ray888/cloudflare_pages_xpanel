const jwt = require('jsonwebtoken');

// 使用正确的密钥生成JWT令牌
const token = jwt.sign(
  { 
    id: 1, 
    email: 'admin@xpanel.com', 
    role: 1, 
    exp: Math.floor(Date.now() / 1000) + 3600 
  }, 
  'a-very-simple-and-long-secret-key-for-testing'
);

console.log('Generated token:', token);