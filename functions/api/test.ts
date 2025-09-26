export const onRequestGet = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'API test endpoint working',
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};