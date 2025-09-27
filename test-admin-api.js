// 测试管理员API的脚本
async function testAdminAPI() {
  try {
    // 1. 登录获取token
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
    
    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.data.token;
    console.log('Token:', token);
    
    // 2. 测试创建套餐
    const planData = {
      name: 'Test Plan',
      price: 10,
      duration_days: 30,
      traffic_gb: 100
    };
    
    const planResponse = await fetch('https://xpanel.121858.xyz/api/admin/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planData)
    });
    
    const planText = await planResponse.text();
    console.log('Plan response text:', planText);
    
    const planResult = JSON.parse(planText);
    console.log('Plan creation response:', planResult);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// 运行测试
testAdminAPI();