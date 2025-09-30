// 模拟前端订单创建流程
async function testFrontendOrderCreation() {
  try {
    console.log('Testing frontend order creation flow...');
    
    // 模拟用户已登录状态
    const user = { id: 1, email: 'admin@xpanel.com' };
    console.log('User logged in:', user);
    
    // 模拟选择套餐
    const selectedPlan = { id: 1, name: '月付套餐', price: 10 };
    console.log('Selected plan:', selectedPlan);
    
    // 模拟调用订单创建API
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzU5NzcyNDg1fQ.N1cSVEGedaGe3M3RykBfXAex8RJYOUTcHg-RJdIezlM'
      },
      body: JSON.stringify({
        plan_id: selectedPlan.id,
        payment_method: 'alipay'
      })
    });
    
    const data = await response.json();
    console.log('Order creation response:', data);
    
    if (data.success) {
      console.log('Order created successfully, navigating to payment page...');
      console.log(`Would navigate to: /payment/${data.data.id}`);
    } else {
      console.error('Order creation failed:', data.message);
    }
  } catch (error) {
    console.error('Frontend order creation test failed:', error);
  }
}

testFrontendOrderCreation();