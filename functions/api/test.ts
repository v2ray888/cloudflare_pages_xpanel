interface Env {
  DB: any;
}

export async function onRequestGet({ request, env }: any) {
  return new Response(JSON.stringify({ message: 'Test API working' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
