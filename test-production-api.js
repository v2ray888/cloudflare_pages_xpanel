const axios = require('axios');

// 替换为您的实际 Cloudflare Pages URL
const BASE_URL = process.env.BASE_URL || 'https://xpanel.121858.xyz';

async function testAPI() {
  console.log('正在测试生产环境API端点...');
  console.log(`Base URL: ${BASE_URL}`);

  try {
    // 测试根路径
    console.log('\n1. 测试根路径...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('根路径响应:', rootResponse.status);

    // 测试测试端点
    console.log('\n2. 测试/test端点...');
    const testResponse = await axios.get(`${BASE_URL}/test`);
    console.log('测试端点响应:', testResponse.status, testResponse.data);

    // 测试健康检查端点
    console.log('\n3. 测试/health端点...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('健康检查响应:', healthResponse.status, healthResponse.data?.message || 'OK');

    // 测试API端点
    console.log('\n4. 测试API端点...');
    try {
      const apiResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('API健康检查响应:', apiResponse.status, apiResponse.data?.message || 'OK');
    } catch (apiError) {
      console.log('API健康检查失败:', apiError.response?.status, apiError.response?.data || apiError.message);
      
      // 检查是否返回了前端页面（说明路由未正确配置）
      if (apiError.response?.data?.includes('<!doctype html>')) {
        console.log('⚠️  警告：API请求被重定向到前端页面，可能是路由配置问题');
      }
    }

    // 测试注册端点（POST请求）
    console.log('\n5. 测试注册端点...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        username: 'testuser'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('注册端点响应:', registerResponse.status, registerResponse.data);
    } catch (registerError) {
      console.log('注册端点测试:', registerError.response?.status, registerError.response?.data || registerError.message);
      
      // 特别关注405错误
      if (registerError.response?.status === 405) {
        console.log('❌ 405错误表示API路由未正确配置或Functions未部署');
        console.log('💡 建议：');
        console.log('   1. 检查_functions目录结构');
        console.log('   2. 重新部署Pages项目');
        console.log('   3. 考虑使用独立Workers部署API');
      }
    }

    // 测试其他可能的API端点
    console.log('\n6. 测试其他API端点...');
    const endpoints = [
      '/api/plans',
      '/api/auth/login'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        console.log(`${endpoint}:`, response.status);
      } catch (error) {
        console.log(`${endpoint}:`, error.response?.status || error.message);
        
        // 检查是否返回了前端页面
        if (error.response?.data?.includes('<!doctype html>')) {
          console.log(`   ⚠️ ${endpoint} 请求被重定向到前端页面`);
        }
      }
    }

  } catch (error) {
    console.error('测试过程中发生错误:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
  
  console.log('\n📋 诊断建议：');
  console.log('1. 如果API端点返回405错误，说明Functions未正确部署');
  console.log('2. 如果API端点返回前端页面HTML，说明路由配置不正确');
  console.log('3. 请检查_functions目录结构和_routes.json配置');
  console.log('4. 考虑使用独立Workers部署API服务');
}

testAPI();