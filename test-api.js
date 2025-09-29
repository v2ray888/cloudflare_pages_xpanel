const axios = require('axios');

async function testApi() {
  try {
    // First, login to get a valid token
    const loginResponse = await axios.post('http://localhost:8787/api/auth/admin-login', {
      email: 'admin@xpanel.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('Token:', token);

    // Test the referral commissions API
    const commissionsResponse = await axios.get('http://localhost:8787/api/admin/referrals/commissions?page=1&limit=20', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Commissions API Response:', commissionsResponse.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testApi();