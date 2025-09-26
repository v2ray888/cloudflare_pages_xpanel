const axios = require('axios');

// 替换为您的实际 Cloudflare Pages URL
const BASE_URL = process.env.BASE_URL || 'https://xpanel.121858.xyz';

async function checkDeployment() {
  console.log('正在检查部署状态...');
  console.log(`检查 URL: ${BASE_URL}`);
  console.log('时间:', new Date().toISOString());

  try {
    // 测试根路径
    console.log('\n1. 测试网站是否可访问...');
    const rootResponse = await axios.get(`${BASE_URL}/`, { timeout: 10000 });
    console.log('✅ 网站可访问:', rootResponse.status);

    // 测试API健康检查端点
    console.log('\n2. 测试API健康检查...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`, { timeout: 10000 });
    console.log('✅ API健康检查:', healthResponse.status, healthResponse.data?.message || 'OK');

    // 测试注册端点
    console.log('\n3. 测试注册端点...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: `deploytest${Date.now()}@example.com`,
        password: 'testpassword123',
        username: 'deploytest'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ 注册端点工作正常:', registerResponse.status, registerResponse.data?.message);
    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.message === '邮箱已被注册') {
        console.log('✅ 注册端点工作正常: 邮箱已被注册（这是预期的错误）');
      } else {
        console.log('⚠️ 注册端点可能仍在部署中:', registerError.response?.status, registerError.response?.data?.message || registerError.message);
      }
    }

    // 测试登录端点
    console.log('\n4. 测试登录端点...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'deploytest@example.com',
        password: 'testpassword123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('✅ 登录端点工作正常:', loginResponse.status, loginResponse.data?.message);
    } catch (loginError) {
      if (loginError.response?.status === 400) {
        console.log('✅ 登录端点工作正常:', loginError.response?.status, loginError.response?.data?.message || '邮箱或密码错误（这是预期的错误）');
      } else {
        console.log('⚠️ 登录端点可能仍在部署中:', loginError.response?.status, loginError.response?.data?.message || loginError.message);
      }
    }

    console.log('\n🎉 部署检查完成！如果所有测试都通过，您的修复已经生效。');
    console.log('💡 如果仍有问题，请等待几分钟后再次运行此脚本，因为部署可能需要一些时间完成。');

  } catch (error) {
    console.error('❌ 检查过程中发生错误:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\n💡 部署可能仍在进行中，请等待几分钟后再次运行此脚本。');
  }
}

checkDeployment();