const axios = require('axios');

async function comprehensiveApiTest() {
  console.log('正在进行全面API测试...');
  console.log('时间:', new Date().toISOString());

  const baseUrl = 'https://xpanel.121858.xyz';
  
  // 测试不同的API端点
  const tests = [
    {
      name: '健康检查',
      url: '/api/health',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: '套餐列表',
      url: '/api/plans',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: '注册端点',
      url: '/api/auth/register',
      method: 'POST',
      data: {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        username: 'testuser'
      },
      expectedStatus: 200 // 或400（如果邮箱已被注册）
    },
    {
      name: '登录端点',
      url: '/api/auth/login',
      method: 'POST',
      data: {
        email: 'test@example.com',
        password: 'password123'
      },
      expectedStatus: 200 // 或400（如果凭证错误）
    },
    {
      name: '兑换端点',
      url: '/api/auth/redeem',
      method: 'POST',
      data: {
        code: 'TESTCODE123'
      },
      expectedStatus: 400 // 兑换码无效是预期的错误
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`\n🧪 测试: ${test.name}`);
      console.log(`   URL: ${test.method} ${baseUrl}${test.url}`);
      
      let response;
      if (test.method === 'POST') {
        response = await axios.post(`${baseUrl}${test.url}`, test.data, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        });
      } else {
        response = await axios.get(`${baseUrl}${test.url}`, {
          timeout: 15000
        });
      }
      
      console.log(`   ✅ 成功: ${response.status} ${response.data?.message || 'OK'}`);
      
      // 检查是否符合预期状态
      if (response.status === test.expectedStatus || 
          (test.expectedStatus === 200 && response.status === 200) ||
          (test.expectedStatus === 400 && response.status === 400)) {
        passedTests++;
        console.log(`   📋 符合预期`);
      } else {
        console.log(`   ⚠️  状态码不符合预期 (期望: ${test.expectedStatus}, 实际: ${response.status})`);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      console.log(`   ❌ 失败: ${status} ${message}`);
      
      // 检查是否符合预期的错误状态
      if (status === test.expectedStatus || 
          (test.expectedStatus === 400 && status === 400) ||
          (test.expectedStatus === 200 && status === 400 && message.includes('邮箱已被注册'))) {
        passedTests++;
        console.log(`   📋 错误符合预期`);
      } else {
        console.log(`   ⚠️  错误不符合预期 (期望状态: ${test.expectedStatus})`);
      }
      
      // 特别关注405错误
      if (status === 405) {
        console.log(`   💡 405错误表示请求方法不被允许，这通常意味着路由配置有问题`);
      }
    }
  }
  
  console.log(`\n\n📊 测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！API应该可以正常工作了。');
  } else {
    console.log('⚠️  部分测试未通过，请检查上述错误信息。');
  }
  
  console.log('\n💡 如果注册功能仍然无法工作，请：');
  console.log('   1. 等待Cloudflare Pages完成最新部署（可能需要几分钟）');
  console.log('   2. 清除浏览器缓存和Cookie');
  console.log('   3. 检查浏览器开发者工具中的网络请求');
  console.log('   4. 确认所有代码更改已推送到GitHub');
}

comprehensiveApiTest();