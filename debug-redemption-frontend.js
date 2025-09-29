// 调试前端兑换码API调用的简单脚本
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

// 模拟前端API调用
async function getRedemptionCodesFrontendStyle(token) {
  try {
    const params = { page: 1, limit: 20 };
    const response = await axios.get('http://localhost:8787/api/admin/redemption', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: params
    });
    
    console.log('前端风格的API调用响应:');
    console.log('Response data structure:');
    console.log('- response.data:', typeof response.data);
    console.log('- response.data.success:', response.data.success);
    console.log('- response.data.data:', typeof response.data.data);
    console.log('- response.data.data.data:', Array.isArray(response.data.data.data) ? `Array with ${response.data.data.data.length} items` : response.data.data.data);
    console.log('- response.data.data.total:', response.data.data.total);
    
    // 模拟前端代码中的解构
    const codesData = response.data;
    const codes = codesData?.data?.data || [];
    const total = codesData?.data?.total || 0;
    
    console.log('\n前端代码中的变量:');
    console.log('- codesData:', codesData ? 'exists' : 'undefined');
    console.log('- codes:', Array.isArray(codes) ? `Array with ${codes.length} items` : codes);
    console.log('- total:', total);
    
    return { codes, total };
  } catch (error) {
    console.error('获取兑换码列表失败:', error.response?.data || error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('开始调试前端兑换码API调用...');
  
  // 登录获取token
  const token = await login();
  if (!token) {
    console.log('无法获取认证token，退出测试');
    return;
  }
  
  // 模拟前端API调用
  const result = await getRedemptionCodesFrontendStyle(token);
  if (result) {
    console.log('\n调试完成');
    console.log(`获取到 ${result.codes.length} 个兑换码，总数: ${result.total}`);
  } else {
    console.log('调试失败');
  }
}

main();