import type { APIRoute } from 'astro';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question' }), { status: 400 });
    }

    // Load Qdrant vector store from Qdrant Cloud
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small',
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: 'portfolio-knowledge',
      }
    );

    // Retrieve top 5 relevant chunks for richer context
    const results = await vectorStore.similaritySearch(question, 5);
    // Log the retrieved context and metadata for debugging
    console.log('Retrieved context for question:', question);
    results.forEach((r: any, i: number) => {
      console.log(`Chunk ${i + 1}:`, r.pageContent, r.metadata);
    });
    const context = results.map((r: { pageContent: string }) => r.pageContent);

    return new Response(JSON.stringify({ context }), { status: 200 });
  } catch (err: any) {
    // Enhanced error logging for debugging
    console.error('❌ /api/ask error:', err);
    if (err && err.stack) {
      console.error('Stack trace:', err.stack);
    }
    return new Response(JSON.stringify({ error: 'Internal server error', details: err?.message || String(err) }), { status: 500 });
  }
}; 