// Test script to verify automatic prefix calculation
const testPrefixCalculation = () => {
  console.log('Testing automatic prefix calculation...\n');
  
  // 模拟套餐数据
  const plans = [
    { id: 1, name: '月付套餐', duration_days: 30 },
    { id: 2, name: '季付套餐', duration_days: 90 },
    { id: 3, name: '年付套餐', duration_days: 365 },
    { id: 4, name: '半年套餐', duration_days: 180 },
    { id: 5, name: '周套餐', duration_days: 7 },
    { id: 6, name: '双月套餐', duration_days: 60 }
  ];
  
  // 根据天数确定前缀的函数
  const getPrefixByDuration = (durationDays) => {
    if (durationDays <= 30) {
      return 'M'; // 月套餐
    } else if (durationDays <= 90) {
      return 'Q'; // 季度套餐
    } else if (durationDays <= 180) {
      return 'H'; // 半年套餐
    } else {
      return 'Y'; // 年套餐
    }
  };
  
  // 测试所有套餐
  plans.forEach(plan => {
    const prefix = getPrefixByDuration(plan.duration_days);
    console.log(`套餐: ${plan.name} (${plan.duration_days}天)`);
    console.log(`前缀: ${prefix}`);
    console.log('---');
  });
  
  console.log('✅ Prefix calculation test completed');
};

// Run the test
testPrefixCalculation();