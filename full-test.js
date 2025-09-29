// 完整的API测试脚本
const http = require('http');

// 登录并获取令牌
const loginData = JSON.stringify({
  email: 'user1@example.com',
  password: 'admin123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 8787,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let loginResponse = '';
  
  res.on('data', (chunk) => {
    loginResponse += chunk;
  });
  
  res.on('end', () => {
    const loginResult = JSON.parse(loginResponse);
    console.log('登录结果:', loginResult);
    
    if (loginResult.success) {
      const token = loginResult.data.token;
      console.log('获取到的JWT令牌:', token);
      
      // 使用令牌测试服务器API
      const serverOptions = {
        hostname: 'localhost',
        port: 8787,
        path: '/api/servers',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const serverReq = http.request(serverOptions, (res) => {
        let serverResponse = '';
        
        res.on('data', (chunk) => {
          serverResponse += chunk;
        });
        
        res.on('end', () => {
          console.log('服务器API响应:');
          console.log(serverResponse);
        });
      });
      
      serverReq.on('error', (error) => {
        console.error('服务器API请求错误:', error);
      });
      
      serverReq.end();
    }
  });
});

loginReq.on('error', (error) => {
  console.error('登录请求错误:', error);
});

loginReq.write(loginData);
loginReq.end();