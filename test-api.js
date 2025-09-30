const http = require('http');

// 测试登录API
const data = JSON.stringify({
  email: 'admin@xpanel.com',
  password: 'admin'
});

console.log('正在发送请求到: http://127.0.0.1:8787/api/auth/login');
console.log('请求数据:', data);

const options = {
  hostname: '127.0.0.1',
  port: 8787,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

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
    
    // 检查是否是UTF-8编码
    console.log('响应数据的Buffer表示:');
    console.log(Buffer.from(responseData, 'utf8'));
    
    console.log('解析后的JSON:');
    try {
      const jsonData = JSON.parse(responseData);
      console.log(jsonData);
      
      // 检查消息字段是否正确显示中文
      if (jsonData.message) {
        console.log('消息字段内容:', jsonData.message);
        console.log('消息字段UTF-8编码:', Buffer.from(jsonData.message, 'utf8').toString('hex'));
      }
    } catch (error) {
      console.error('解析JSON时出错:', error);
      console.log('原始响应数据:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('请求出错:', error);
});

req.write(data);
req.end();

// 设置超时
req.setTimeout(5000, () => {
  console.error('请求超时');
  req.destroy();
});