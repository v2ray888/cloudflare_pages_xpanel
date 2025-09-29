const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post('http://127.0.0.1:8787/api/auth/login', {
      email: 'admin@xpanel.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Token:', response.data.data.token);
    console.log('User:', response.data.data.user);
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testLogin();