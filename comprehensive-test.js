// 综合测试脚本
async function comprehensiveTest() {
  try {
    console.log('=== XPanel 综合测试 ===\n');
    
    // 1. 测试健康检查
    console.log('1. 测试健康检查端点...');
    const healthResponse = await fetch('https://xpanel.121858.xyz/api/health');
    const healthData = await healthResponse.json();
    console.log('健康检查响应:', JSON.stringify(healthData, null, 2));
    
    // 2. 测试登录
    console.log('\n2. 测试管理员登录...');
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
      console.log('登录响应:', JSON.stringify(loginData, null, 2));
    } catch (e) {
      console.log('无法解析登录响应为 JSON');
      return;
    }
    
    // 3. 检查是否有 token
    if (loginData.success && loginData.data && loginData.data.token) {
      const token = loginData.data.token;
      console.log('\n✅ 成功获取 JWT token');
      console.log('Token 长度:', token.length);
      
      // 4. 测试管理员套餐管理 API
      console.log('\n3. 测试管理员套餐管理 API...');
      const plansResponse = await fetch('https://xpanel.121858.xyz/api/admin/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: '测试套餐',
          price: 9.9,
          duration: 30,
          details: '{}',
          is_active: 1,
          is_public: 1
        })
      });
      
      const plansText = await plansResponse.text();
      console.log('套餐管理响应文本:', plansText);
      
      try {
        const plansData = JSON.parse(plansText);
        console.log('套餐管理响应:', JSON.stringify(plansData, null, 2));
        
        if (plansData.success) {
          console.log('\n✅ 所有测试通过！系统正常工作。');
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
      if (loginData.message) {
        console.log('错误消息:', loginData.message);
      }
      if (loginData.data) {
        console.log('登录数据:', JSON.stringify(loginData.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

// 运行测试
comprehensiveTest();