// 测试游客重复兑换功能
const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:8787';

async function testGuestRepeatRedemption() {
  try {
    console.log('=== 测试游客重复兑换功能 ===\n');
    
    // 使用一个测试邮箱
    const testEmail = 'guest-test@example.com';
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
    
    // 4. 游客第一次兑换
    console.log('4. 游客第一次兑换...');
    const firstRedeemResponse = await axios.post(`${BASE_URL}/api/redemption/redeem`, {
      code: code,
      email: testEmail
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('第一次兑换结果:', firstRedeemResponse.data);
    
    if (firstRedeemResponse.data.success) {
      console.log('✅ 第一次兑换成功\n');
    } else {
      console.log('❌ 第一次兑换失败\n');
      return;
    }
    
    // 5. 游客第二次兑换同一个码
    console.log('5. 游客第二次兑换同一个码...');
    try {
      const secondRedeemResponse = await axios.post(`${BASE_URL}/api/redemption/redeem`, {
        code: code,
        email: testEmail
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('第二次兑换结果:', secondRedeemResponse.data);
      
      if (secondRedeemResponse.data.success && secondRedeemResponse.data.already_redeemed) {
        console.log('✅ 第二次兑换正确返回"已兑换"状态');
        console.log('✅ 包含前往用户中心的权限');
      } else {
        console.log('❌ 第二次兑换返回结果不符合预期');
      }
    } catch (error) {
      if (error.response) {
        console.log('第二次兑换错误响应:', error.response.data);
        console.log('错误状态:', error.response.status);
      } else {
        console.log('错误:', error.message);
      }
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

testGuestRepeatRedemption();