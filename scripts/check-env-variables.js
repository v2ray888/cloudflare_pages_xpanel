console.log('检查环境变量配置...');

// 检查必要的环境变量
const requiredEnvVars = [
  'JWT_SECRET',
  'PAYMENT_SECRET'
];

console.log('\n1. 检查 wrangler.toml 配置...');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
console.log('   PAYMENT_SECRET:', process.env.PAYMENT_SECRET ? '已设置' : '未设置');

console.log('\n2. 检查前端环境变量...');
console.log('   VITE_API_URL:', import.meta.env.VITE_API_URL || '未设置');
console.log('   API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || '未设置');

console.log('\n3. 必要的环境变量:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`   ${envVar}: ${value ? '✓ 已设置' : '✗ 未设置'}`);
});

console.log('\n💡 建议:');
console.log('   1. 登录 Cloudflare Dashboard');
console.log('   2. 进入 Workers & Pages');
console.log('   3. 选择您的项目 cloudflare-xpanel');
console.log('   4. 点击 Settings -> Environment variables');
console.log('   5. 确保添加了以下变量:');
console.log('      - JWT_SECRET: [您的JWT密钥]');
console.log('      - PAYMENT_SECRET: [您的支付密钥]');
console.log('   6. 保存设置并重新部署');

console.log('\n⚠️  注意:');
console.log('   - JWT_SECRET 应该是一个强随机字符串，至少32个字符');
console.log('   - PAYMENT_SECRET 应该是另一个强随机字符串');
console.log('   - 不要在代码中硬编码这些密钥');
console.log('   - 不要将这些密钥提交到Git仓库');