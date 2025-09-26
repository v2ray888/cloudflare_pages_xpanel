const axios = require('axios');

async function testVerify() {
  try {
    console.log('正在测试 token 验证功能...');
    const response = await axios.get('http://127.0.0.1:8787/auth/verify', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ0ZXN0MTc1ODkxNTMzMzc0MUBleGFtcGxlLmNvbSIsInJvbGUiOjAsImV4cCI6MTc1OTUyMDE0M30.mqdkEG9Q0Y6UnViMJG6omqEYMcvQC6JqxnD-vOWP-qk'
      },
      timeout: 10000
    });
    
    console.log('Token 验证成功:', response.data);
  } catch (error) {
    console.error('Token 验证失败:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
  }
}

testVerify();