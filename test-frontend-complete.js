// Complete test to verify frontend API call works correctly
const testFrontendApi = async () => {
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
    
    // Mock the adminApi.createRedeemCodes function
    const mockAdminApi = {
      createRedeemCodes: async (data) => {
        console.log('Calling API with data:', data);
        
        // Make actual API call
        const response = await fetch(`${apiUrl}/api/admin/redemption/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.log('API Error Response:', errorData);
          throw new Error(`API Error: ${response.status} - ${errorData}`);
        }
        
        const result = await response.json();
        console.log('API Success Response:', result);
        return { data: result };
      }
    };
    
    console.log('\nTesting frontend API call...');
    
    // Test data matching what the frontend would send
    const testData = {
      plan_id: 1,
      quantity: 5,
      expires_at: '2025-12-31T23:59:59Z'
    };
    
    console.log('Sending test data:', testData);
    
    const response = await mockAdminApi.createRedeemCodes(testData);
    console.log('✅ Frontend API call test PASSED');
    console.log('Response:', response);
    
    if (response.data.success) {
      console.log(`Generated ${response.data.data.codes.length} codes:`);
      response.data.data.codes.forEach((code, index) => {
        console.log(`  ${index + 1}. ${code}`);
      });
    }
  } catch (error) {
    console.log('❌ Frontend API call test FAILED');
    console.log('Error:', error.message);
  }
};

// Run the test
testFrontendApi();