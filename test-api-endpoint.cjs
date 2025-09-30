const https = require('https');

// 测试API端点
const options = {
  hostname: 'xpanel.121858.xyz',
  port: 443,
  path: '/api/withdrawals',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzMwNDQ5NzUwfQ.8l_8z7_8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'
  }
};

const req = https.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应数据:');
    console.log(data);
    
    // 尝试解析JSON
    try {
      const jsonData = JSON.parse(data);
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