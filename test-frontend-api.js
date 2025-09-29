// Test script to verify frontend API call works correctly
const testFrontendApi = async () => {
  // Mock the adminApi.createRedeemCodes function
  const mockAdminApi = {
    createRedeemCodes: async (data) => {
      console.log('Calling API with data:', data);
      
      // Make actual API call
      const response = await fetch('http://127.0.0.1:8787/api/admin/redemption/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB4cGFuZWwuY29tIiwicm9sZSI6MSwiZXhwIjoxNzMzMzQ2MjQwfQ.5SshKYB_xV8V9J8w5VG3p8p8x4QJ4VhJ4V8V9J8w5VG'
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
  
  try {
    console.log('Testing frontend API call...');
    
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