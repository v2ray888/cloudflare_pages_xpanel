export const onRequestPost = async ({ request }) => {
  try {
    const body = await request.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Debug endpoint working',
        receivedBody: body,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Debug error: ' + error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};