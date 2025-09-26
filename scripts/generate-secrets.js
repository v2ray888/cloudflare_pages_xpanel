#!/usr/bin/env node

/**
 * 生成安全的环境变量密钥
 * 用于生成JWT_SECRET和PAYMENT_SECRET
 */

function generateSecureKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let result = '';
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    // 浏览器环境
    window.crypto.getRandomValues(array);
  } else if (typeof require !== 'undefined') {
    // Node.js环境
    const crypto = require('crypto');
    crypto.randomFillSync(array);
  } else {
    // 降级到Math.random()（不推荐用于生产环境）
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * chars.length);
    }
  }
  
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  
  return result;
}

console.log('🔐 安全密钥生成器');
console.log('==================');
console.log('');
console.log('生成的密钥可用于以下环境变量：');
console.log('- JWT_SECRET');
console.log('- PAYMENT_SECRET');
console.log('');
console.log('📋 生成的密钥：');
console.log('');
console.log('JWT_SECRET:', generateSecureKey(32));
console.log('PAYMENT_SECRET:', generateSecureKey(32));
console.log('');
console.log('💡 使用说明：');
console.log('1. 复制上述密钥');
console.log('2. 在Cloudflare Dashboard中设置环境变量');
console.log('3. 在本地开发环境中更新.env文件');
console.log('4. 重新部署项目以应用更改');
console.log('');
console.log('⚠️  安全提醒：');
console.log('- 请妥善保管这些密钥');
console.log('- 不要在代码中硬编码密钥');
console.log('- 不要将密钥提交到Git仓库');
console.log('- 定期轮换密钥以提高安全性');