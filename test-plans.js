// Test script to verify plan information
const testPlans = async () => {
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
    
    console.log('\nTesting plans retrieval...');
    
    const plansResponse = await fetch(`${apiUrl}/api/admin/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const plansResult = await plansResponse.json();
    console.log('Response status:', plansResponse.status);
    
    if (plansResponse.ok && plansResult.success) {
      console.log('✅ Plans retrieval test PASSED');
      console.log('Plans data:', JSON.stringify(plansResult.data, null, 2));
      
      if (plansResult.data && Array.isArray(plansResult.data)) {
        console.log(`\nFound ${plansResult.data.length} plans:`);
        plansResult.data.forEach((plan, index) => {
          console.log(`  ${index + 1}. ${plan.name} - ${plan.duration_days} days / ${plan.traffic_gb}GB - ¥${plan.price}`);
        });
      }
    } else {
      console.log('❌ Plans retrieval test FAILED');
      console.log('Error message:', plansResult.message);
    }
  } catch (error) {
    console.log('❌ Test failed with exception');
    console.log('Error:', error.message);
  }
};

// Run the test
testPlans();