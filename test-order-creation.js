const axios = require('axios');

async function testOrderCreation() {
  try {
    console.log('Testing order creation...');
    
    const response = await axios.post('http://localhost:3000/api/orders', {
      plan_id: 1,
      payment_method: 'alipay'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzU5NzcyNDg1fQ.N1cSVEGedaGe3M3RykBfXAex8RJYOUTcHg-RJdIezlM'
      }
    });
    
    console.log('Order creation successful:', response.data);
  } catch (error) {
    console.error('Order creation failed:', error.response ? error.response.data : error.message);
  }
}

testOrderCreation();