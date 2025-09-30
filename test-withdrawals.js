const http = require('http');

// 简单的测试脚本，用于验证提现API是否正常工作
async function testWithdrawalsAPI() {
  try {
    // 模拟API调用
    const response = await fetch('http://127.0.0.1:8787/api/withdrawals', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzU5MjA0MDE3fQ.4iJnZsZsZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testWithdrawalsAPI();

// 测试获取提现记录API
const options = {
  hostname: '127.0.0.1',
  port: 8787,
  path: '/api/withdrawals',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzU5MjA0MDE3fQ.4iJnZsZsZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
  }
};

console.log('正在请求提现记录...');

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('响应数据:');
    console.log(responseData);
    
    try {
      const jsonData = JSON.parse(responseData);
      console.log('解析后的JSON:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.error('解析JSON时出错:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('请求出错:', error);
});

req.end();