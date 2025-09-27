export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Health check endpoint working",
      method: "GET",
      endpoint: "/api/health",
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    }
  );
}