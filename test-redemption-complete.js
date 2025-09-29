// 完整测试兑换功能
const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:8787';

// 测试用户凭据
const testUser = {
  email: 'admin@xpanel.com',
  password: 'admin123'
};

async function testRedemption() {
  try {
    console.log('Testing redemption API...');
    
    // 1. 登录获取token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful, token obtained');
    
    // 2. 测试兑换码API（使用一个不存在的兑换码）
    console.log('2. Testing redemption with non-existent code...');
    try {
      const redeemResponse = await axios.post(`${BASE_URL}/api/redemption/redeem`, {
        code: 'NONEXISTENT123'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Redeem response:', redeemResponse.data);
    } catch (redeemError) {
      if (redeemError.response) {
        console.log('Redeem error (expected):', redeemError.response.data);
        console.log('Redeem status:', redeemError.response.status);
      } else {
        console.log('Redeem error:', redeemError.message);
      }
    }
    
    console.log('Test completed successfully - API is accessible');
    
  } catch (error) {
    if (error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Error Status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testRedemption();