// 测试兑换结果显示修复
const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:8787';

// 测试用户凭据
const testUser = {
  email: 'admin@xpanel.com',
  password: 'admin123'
};

async function testRedemptionDisplay() {
  try {
    console.log('Testing redemption display fix...');
    
    // 1. 登录获取token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful, token obtained');
    
    // 2. 获取一个有效的套餐ID
    console.log('2. Getting plans...');
    const plansResponse = await axios.get(`${BASE_URL}/api/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const plans = plansResponse.data.data;
    console.log('Available plans:', plans);
    
    if (plans.length === 0) {
      console.log('No plans available, creating a test plan...');
      // 如果没有套餐，创建一个测试套餐
      const createPlanResponse = await axios.post(`${BASE_URL}/api/admin/plans`, {
        name: '测试套餐',
        description: '用于测试的套餐',
        price: 10.00,
        duration_days: 30,
        traffic_gb: 100,
        device_limit: 3,
        is_active: 1,
        is_public: 1
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Created plan:', createPlanResponse.data);
      plans.push(createPlanResponse.data.data);
    }
    
    const planId = plans[0].id;
    console.log('Using plan ID:', planId);
    
    // 3. 生成一个兑换码
    console.log('3. Generating redemption code...');
    const generateResponse = await axios.post(`${BASE_URL}/api/admin/redemption/generate`, {
      plan_id: planId,
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
    
    // 4. 兑换这个码
    console.log('4. Redeeming code...');
    const redeemResponse = await axios.post(`${BASE_URL}/api/redemption/redeem`, {
      code: code
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Redeem response:', redeemResponse.data);
    
    // 5. 检查返回的数据结构
    if (redeemResponse.data.success) {
      const data = redeemResponse.data.data;
      console.log('Redemption data structure:');
      console.log('- plan_name:', data.plan_name);
      console.log('- duration_days:', data.duration_days);
      console.log('- traffic_gb:', data.traffic_gb);
      console.log('- device_limit:', data.device_limit);
      
      // 验证所有字段都存在且有值
      if (data.plan_name && data.duration_days && data.traffic_gb !== undefined && data.device_limit !== undefined) {
        console.log('✅ All data fields are present and correct!');
      } else {
        console.log('❌ Some data fields are missing or incorrect');
      }
    } else {
      console.log('Redemption failed:', redeemResponse.data.message);
    }
    
    console.log('Test completed successfully');
    
  } catch (error) {
    if (error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Error Status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRedemptionDisplay();