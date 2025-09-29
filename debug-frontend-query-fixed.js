// 调试前端React Query数据处理的简单脚本（修复版）
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

// 模拟前端React Query的数据处理（修复版）
async function simulateReactQueryFixed(token) {
  try {
    const params = { page: 1, limit: 20 };
    const response = await axios.get('http://localhost:8787/api/admin/redemption', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: params
    });
    
    console.log('API响应:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 模拟修复后的React Query处理逻辑
    console.log('\n--- 修复后的React Query数据处理模拟 ---');
    
    // queryFn返回response.data
    const queryFnResult = response.data;
    console.log('queryFn返回的数据:', typeof queryFnResult);
    console.log('- success:', queryFnResult.success);
    console.log('- data字段存在:', !!queryFnResult.data);
    
    // 组件中使用数据（修复后的正确方式）
    const codesData = queryFnResult;
    const codes = codesData?.data?.data || [];
    const total = codesData?.data?.total || 0;
    
    console.log('\n修复后组件中使用的数据:');
    console.log('- codesData:', codesData ? 'exists' : 'undefined');
    console.log('- codes数组长度:', codes.length);
    console.log('- total:', total);
    
    if (codes.length > 0) {
      console.log('\n前3个兑换码:');
      codes.slice(0, 3).forEach((code, index) => {
        console.log(`  ${index + 1}. ${code.code} (ID: ${code.id})`);
      });
    }
    
    return { codes, total };
  } catch (error) {
    console.error('获取兑换码列表失败:', error.response?.data || error.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('开始调试修复后的前端React Query数据处理...');
  
  // 登录获取token
  const token = await login();
  if (!token) {
    console.log('无法获取认证token，退出测试');
    return;
  }
  
  // 模拟修复后的React Query处理
  const result = await simulateReactQueryFixed(token);
  if (result) {
    console.log('\n调试完成');
    console.log(`获取到 ${result.codes.length} 个兑换码，总数: ${result.total}`);
  } else {
    console.log('调试失败');
  }
}

main();