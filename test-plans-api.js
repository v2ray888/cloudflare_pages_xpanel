const axios = require('axios');

async function testPlansAPI() {
  console.log('Testing /api/plans endpoint...\n');
  
  try {
    // Test the plans API endpoint
    console.log('1. Testing GET /api/plans...');
    const response = await axios.get('http://127.0.0.1:8787/api/plans', {
      headers: {
        'Origin': 'http://127.0.0.1:3003'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Plans count:', response.data.data ? response.data.data.length : 0);
    
    // Test OPTIONS request
    console.log('\n2. Testing OPTIONS /api/plans...');
    const optionsResponse = await axios.options('http://127.0.0.1:8787/api/plans', {
      headers: {
        'Origin': 'http://127.0.0.1:3003',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization'
      }
    });
    
    console.log('OPTIONS Status:', optionsResponse.status);
    console.log('Allow-Origin:', optionsResponse.headers['access-control-allow-origin']);
    console.log('Allow-Methods:', optionsResponse.headers['access-control-allow-methods']);
    console.log('Allow-Headers:', optionsResponse.headers['access-control-allow-headers']);
    
    console.log('\nAPI endpoint test completed successfully!');
  } catch (error) {
    console.error('Error during API test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Run the test
testPlansAPI();