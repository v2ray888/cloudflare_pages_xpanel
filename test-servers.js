const axios = require('axios');

async function testServersAPI() {
  try {
    // First login to get the token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://127.0.0.1:8787/api/auth/login', {
      email: 'admin@xpanel.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const token = loginResponse.data.data.token;
    console.log('Login successful! Token obtained.');
    
    // Now test the servers API
    console.log('Testing servers API...');
    const serversResponse = await axios.get('http://127.0.0.1:8787/api/user/servers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Servers API response:', JSON.stringify(serversResponse.data, null, 2));
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testServersAPI();