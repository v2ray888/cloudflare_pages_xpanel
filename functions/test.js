export default {
  async fetch(request, env) {
    return new Response(
      JSON.stringify({
        success: true,
        message: "Cloudflare Functions are working!",
        timestamp: new Date().toISOString(),
        url: request.url
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};