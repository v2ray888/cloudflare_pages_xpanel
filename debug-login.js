// 简单的调试脚本，直接测试数据库查询
const { Database } = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// 连接到本地数据库
const db = new Database('.wrangler/state/v3/d1/xpanel-db.sqlite');

// 查询管理员用户
const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = 1').get('admin@xpanel.com');
console.log('User from database:', user);

if (user) {
  // 测试密码验证
  const isValidPassword = bcrypt.compareSync('admin123', user.password_hash);
  console.log('Password valid:', isValidPassword);
  
  // 测试JWT生成
  try {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      'Q8|)X)+Ac37*fSP%6o5wC#J7K=D)V@Ut'
    );
    console.log('JWT token generated successfully');
    console.log('Token:', token);
  } catch (error) {
    console.error('JWT generation error:', error);
  }
} else {
  console.log('Admin user not found in database');
}