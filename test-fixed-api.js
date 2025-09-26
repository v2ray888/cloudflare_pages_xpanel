const axios = require('axios');

// 替换为您的实际 Cloudflare Pages URL
const BASE_URL = process.env.BASE_URL || 'https://xpanel.121858.xyz';

async function testFixedAPI() {
  console.log('正在测试修复后的API端点...');
  console.log(`Base URL: ${BASE_URL}`);

  try {
    // 测试注册端点
    console.log('\n1. 测试注册端点...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        username: 'testuser'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ 注册端点响应:', registerResponse.status, registerResponse.data?.message);
    } catch (registerError) {
      console.log('❌ 注册端点测试失败:', registerError.response?.status, registerError.response?.data?.message || registerError.message);
    }

    // 测试登录端点
    console.log('\n2. 测试登录端点...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ 登录端点响应:', loginResponse.status, loginResponse.data?.message);
    } catch (loginError) {
      console.log('❌ 登录端点测试失败:', loginError.response?.status, loginError.response?.data?.message || loginError.message);
    }

    // 测试需要认证的端点（应该返回401）
    console.log('\n3. 测试需要认证的端点...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
        timeout: 10000
      });
      console.log('用户资料端点响应:', profileResponse.status);
    } catch (profileError) {
      if (profileError.response?.status === 401) {
        console.log('✅ 用户资料端点正确返回401（未授权）');
      } else {
        console.log('用户资料端点:', profileError.response?.status, profileError.response?.data?.message || profileError.message);
      }
    }

  } catch (error) {
    console.error('测试过程中发生错误:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
  
  console.log('\n📋 下一步操作：');
  console.log('1. 重新部署Pages项目以应用修复');
  console.log('2. 运行命令：npm run build && npx wrangler pages deploy dist');
}

testFixedAPI();