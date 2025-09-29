// Test script to verify prefix generation functionality
const testPrefixGeneration = async () => {
  const apiUrl = 'http://127.0.0.1:8787';
  
  try {
    console.log('Testing admin login...');
    
    // Login as admin to get a valid token
    const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@xpanel.com',
        password: 'admin123'  // Default admin password
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      console.log('Status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Admin login successful');
    const token = loginResult.data.token;
    console.log('Token received');
    
    console.log('\nTesting redemption code generation with prefix...');
    
    // Test data for generating redemption codes with prefix
    const testData = {
      plan_id: 1,  // Using the plan we found in the database
      quantity: 3,
      prefix: 'M',  // Monthly prefix
      expires_at: '2025-12-31T23:59:59Z'
    };
    
    const redemptionResponse = await fetch(`${apiUrl}/api/admin/redemption/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    const redemptionResult = await redemptionResponse.json();
    console.log('Response status:', redemptionResponse.status);
    console.log('Response data:', JSON.stringify(redemptionResult, null, 2));
    
    if (redemptionResponse.ok && redemptionResult.success) {
      console.log('✅ Redemption code generation with prefix test PASSED');
      
      // 验证响应结构是否符合前端期望
      if (redemptionResult.data && redemptionResult.data.codes && Array.isArray(redemptionResult.data.codes)) {
        console.log(`✅ Response structure is correct`);
        console.log(`Generated ${redemptionResult.data.codes.length} codes:`);
        redemptionResult.data.codes.forEach((code, index) => {
          console.log(`  ${index + 1}. ${code}`);
          // 验证前缀是否正确应用
          if (code.startsWith('M')) {
            console.log(`     ✅ Prefix correctly applied`);
          } else {
            console.log(`     ❌ Prefix not applied correctly`);
          }
        });
      } else {
        console.log('❌ Response structure is incorrect');
        console.log('Expected: { data: { codes: [...] } }');
        console.log('Actual:', redemptionResult);
      }
    } else {
      console.log('❌ Redemption code generation test FAILED');
      console.log('Error message:', redemptionResult.message);
    }
  } catch (error) {
    console.log('❌ Test failed with exception');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
};

// Run the test
testPrefixGeneration();