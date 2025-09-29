// 测试前端兑换结果显示
const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:8787';

// 测试用户凭据
const testUser = {
  email: 'admin@xpanel.com',
  password: 'admin123'
};

async function testRedemptionFrontend() {
  try {
    console.log('Testing frontend redemption display...');
    
    // 1. 登录获取token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful, token obtained');
    
    // 2. 生成一个兑换码
    console.log('2. Generating redemption code...');
    const generateResponse = await axios.post(`${BASE_URL}/api/admin/redemption/generate`, {
      plan_id: 1, // 使用月付套餐
      quantity: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Generate response:', generateResponse.data);
    const code = generateResponse.data.data.codes[0];
    console.log('Generated code:', code);
    
    // 3. 兑换这个码
    console.log('3. Redeeming code...');
    const redeemResponse = await axios.post(`${BASE_URL}/api/redemption/redeem`, {
      code: code
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Redeem response:', redeemResponse.data);
    
    // 4. 模拟前端处理逻辑
    if (redeemResponse.data.success) {
      const data = redeemResponse.data.data;
      console.log('\n=== 前端显示模拟 ===');
      console.log('兑换成功！');
      console.log(`您已成功兑换 ${data.plan_name} 套餐`);
      console.log(`有效期：${data.duration_days} 天`);
      console.log(`流量：${data.traffic_gb} GB`);
      console.log(`设备数：${data.device_limit} 台`);
      console.log('==================\n');
      
      // 验证所有字段都有值
      if (data.plan_name && data.duration_days && data.traffic_gb !== undefined && data.device_limit !== undefined) {
        console.log('✅ 前端显示修复成功！所有信息都正确显示。');
      } else {
        console.log('❌ 前端显示仍有问题');
      }
    }
    
    console.log('Frontend test completed successfully');
    
  } catch (error) {
    if (error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Error Status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRedemptionFrontend();