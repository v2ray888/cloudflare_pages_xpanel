// 测试兑换功能修复
const axios = require('axios');

// 测试数据
const testData = {
  code: 'TESTCODE123', // 需要替换为实际存在的兑换码
  email: 'test@example.com'
};

async function testRedemption() {
  try {
    console.log('Testing redemption API...');
    
    // 发送兑换请求
    const response = await axios.post('http://localhost:8787/api/redemption/redeem', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
    console.log('Status:', response.status);
    
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