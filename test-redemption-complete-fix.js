// 完整测试兑换功能修复
const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:8787';

// 测试用户凭据
const testUser = {
  email: 'admin@xpanel.com',
  password: 'admin123'
};

async function testCompleteRedemptionFix() {
  try {
    console.log('=== 完整兑换功能修复测试 ===\n');
    
    // 1. 登录获取token
    console.log('1. 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功\n');
    
    // 2. 生成一个兑换码
    console.log('2. 生成兑换码...');
    const generateResponse = await axios.post(`${BASE_URL}/api/admin/redemption/generate`, {
      plan_id: 1, // 使用月付套餐
      quantity: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const code = generateResponse.data.data.codes[0];
    console.log(`✅ 兑换码生成成功: ${code}\n`);
    
    // 3. 兑换这个码
    console.log('3. 兑换码...');
    const redeemResponse = await axios.post(`${BASE_URL}/api/redemption/redeem`, {
      code: code
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 4. 验证返回的数据结构
    if (redeemResponse.data.success) {
      const data = redeemResponse.data.data;
      console.log('✅ 兑换成功\n');
      
      console.log('=== 兑换结果信息 ===');
      console.log(`套餐名称: ${data.plan_name}`);
      console.log(`有效期: ${data.duration_days} 天`);
      console.log(`流量: ${data.traffic_gb} GB`);
      console.log(`设备数: ${data.device_limit} 台`);
      console.log('==================\n');
      
      // 验证所有必需字段
      const requiredFields = ['plan_name', 'duration_days', 'traffic_gb', 'device_limit'];
      let allFieldsPresent = true;
      
      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
          console.log(`❌ 缺少字段: ${field}`);
          allFieldsPresent = false;
        }
      }
      
      if (allFieldsPresent) {
        console.log('✅ 所有字段都正确返回');
        console.log('✅ 前端显示修复完成');
      }
    } else {
      console.log('❌ 兑换失败:', redeemResponse.data.message);
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    if (error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Error Status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testCompleteRedemptionFix();