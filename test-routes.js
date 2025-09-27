// 测试路由配置的脚本
async function testRoutes() {
  try {
    // 测试健康检查端点
    console.log('Testing health check endpoint...');
    const healthResponse = await fetch('https://xpanel.121858.xyz/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    
    // 测试管理员简单测试端点
    console.log('\nTesting admin simple test endpoint...');
    const simpleTestResponse = await fetch('https://xpanel.121858.xyz/api/admin/simple-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' })
    });
    
    const simpleTestData = await simpleTestResponse.json();
    console.log('Admin simple test response:', simpleTestData);
    
    // 测试登录端点
    console.log('\nTesting login endpoint...');
    const loginResponse = await fetch('https://xpanel.121858.xyz/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@xpanel.com',
        password: 'admin123'
      })
    });
    
    const loginText = await loginResponse.text();
    console.log('Login response text:', loginText);
    
    const loginData = JSON.parse(loginText);
    console.log('Login response:', loginData);
    
    // 如果登录成功且有token，测试管理员套餐管理端点
    if (loginData.success && loginData.data && loginData.data.token) {
      console.log('\nTesting admin plans endpoint...');
      const plansResponse = await fetch('https://xpanel.121858.xyz/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.data.token}`
        },
        body: JSON.stringify({
          name: 'Test Plan',
          price: 10,
          duration_days: 30,
          traffic_gb: 100
        })
      });
      
      const plansText = await plansResponse.text();
      console.log('Plans response text:', plansText);
      
      try {
        const plansData = JSON.parse(plansText);
        console.log('Plans response:', plansData);
      } catch (e) {
        console.log('Failed to parse plans response as JSON');
      }
    } else {
      console.log('\nLogin failed or no token returned, skipping admin plans test');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// 运行测试
testRoutes();