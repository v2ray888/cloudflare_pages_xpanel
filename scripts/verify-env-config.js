#!/usr/bin/env node

/**
 * 验证环境变量配置
 * 检查wrangler.toml和.env文件中的环境变量是否一致
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证环境变量配置...');
console.log('时间:', new Date().toISOString());
console.log('');

// 读取wrangler.toml文件
try {
  const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
  const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
  
  console.log('📄 检查 wrangler.toml 文件...');
  
  // 检查是否包含必要的环境变量
  const requiredVars = ['JWT_SECRET', 'PAYMENT_SECRET', 'ENVIRONMENT'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!wranglerContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('❌ 缺少以下环境变量:', missingVars.join(', '));
  } else {
    console.log('✅ 所有必需的环境变量都已配置');
  }
  
  // 检查是否使用了安全的密钥
  const devKeyPattern = /my-dev-/g;
  const devKeyMatches = wranglerContent.match(devKeyPattern);
  
  if (devKeyMatches) {
    console.log('⚠️  检测到可能不安全的开发密钥 (my-dev-*)');
    console.log('💡 建议使用强随机生成的密钥');
  } else {
    console.log('✅ 未检测到不安全的开发密钥');
  }
  
} catch (error) {
  console.log('❌ 无法读取 wrangler.toml 文件:', error.message);
}

console.log('');

// 读取.env文件
try {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('📄 检查 .env 文件...');
  
  // 检查是否包含必要的环境变量
  const requiredEnvVars = ['JWT_SECRET', 'PAYMENT_SECRET'];
  const missingEnvVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingEnvVars.push(varName);
    }
  });
  
  if (missingEnvVars.length > 0) {
    console.log('❌ 缺少以下环境变量:', missingEnvVars.join(', '));
  } else {
    console.log('✅ 所有必需的环境变量都已配置');
  }
  
  // 检查是否使用了安全的密钥
  const devEnvKeyPattern = /my-dev-/g;
  const devEnvKeyMatches = envContent.match(devEnvKeyPattern);
  
  if (devEnvKeyMatches) {
    console.log('⚠️  检测到可能不安全的开发密钥 (my-dev-*)');
    console.log('💡 建议使用强随机生成的密钥');
  } else {
    console.log('✅ 未检测到不安全的开发密钥');
  }
  
} catch (error) {
  console.log('⚠️  无法读取 .env 文件 (可能不存在):', error.message);
}

console.log('');
console.log('📋 验证完成');
console.log('');
console.log('💡 下一步建议:');
console.log('   1. 等待Cloudflare Pages完成最新部署');
console.log('   2. 运行 comprehensive-api-test.js 验证API功能');
console.log('   3. 如仍有问题，检查Cloudflare部署日志');