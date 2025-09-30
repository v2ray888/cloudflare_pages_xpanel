const axios = require('axios');

async function testOrderCreation() {
  try {
    const response = await axios.post('http://localhost:3000/api/orders', {
      plan_id: 1,
      payment_method: 'alipay'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzU5NzI4Mzg0fQ.DtD7rwJJqoTU6aWT3B_7Te2fdU4hQIua785OBKFANTc'
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testOrderCreation();