// 测试兑换码API的简单脚本
const axios = require('axios');

// 首先登录获取token
async function login() {
  try {
    const response = await axios.post('http://localhost:8787/api/auth/admin-login', {
      email: 'admin@xpanel.com',
      password: 'admin123'
    });
    
    console.log('登录成功');
    return response.data.data.token;
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    return null;
  }
}

// 获取兑换码列表
async function getRedemptionCodes(token) {
  try {
    const response = await axios.get('http://localhost:8787/api/admin/redemption?page=1&limit=20', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('兑换码列表响应:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('获取兑换码列表失败:', error.response?.data || error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('开始测试兑换码API...');
  
  // 登录获取token
  const token = await login();
  if (!token) {
    console.log('无法获取认证token，退出测试');
    return;
  }
  
  // 获取兑换码列表
  const codesData = await getRedemptionCodes(token);
  if (codesData) {
    console.log('API测试完成');
  } else {
    console.log('API测试失败');
  }
}

main();