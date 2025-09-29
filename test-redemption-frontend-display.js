// 测试前端显示效果
const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:8787';

async function testFrontendDisplay() {
  try {
    console.log('=== 测试前端显示效果 ===\n');
    
    // 使用一个测试邮箱
    const testEmail = 'frontend-test@example.com';
    const testPassword = 'test123456';
    
    // 1. 注册测试用户
    console.log('1. 注册测试用户...');
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        email: testEmail,
        password: testPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ 测试用户注册成功\n');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message.includes('已存在')) {
        console.log('✅ 测试用户已存在\n');
      } else {
        throw error;
      }
    }
    
    // 2. 登录管理员账户生成兑换码
    console.log('2. 管理员登录...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@xpanel.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ 管理员登录成功\n');
    
    // 3. 生成一个兑换码
    console.log('3. 生成兑换码...');
    const generateResponse = await axios.post(`${BASE_URL}/api/admin/redemption/generate`, {
      plan_id: 1, // 使用月付套餐
      quantity: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const code = generateResponse.data.data.codes[0];
    console.log(`✅ 兑换码生成成功: ${code}\n`);
    
    // 4. 模拟前端第一次兑换显示
    console.log('4. 模拟前端第一次兑换显示...');
    const firstRedeemResponse = await axios.post(`${BASE_URL}/api/redemption/redeem`, {
      code: code,
      email: testEmail
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (firstRedeemResponse.data.success) {
      const data = firstRedeemResponse.data.data;
      console.log('\n=== 第一次兑换前端显示 ===');
      console.log('兑换成功！');
      console.log(`您已成功兑换 ${data.plan_name} 套餐`);
      console.log(`有效期：${data.duration_days} 天`);
      console.log(`流量：${data.traffic_gb} GB`);
      console.log(`设备数：${data.device_limit} 台`);
      console.log('按钮显示：登录账户');
      console.log('提示信息：请登录账户查看您的订阅详情');
      console.log('========================\n');
    }
    
    // 5. 模拟前端重复兑换显示
    console.log('5. 模拟前端重复兑换显示...');
    const secondRedeemResponse = await axios.post(`${BASE_URL}/api/redemption/redeem`, {
      code: code,
      email: testEmail
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (secondRedeemResponse.data.success && secondRedeemResponse.data.already_redeemed) {
      const data = secondRedeemResponse.data.data;
      console.log('\n=== 重复兑换前端显示 ===');
      console.log('您已兑换过此兑换码！');
      console.log(`您已成功兑换 ${data.plan_name} 套餐`);
      console.log(`有效期：${data.duration_days} 天`);
      console.log(`流量：${data.traffic_gb} GB`);
      console.log(`设备数：${data.device_limit} 台`);
      console.log('按钮显示：前往用户中心');
      console.log('提示信息：（无）');
      console.log('======================\n');
    }
    
    console.log('✅ 前端显示测试完成');
    
  } catch (error) {
    if (error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Error Status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testFrontendDisplay();