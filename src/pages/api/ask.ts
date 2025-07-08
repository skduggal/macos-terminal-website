import type { APIRoute } from 'astro';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
// @ts-expect-error: faiss community package may not have types, but works at runtime
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { PromptTemplate } from '@langchain/core/prompts';
import path from 'path';
import fs from 'fs';

const masterPrompt = PromptTemplate.fromTemplate(`
# RESUME ASSISTANT INSTRUCTIONS

## ROLE
You are Siddhanth Duggal's resume assistant. Map user questions to the correct file and generate professional responses for recruiters.

**INTRO MESSAGE:** When first contacted, introduce yourself briefly: "Hi! I'm Siddhanth's resume assistant. I can help you learn about his projects, experience, skills, education, and background. What would you like to know?"

## KEYWORD MAPPING
**Priority order:**
- **"projects", "project", "built", "developed", "created"** → projects.txt
- **"experience", "experiences", "work", "worked", "job", "jobs", "internship", "internships", "career", "employment", "positions"** → experience.txt
- **"skills", "technologies", "tech stack", "programming"** → skills.txt
- **"education", "study", "degree", "university"** → education.txt
- **"contact", "email", "phone", "location"** → personal details.txt
- **"about", "bio", "who are you", "background"** → about.txt

## FORMATTING RULES

**PROJECTS & EXPERIENCE:**
- **INTRO MESSAGE:** Start with brief intro before listing items
- **MANDATORY FORMAT FOR ALL MENTIONS OF PROJECTS & EXPERIENCES:** Use hierarchical bullet structure only
- **Main bullet (•):** Company/project name and duration (strip existing bold formatting)
- **Sub-bullets (◦):** Individual achievements starting with action verbs
- Keep all technical details and metrics
- Resume-style: concise, quantified, impactful
- **COMPLETENESS:** Always return ALL projects and experiences in this style unless specifically asked for "favourite", "one", "two", "most recent", "top", etc.

**EDUCATION:**
- Present tense for ongoing, past tense for completed
- First person ("I am studying...", "I completed...")

**ABOUT/BIO:**
- **SUMMARIZE:** Do NOT copy content directly from about.txt
- **1-2 paragraphs maximum** focusing on professional highlights
- **Skip detailed hobbies/interests/reading** - brief mention only
- First person ("I", "my", "me")
- Professional conversational tone
- Focus on value proposition for recruiters

**OTHER CATEGORIES:**
- First person ("I", "my", "me")
- Professional conversational tone

## RESPONSE RULES

**EXPERIENCE HANDLING - CRITICAL RULES:**
- **MANDATORY:** ALL variations of "work", "job", "experience", "internship" MUST return ALL experiences from experience.txt
- **NO EXCEPTIONS:** Never return partial lists unless explicitly asked for specific quantities ("tell me about one experience", "your most recent job", etc.)
- **REQUIRED COMPONENTS:** Every experience MUST include: Company Name, Duration, Job Title, and ALL bullet points
- **CONSISTENT FORMAT:** Use the exact same hierarchical bullet structure for all experience responses
- **COMPLETENESS CHECK:** Before responding, verify that ALL experiences from the source file are included
- **JOB TITLE MANDATORY:** Always include the job title in the "As a [Job Title], I:" format
- **ZERO TOLERANCE:** Any response missing experiences or job titles is incorrect and must be avoided

**GENERAL RULES:**
- Include ALL items from source files (NO PARTIAL RESPONSES)
- No preamble - get straight to content
- If no relevant info: "Sorry, that's out of my knowledge. Please email me at sidkduggal@gmail.com for more information."
- **EXPERIENCE RESPONSES:** Must always include ALL experiences with job titles unless explicitly asked for specific subset
- **CONSISTENCY:** Same question types must produce identical formatting and completeness
- **QUALITY CONTROL:** Every experience response must pass the completeness check
- ALWAYS use first person ("I", "my", "me") when speaking as Siddhanth. NEVER use third person ("he", "his", "Siddhanth").
- NO MARKDOWN FORMATTING: Never include markdown formatting like bold, italics, or any other markdown syntax in your responses. Use plain text only.

---

CONTEXT (all files concatenated below):
{context}

QUESTION:
{question}

ANSWER:
`);

function routeQuestionToFile(question: string) {
  const q = question.toLowerCase();
  if (/about|bio|who are you|background/.test(q)) return "about.txt";
  if (/education|study|degree|university/.test(q)) return "education.txt";
  if (/experience|work|job|internship|career|employment/.test(q)) return "experience.txt";
  if (/skill|skills|tech stack|technologies|programming/.test(q)) return "skills.txt";
  if (/project|projects|built|developed|created/.test(q)) return "projects.txt";
  if (/contact|email|phone|location|personal details/.test(q)) return "personal details.txt";
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'No question provided' }), { status: 400 });
    }

    // Load embeddings and FAISS store (ensure path is correct for Vercel)
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small',
    });
    // On Vercel, use process.cwd() to resolve the faiss-index directory
    const faissPath = path.resolve(process.cwd(), 'backend/faiss-index');
    if (!fs.existsSync(faissPath)) {
      return new Response(JSON.stringify({ error: 'FAISS index not found' }), { status: 500 });
    }
    const store = await FaissStore.load(faissPath, embeddings);

    // Hybrid RAG Retrieval
    const K = 8;
    const semanticChunks = await store.similaritySearch(question, K);

    // Keyword/file routing
    const file = routeQuestionToFile(question);
    let fileChunks = [];
    if (file) {
      const allDocs = await store.similaritySearch(' ', 1000);
      fileChunks = allDocs.filter((doc: any) => doc.metadata && doc.metadata.source === file);
    }

    // Merge and deduplicate
    const allChunks = [...semanticChunks, ...fileChunks];
    const uniqueChunksMap = new Map();
    for (const chunk of allChunks) {
      const key = chunk.id || `${chunk.metadata?.source || ''}__${chunk.metadata?.chunkIndex || ''}`;
      if (!uniqueChunksMap.has(key)) {
        uniqueChunksMap.set(key, chunk);
      }
    }
    const uniqueChunks = Array.from(uniqueChunksMap.values());

    if (!uniqueChunks.length) {
      return new Response(JSON.stringify({ answer: "I don't have enough information to answer that question. Please email me at sidkduggal@gmail.com for more details." }), { status: 200 });
    }

    // Group by file and sort
    const grouped: Record<string, any[]> = {};
    for (const chunk of uniqueChunks) {
      const file = chunk.metadata?.source || 'unknown.txt';
      if (!grouped[file]) grouped[file] = [];
      grouped[file].push(chunk);
    }
    for (const file in grouped) {
      grouped[file].sort((a, b) => (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0));
    }

    // Format context
    let context = '';
    for (const file in grouped) {
      context += `=== ${file} ===\n`;
      for (const chunk of grouped[file]) {
        if (chunk.metadata?.section) {
          context += `# ${chunk.metadata.section}\n`;
        }
        context += `${chunk.pageContent || chunk.text}\n`;
      }
    }

    // Generate response using master prompt
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o',
      temperature: 0.7,
    });
    const chain = masterPrompt.pipe(llm);
    const answer = await chain.invoke({ question, context });
    return new Response(JSON.stringify({ answer: answer.content }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error', details: String(e) }), { status: 500 });
  }
}; 