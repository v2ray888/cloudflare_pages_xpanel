const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login with CORS fix...');
    
    const response = await axios.post('http://127.0.0.1:8787/api/auth/admin-login', {
      email: 'admin@xpanel.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
        // Note: We're not setting Origin header here, but the server should now allow our frontend origin
      }
    });
    
    console.log('Admin login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function testPreflight() {
  try {
    console.log('Testing CORS preflight request...');
    
    const response = await axios.options('http://127.0.0.1:8787/api/auth/admin-login', {
      headers: {
        'Origin': 'http://127.0.0.1:3003',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('Preflight response status:', response.status);
    console.log('Preflight response headers:', response.headers);
    return response;
  } catch (error) {
    console.error('Preflight error:', error.response ? error.response.status : error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('Running CORS tests...\n');
  
  await testPreflight();
  console.log('\n---\n');
  await testAdminLogin();
}

runTests();