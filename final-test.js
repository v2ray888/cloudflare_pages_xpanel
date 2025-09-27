// 最终测试脚本
async function finalTest() {
  try {
    console.log('=== 最终测试 ===');
    
    // 1. 测试健康检查
    console.log('\n1. 测试健康检查端点...');
    const healthResponse = await fetch('https://xpanel.121858.xyz/api/health');
    const healthData = await healthResponse.json();
    console.log('健康检查响应:', healthData);
    
    // 2. 测试登录
    console.log('\n2. 测试登录...');
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
    console.log('登录响应文本:', loginText);
    
    let loginData;
    try {
      loginData = JSON.parse(loginText);
      console.log('登录响应:', loginData);
    } catch (e) {
      console.log('无法解析登录响应为 JSON');
      return;
    }
    
    // 3. 检查是否有 token
    if (loginData.success && loginData.data && loginData.data.token) {
      const token = loginData.data.token;
      console.log('\n成功获取 token:', token);
      
      // 4. 测试管理员套餐管理 API
      console.log('\n3. 测试管理员套餐管理 API...');
      const plansResponse = await fetch('https://xpanel.121858.xyz/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test Plan',
          price: 10,
          duration_days: 30,
          traffic_gb: 100
        })
      });
      
      const plansText = await plansResponse.text();
      console.log('套餐管理响应文本:', plansText);
      
      try {
        const plansData = JSON.parse(plansText);
        console.log('套餐管理响应:', plansData);
        
        if (plansData.success) {
          console.log('\n✅ 所有测试通过！');
        } else {
          console.log('\n❌ 套餐管理 API 调用失败:', plansData.message);
        }
      } catch (e) {
        console.log('\n❌ 无法解析套餐管理响应为 JSON');
        console.log('状态码:', plansResponse.status);
        console.log('状态文本:', plansResponse.statusText);
      }
    } else {
      console.log('\n❌ 登录失败或未返回 token');
      if (loginData.data) {
        console.log('登录数据:', loginData.data);
      }
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

// 运行测试
finalTest();