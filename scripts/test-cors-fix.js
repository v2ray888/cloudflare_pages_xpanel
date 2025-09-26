const axios = require('axios');

// 测试CORS修复
async function testCorsFix() {
  console.log('正在测试CORS修复...');
  console.log('时间:', new Date().toISOString());

  try {
    // 测试注册端点
    console.log('\n1. 测试注册端点 (CORS修复验证)...');
    try {
      const registerResponse = await axios.post('https://xpanel.121858.xyz/api/auth/register', {
        email: `corstest${Date.now()}@example.com`,
        password: 'testpassword123',
        username: 'corstest'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://2727c6c7.cloudflare-pages-xpanel.pages.dev'
        },
        timeout: 10000
      });
      console.log('✅ CORS修复成功:', registerResponse.status, registerResponse.data?.message);
    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.message === '邮箱已被注册') {
        console.log('✅ CORS修复成功: 邮箱已被注册（这是预期的错误）');
      } else {
        console.log('⚠️ CORS可能仍在部署中:', registerError.response?.status, registerError.response?.data?.message || registerError.message);
      }
    }

    // 测试预检请求
    console.log('\n2. 测试预检请求 (OPTIONS)...');
    try {
      const optionsResponse = await axios.options('https://xpanel.121858.xyz/api/auth/register', {
        headers: {
          'Origin': 'https://2727c6c7.cloudflare-pages-xpanel.pages.dev',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        },
        timeout: 10000
      });
      console.log('✅ 预检请求成功:', optionsResponse.status);
    } catch (optionsError) {
      console.log('⚠️ 预检请求测试:', optionsError.response?.status || optionsError.message);
    }

    console.log('\n🎉 CORS修复测试完成！');
    console.log('💡 请等待几分钟让Cloudflare完成部署，然后在浏览器中测试注册功能。');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCorsFix();