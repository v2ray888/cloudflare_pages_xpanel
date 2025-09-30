const http = require('http');

// 测试本地withdrawals API端点
console.log('测试本地 /api/withdrawals 端点...');

const options = {
  hostname: '127.0.0.1',
  port: 8788,
  path: '/api/withdrawals',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzU5MjY0MDkwLCJpYXQiOjE3NTkyNjA0OTB9.fIPQ3bRR-0FQOTO8Wb0IFwnc_x-H1LspEfKfVfm7CRA'
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`内容类型: ${res.headers['content-type']}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('本地API响应数据长度:', data.length);
    console.log('前200个字符:', data.substring(0, 200));
    
    // 尝试解析JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('本地API成功返回JSON数据');
      console.log('数据结构:', Object.keys(jsonData));
      if (jsonData.data) {
        console.log('数据内容:', jsonData.data);
      }
    } catch (error) {
      console.error('解析本地API JSON时出错:', error.message);
      console.log('完整响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('本地API请求出错:', error);
});

req.end();