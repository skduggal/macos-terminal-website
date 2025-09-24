import type { APIRoute } from 'astro';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

// STRICT SOURCE ISOLATION PROMPT
const isolatedPrompt = PromptTemplate.fromTemplate(`
# RESUME ASSISTANT - STRICT SOURCE ISOLATION

## ROLE
You are Siddhanth Duggal's resume assistant. You have access to structured information with clear source boundaries.

## CRITICAL ANTI-CONTAMINATION RULES:
1. **SOURCE VERIFICATION**: Each document has metadata indicating its type (experience/project/etc.)
2. **ZERO MIXING**: NEVER combine information from different source types in the same response
3. **EXPERIENCE ISOLATION**: When discussing work experience, ONLY use documents with type="experience"
4. **PROJECT ISOLATION**: When discussing projects, ONLY use documents with type="project"
5. **EXACT MATCHING**: Use ONLY information explicitly stated in the documents provided

## RESPONSE STRATEGY:
- **Experience Questions**: Use only experience-type documents, return ALL companies with complete details
- **Project Questions**: Use only project-type documents, return ALL projects with complete details
- **Specific Company Questions**: Find the exact company document, provide complete information
- **Mixed Questions**: Clearly separate experience and project sections

## FORMATTING:
- Always use first person ("I", "my", "me")
- No markdown formatting
- Be complete and specific
- Include all relevant details from the source documents

## CONTEXT ANALYSIS:
Each document below contains its source type. Only use documents that match the question type.

DOCUMENTS:
{context}

QUESTION: {question}

ANSWER:`);

// Enhanced query analysis
function analyzeQuery(question: string): { type: string; company?: string; project?: string } {
  const q = question.toLowerCase().trim();

  // Company-specific queries
  const companies = ['zamp', 'ikites', 'ernst', 'young', 'ey', 'medanta'];
  const mentionedCompany = companies.find(company => q.includes(company));

  // Project-specific queries
  const projects = ['vibe-rater', 'emotion detection', 'spam filtering', 'portfolio', 'workday'];
  const mentionedProject = projects.find(project => q.includes(project));

  // Experience patterns
  const experiencePatterns = [
    /\b(experience|experiences|work|worked|job|jobs|internship|internships|career|employment|positions|company|companies|role)\b/
  ];

  // Project patterns
  const projectPatterns = [
    /\b(projects?|project|built|developed|created|work on|made)\b/
  ];

  if (mentionedCompany) {
    return { type: 'experience', company: mentionedCompany };
  } else if (mentionedProject) {
    return { type: 'project', project: mentionedProject };
  } else if (experiencePatterns.some(p => p.test(q))) {
    return { type: 'experience' };
  } else if (projectPatterns.some(p => p.test(q))) {
    return { type: 'project' };
  } else {
    return { type: 'general' };
  }
}

// Structured retrieval with strict filtering
async function retrieveStructured(vectorStore: any, query: string, analysis: any) {
  console.log(`🎯 Query analysis:`, analysis);

  let results = [];

  if (analysis.type === 'experience') {
    // Get experience documents only
    try {
      // Method 1: Try filtering by metadata
      results = await vectorStore.similaritySearch(query, 10, {
        filter: { type: 'experience' }
      });
    } catch (e) {
      console.log("Filter method failed, trying without filter...");
      // Fallback: Get all results and filter manually
      const allResults = await vectorStore.similaritySearch(query, 15);
      results = allResults.filter((doc: any) => doc.metadata?.type === 'experience');
    }

    // If looking for specific company, prioritize it
    if (analysis.company && results.length > 1) {
      results.sort((a: any, b: any) => {
        const aHasCompany = a.pageContent?.toLowerCase().includes(analysis.company) || a.metadata?.company?.toLowerCase().includes(analysis.company);
        const bHasCompany = b.pageContent?.toLowerCase().includes(analysis.company) || b.metadata?.company?.toLowerCase().includes(analysis.company);
        if (aHasCompany && !bHasCompany) return -1;
        if (!aHasCompany && bHasCompany) return 1;
        return 0;
      });
    }
  }
  else if (analysis.type === 'project') {
    // Get project documents only
    try {
      results = await vectorStore.similaritySearch(query, 10, {
        filter: { type: 'project' }
      });
    } catch (e) {
      console.log("Filter method failed, trying without filter...");
      const allResults = await vectorStore.similaritySearch(query, 15);
      results = allResults.filter((doc: any) => doc.metadata?.type === 'project');
    }
  }
  else {
    // General query - get relevant results but maintain separation
    results = await vectorStore.similaritySearch(query, 10);
  }

  console.log(`📄 Retrieved ${results.length} documents of type: ${analysis.type}`);

  // Add explicit source labels
  const context = results.map((r: any, index: number) => {
    const sourceType = r.metadata?.type?.toUpperCase() || 'UNKNOWN';
    const company = r.metadata?.company ? ` (${r.metadata.company})` : '';
    const project = r.metadata?.project ? ` (${r.metadata.project})` : '';

    return `[${sourceType}${company}${project}]: ${r.pageContent}`;
  }).join('\n\n---\n\n');

  return context;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question' }), { status: 400 });
    }

    // Environment validation
    const requiredEnvVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      QDRANT_URL: process.env.QDRANT_URL,
      QDRANT_API_KEY: process.env.QDRANT_API_KEY
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      const errorMessage = `Configuration issue: Missing ${missingVars.join(', ')}. You can ask me about my projects, work experience, skills, education, or background. Or feel free to email me at sidkduggal@gmail.com for more information.`;
      return new Response(JSON.stringify({ answer: errorMessage }), { status: 200 });
    }

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small',
    });

    // Connect to NEW structured collection
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: 'portfolio-knowledge-v2', // Use new collection
      }
    );

    // Analyze query to determine retrieval strategy
    const queryAnalysis = analyzeQuery(question);

    // Structured retrieval with strict source isolation
    const context = await retrieveStructured(vectorStore, question, queryAnalysis);

    console.log(`📋 Context length: ${context.length} chars`);
    console.log(`🎯 First 200 chars: "${context.substring(0, 200)}..."`);

    // Initialize LLM
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o',
      temperature: 0.2, // Lower temperature for more consistent responses
    });

    // Generate response with isolated prompt
    const chain = isolatedPrompt.pipe(llm);
    const answer = await chain.invoke({ question, context });

    if (!answer || !answer.content) {
      throw new Error('Empty response from LLM');
    }

    console.log(`✅ Generated response: ${answer.content.length} chars`);

    return new Response(JSON.stringify({ answer: answer.content }), { status: 200 });

  } catch (err: any) {
    console.error('❌ /api/ask-v2 error:', err);

    // Helpful fallback
    const fallbackAnswer = `I encountered a technical issue processing your question. I'm here to help you learn about my professional background! You can ask me about my work experience at companies like Zamp, iKites.AI, EY, and Medanta, my technical projects, my skills, or my education at UBC. What would you like to know?`;

    return new Response(JSON.stringify({ answer: fallbackAnswer }), { status: 200 });
  }
};