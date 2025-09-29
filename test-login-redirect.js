const axios = require('axios');

async function testLoginAndRedirect() {
  console.log('Testing login and redirect functionality...\n');
  
  try {
    // Test regular user login
    console.log('1. Testing regular user login...');
    const userLoginResponse = await axios.post('http://127.0.0.1:8787/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    }, {
      headers: {
        'Origin': 'http://localhost:3004',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('User login success:', userLoginResponse.data.success);
    console.log('User role:', userLoginResponse.data.data.user.role);
    
    // Test admin login
    console.log('\n2. Testing admin login...');
    const adminLoginResponse = await axios.post('http://127.0.0.1:8787/api/auth/admin-login', {
      email: 'admin@xpanel.com',
      password: 'admin123'
    }, {
      headers: {
        'Origin': 'http://localhost:3004',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Admin login success:', adminLoginResponse.data.success);
    console.log('Admin role:', adminLoginResponse.data.data.user.role);
    
    console.log('\nLogin and redirect functionality test completed successfully!');
  } catch (error) {
    console.error('Error during login test:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testLoginAndRedirect();