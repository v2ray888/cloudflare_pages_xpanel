const axios = require('axios');

async function testLogin() {
  try {
    console.log('正在测试登录功能...');
    const response = await axios.post('http://127.0.0.1:8787/auth/login', {
      email: 'test1758915333741@example.com',
      password: 'password123'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('登录成功:', response.data);
  } catch (error) {
    console.error('登录失败:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
  }
}

testLogin();