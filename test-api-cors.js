const http = require('http');

// First, let's test OPTIONS request (CORS preflight)
const optionsRequest = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/admin-login',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3001',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
};

console.log('Testing OPTIONS request (CORS preflight)...');

const optionsReq = http.request(optionsRequest, (res) => {
  console.log('OPTIONS Response Status:', res.statusCode);
  console.log('OPTIONS Response Headers:', res.headers);
  
  res.on('data', (chunk) => {
    // Do nothing with data
  });
  
  res.on('end', () => {
    console.log('OPTIONS request completed');
    
    // Now test POST request
    setTimeout(() => {
      testPostRequest();
    }, 1000);
  });
});

optionsReq.on('error', (e) => {
  console.error(`OPTIONS request error: ${e.message}`);
});

optionsReq.end();

function testPostRequest() {
  console.log('Testing POST request...');
  
  const postData = JSON.stringify({
    email: 'admin@xpanel.com',
    password: 'admin123'
  });

  const postRequest = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/admin-login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': 'http://localhost:3001'
    }
  };

  const postReq = http.request(postRequest, (res) => {
    console.log('POST Response Status:', res.statusCode);
    console.log('POST Response Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('POST Response Body:', data);
    });
  });

  postReq.on('error', (e) => {
    console.error(`POST request error: ${e.message}`);
  });

  postReq.write(postData);
  postReq.end();
}