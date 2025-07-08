import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  console.log("Test: /api/ask POST handler invoked");
  return new Response(JSON.stringify({ message: "API route works without FAISS" }), { status: 200 });
}; 