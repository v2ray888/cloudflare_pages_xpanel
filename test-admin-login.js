const axios = require('axios');

async function testAdminLogin() {
  console.log('Testing admin login...');
  
  try {
    console.log('Sending request to http://localhost:3000/api/auth/admin-login');
    const response = await axios.post('http://localhost:3000/api/auth/admin-login', {
      email: 'admin@xpanel.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Login Response:', response.data);
    
    if (response.data.success) {
      console.log('Admin login successful!');
      console.log('User:', response.data.data.user);
      console.log('Token:', response.data.data.token);
    } else {
      console.log('Login failed:', response.data.message);
    }
  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testAdminLogin();