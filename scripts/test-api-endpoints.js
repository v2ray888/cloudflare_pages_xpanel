const axios = require('axios');

async function testApiEndpoints() {
  console.log('正在测试API端点...');
  console.log('时间:', new Date().toISOString());

  const baseUrl = 'https://xpanel.121858.xyz';
  
  // 测试不同的API端点
  const endpoints = [
    { url: '/api/health', method: 'GET', description: '健康检查' },
    { url: '/api/auth/register', method: 'POST', description: '注册' },
    { url: '/api/auth/login', method: 'POST', description: '登录' },
    { url: '/api/plans', method: 'GET', description: '套餐列表' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n测试 ${endpoint.description}: ${endpoint.method} ${baseUrl}${endpoint.url}`);
      
      let response;
      if (endpoint.method === 'POST') {
        response = await axios.post(`${baseUrl}${endpoint.url}`, {
          email: `test${Date.now()}@example.com`,
          password: 'password123'
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
      } else {
        response = await axios.get(`${baseUrl}${endpoint.url}`, {
          timeout: 10000
        });
      }
      
      console.log(`✅ ${endpoint.description} 成功:`, response.status, response.data?.message || 'OK');
    } catch (error) {
      console.log(`❌ ${endpoint.description} 失败:`, error.response?.status, error.response?.data?.message || error.message);
      
      // 特别关注405错误
      if (error.response?.status === 405) {
        console.log(`   💡 405错误表示请求方法不被允许，可能是路由配置问题`);
      }
    }
  }
  
  console.log('\n测试完成。如果注册端点仍然返回405，请检查以下内容：');
  console.log('1. Functions目录结构是否正确');
  console.log('2. _routes.json配置是否包含/api/*路径');
  console.log('3. 主路由文件中是否正确挂载了authRoutes');
  console.log('4. Cloudflare Pages是否已完成最新部署');
}

testApiEndpoints();