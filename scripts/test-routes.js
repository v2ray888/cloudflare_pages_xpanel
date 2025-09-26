const axios = require('axios');

async function testRoutes() {
  console.log('测试路由配置...');
  console.log('时间:', new Date().toISOString());

  const baseUrl = 'https://xpanel.121858.xyz';
  
  // 测试不同的路由组合
  const tests = [
    {
      name: '直接访问 auth 路由',
      url: '/api/auth',
      method: 'GET'
    },
    {
      name: '访问注册端点',
      url: '/api/auth/register',
      method: 'POST',
      data: {
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      }
    },
    {
      name: '访问登录端点',
      url: '/api/auth/login',
      method: 'POST',
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    },
    {
      name: '访问兑换端点',
      url: '/api/auth/redeem',
      method: 'POST',
      data: {
        code: 'TESTCODE'
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 测试: ${test.name}`);
      console.log(`   URL: ${test.method} ${baseUrl}${test.url}`);
      
      let response;
      if (test.method === 'POST') {
        response = await axios.post(`${baseUrl}${test.url}`, test.data || {}, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
      } else {
        response = await axios.get(`${baseUrl}${test.url}`, {
          timeout: 10000
        });
      }
      
      console.log(`   ✅ 成功: ${response.status}`, response.data?.message || 'OK');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.response?.status || error.code}`, error.response?.data?.message || error.message);
      
      // 特别关注405错误
      if (error.response?.status === 405) {
        console.log(`   💡 这表明请求方法不被允许，可能是路由配置问题`);
      }
    }
  }
  
  console.log('\n💡 如果仍然出现405错误，可能的原因：');
  console.log('   1. Cloudflare Functions未正确部署');
  console.log('   2. _routes.json配置不正确');
  console.log('   3. 路由挂载顺序有问题');
  console.log('   4. 需要等待更长时间让Cloudflare完成部署');
}

testRoutes();