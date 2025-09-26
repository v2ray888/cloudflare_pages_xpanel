const axios = require('axios');

async function testRegister() {
  try {
    console.log('正在测试注册功能...');
    const response = await axios.post('http://127.0.0.1:8787/auth/register', {
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      username: 'testuser'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('注册成功:', response.data);
  } catch (error) {
    console.error('注册失败:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
  }
}

testRegister();