const axios = require('axios');

async function testRecentOrders() {
  console.log('Testing recent orders API endpoint...\n');
  
  try {
    // Test recent orders endpoint
    console.log('1. Testing /api/admin/recent-orders...');
    const ordersResponse = await axios.get('http://127.0.0.1:8787/api/admin/recent-orders', {
      headers: {
        'Origin': 'http://localhost:3004',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzU5NjQ1MzY2fQ.wIzc0Y8Gllpp4iAhXJKifi4DMuTINitBAYy7o3Im6I4'
      }
    });
    
    console.log('Recent orders success:', ordersResponse.data.success);
    console.log('Orders count:', ordersResponse.data.data ? ordersResponse.data.data.length : 0);
    
    // Test recent users endpoint
    console.log('\n2. Testing /api/admin/recent-users...');
    const usersResponse = await axios.get('http://127.0.0.1:8787/api/admin/recent-users', {
      headers: {
        'Origin': 'http://localhost:3004',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzU5NjQ1MzY2fQ.wIzc0Y8Gllpp4iAhXJKifi4DMuTINitBAYy7o3Im6I4'
      }
    });
    
    console.log('Recent users success:', usersResponse.data.success);
    console.log('Users count:', usersResponse.data.data ? usersResponse.data.data.length : 0);
    
    console.log('\nAPI endpoint test completed successfully!');
  } catch (error) {
    console.error('Error during API test:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testRecentOrders();