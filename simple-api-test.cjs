const https = require('https');

// 测试plans API端点（我们知道这个是工作的）
const options1 = {
  hostname: 'xpanel.121858.xyz',
  port: 443,
  path: '/api/plans',
  method: 'GET'
};

console.log('测试 /api/plans 端点...');

const req1 = https.request(options1, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`内容类型: ${res.headers['content-type']}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('plans API响应数据长度:', data.length);
    
    // 尝试解析JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('plans API成功返回JSON数据');
    } catch (error) {
      console.error('解析plans API JSON时出错:', error.message);
    }
    
    // 现在测试withdrawals API端点
    console.log('\n测试 /api/withdrawals 端点...');
    const options2 = {
      hostname: 'xpanel.121858.xyz',
      port: 443,
      path: '/api/withdrawals',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzMwNDQ5NzUwfQ.8l_8z7_8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q'
      }
    };

    const req2 = https.request(options2, (res) => {
      console.log(`状态码: ${res.statusCode}`);
      console.log(`内容类型: ${res.headers['content-type']}`);
      
      let data2 = '';
      
      res.on('data', (chunk) => {
        data2 += chunk;
      });
      
      res.on('end', () => {
        console.log('withdrawals API响应数据长度:', data2.length);
        if (data2.length < 100 && data2.includes('<html')) {
          console.log('withdrawals API返回了HTML而不是JSON，这表明路由可能有问题');
        } else {
          // 尝试解析JSON
          try {
            const jsonData = JSON.parse(data2);
            console.log('withdrawals API成功返回JSON数据');
          } catch (error) {
            console.error('解析withdrawals API JSON时出错:', error.message);
          }
        }
      });
    });

    req2.on('error', (error) => {
      console.error('withdrawals API请求出错:', error);
    });

    req2.end();
  });
});

req1.on('error', (error) => {
  console.error('plans API请求出错:', error);
});

req1.end();