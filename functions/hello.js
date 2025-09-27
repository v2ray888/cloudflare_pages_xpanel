export default {
  async fetch(request, env) {
    return new Response("Hello, World! Cloudflare Functions are working!");
  }
};