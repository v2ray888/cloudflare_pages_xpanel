// 测试环境变量
console.log('环境变量测试:');

// 从wrangler.toml中读取JWT_SECRET
const fs = require('fs');
const toml = require('toml');

try {
  const tomlData = fs.readFileSync('./wrangler.toml', 'utf8');
  const config = toml.parse(tomlData);
  
  console.log('JWT_SECRET (production):', config.env.production.JWT_SECRET);
  console.log('JWT_SECRET (preview):', config.env.preview.JWT_SECRET);
} catch (error) {
  console.log('读取wrangler.toml失败:', error.message);
}