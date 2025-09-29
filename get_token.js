const axios = require('axios');

async function getAdminToken() {
  try {
    const response = await axios.post('http://localhost:8787/api/auth/admin-login', {
      email: 'admin@xpanel.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
    if (response.data.success && response.data.data.token) {
      console.log('Token:', response.data.data.token);
      return response.data.data.token;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

getAdminToken();