const axios = require('axios');

async function testCORSFix() {
  console.log('Testing CORS fix with dynamic origin handling...\n');
  
  // Test different origins to simulate various development environments
  const testOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3003',
    'https://my-project.pages.dev'
  ];

  for (const origin of testOrigins) {
    console.log(`Testing with origin: ${origin}`);
    
    try {
      // Test preflight request
      const preflightResponse = await axios.options('http://127.0.0.1:8787/api/auth/admin-login', {
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      console.log(`  Preflight status: ${preflightResponse.status}`);
      console.log(`  Allow-Origin header: ${preflightResponse.headers['access-control-allow-origin']}`);
      
      // Test actual request
      const loginResponse = await axios.post('http://127.0.0.1:8787/api/auth/admin-login', {
        email: 'admin@xpanel.com',
        password: 'admin123'
      }, {
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`  Login status: ${loginResponse.status}`);
      console.log(`  Response Allow-Origin: ${loginResponse.headers['access-control-allow-origin']}`);
      console.log(`  Login success: ${loginResponse.data.success}\n`);
    } catch (error) {
      console.log(`  Error: ${error.response ? error.response.status : error.message}`);
      if (error.response && error.response.data) {
        console.log(`  Error message: ${JSON.stringify(error.response.data)}\n`);
      } else {
        console.log(`  Error details: ${error.message}\n`);
      }
    }
  }
}

// Run the test
testCORSFix();