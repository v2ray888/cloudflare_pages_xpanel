// Test script to verify automatic expiration date calculation
const testExpirationDateCalculation = () => {
  console.log('Testing automatic expiration date calculation...\n');
  
  // 模拟套餐数据
  const plans = [
    { id: 1, name: '月付套餐', duration_days: 30 },
    { id: 2, name: '季付套餐', duration_days: 90 },
    { id: 3, name: '年付套餐', duration_days: 365 },
    { id: 4, name: '半年套餐', duration_days: 180 }
  ];
  
  // 测试函数：根据套餐ID计算过期时间
  const calculateExpirationDate = (planId) => {
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (!selectedPlan) {
      console.log(`套餐ID ${planId} 未找到`);
      return null;
    }
    
    // 计算过期时间：当前时间 + 套餐天数
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + selectedPlan.duration_days);
    
    // 格式化为datetime-local输入框所需的格式 (YYYY-MM-DDTHH:mm)
    const formattedDate = expirationDate.toISOString().slice(0, 16);
    
    console.log(`套餐: ${selectedPlan.name} (${selectedPlan.duration_days}天)`);
    console.log(`当前时间: ${new Date().toISOString().slice(0, 16)}`);
    console.log(`过期时间: ${formattedDate}`);
    console.log('---');
    
    return formattedDate;
  };
  
  // 测试所有套餐
  plans.forEach(plan => {
    calculateExpirationDate(plan.id);
  });
  
  console.log('✅ Expiration date calculation test completed');
};

// Run the test
testExpirationDateCalculation();