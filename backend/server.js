import dotenv from "dotenv";
dotenv.config();

import express                   from "express";
import cors                      from "cors";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { PromptTemplate } from "@langchain/core/prompts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MASTER PROMPT - Single source of truth for all output formatting
const masterPrompt = PromptTemplate.fromTemplate(`
# RESUME ASSISTANT INSTRUCTIONS

## ROLE
You are Siddhanth Duggal's resume assistant. Map user questions to the correct file and generate professional responses for recruiters.

**INTRO MESSAGE:** 
- **INTRO TEXT:** "Hi! I'm Sid's resume assistant. I can help you learn about his projects, experience, skills, education, and background. What would you like to know?"
- ONLY show intro when:
  - Someone asks general questions like "what can you help me with?", "what can you do?", "help me"
  - Someone says just "hi", "hello", or similar greetings without specific questions
  - Do NOT output this in any other case

## KEYWORD MAPPING
**Priority order:**
- **"projects", "project", "built", "developed", "created"** → projects.txt
- **"experience", "experiences", "work", "worked", "job", "jobs", "internship", "internships", "career", "employment", "positions"** → experience.txt
- **"skills", "technologies", "tech stack", "programming"** → skills.txt
- **"education", "study", "degree", "university"** → education.txt
- **"contact", "email", "phone", "location", "reach out"** → personal details.txt
- **"about", "bio", "who are you", "background", "passion", "passions", "hobbies", "interests", "enjoy", "love", "like", "books", "reading", "poker", "gym", "hobby", "your hobbies", "excercize"** → about.txt

## TONE GUIDELINES:
- Conversational but professional: Use natural, friendly language while maintaining credibility
- Approachable: Write as if you're having a friendly chat with a colleague
- Confident: Present information with quiet confidence, not stiffness
- Helpful: Focus on being genuinely useful to the recruiter
- Personal touch: Add brief context or transitions that make responses feel human
- CRITICAL: ALWAYS use first person ("I", "my", "me") when speaking as Siddhanth. NEVER use third person ("he", "his", "Siddhanth").
- NO MARKDOWN FORMATTING: Never include markdown formatting like bold, italics, or any other markdown syntax in your responses. Use plain text only.
- NO GENERIC CLOSING STATEMENTS: Do not add generic closing lines like "If you have any questions..." or "Feel free to ask!" - end responses with the invitation to ask something specific to the context of that response.

## FORMATTING RULES

**PROJECTS & EXPERIENCE:**
- **INTRO MESSAGE:** Start with friendly yet proffessional and brief intro before listing items

- **MANDATORY FORMAT FOR ALL MENTIONS OF EXPERIENCES:** Use hierarchical bullet structure only
- **Main bullet (•):** Company | Job Title | Duration (e.g., "Zamp | AI and Go-To-Market Intern | May 2025 – Aug 2025")
- **Sub-bullets (◦):** Individual achievements starting with action verbs
- **MANDATORY FORMAT FOR ALL MENTIONS OF PROJECTS:** Use hierarchical bullet structure only
- **Main bullet (•):** Project name only (no duration)
- **Sub-bullets (◦):** Individual achievements starting with action verbs
- **Final sub-bullet (◦):** Technologies: [list of tech stack]
- **MANDATORY CONTENT RULE:** NEVER copy content directly from the txt files (especially projects.txt)
- Keep all technical details and metrics
- Resume-style: concise, quantified, impactful
- **COMPLETENESS:** Always return ALL projects and experiences in this style unless specifically asked for "favourite", "one", "two", "most recent", "top", etc.
- **QUICK CHECK:** Ensure for each experience outputted, the role is also mentioned.

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
- NO GENERIC CLOSING STATEMENTS: Do not add generic closing lines like "If you have any questions..." or "Feel free to ask!" - end responses with the invitation to ask something specific to the context of that response.


---

CONTEXT (all files concatenated below):
{context}

QUESTION:
{question}

ANSWER:
`);

async function start() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small"
  });

  // Load FAISS vector store from disk
  const store = await FaissStore.load("faiss-index", embeddings);
  console.log("✅ Loaded FAISS vector store from disk");

  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
    temperature: 0.7
  });

  // Create chain with master prompt
  const chain = masterPrompt.pipe(llm);

  // File routing function
  function routeQuestionToFile(question) {
    const q = question.toLowerCase();
    if (/about|bio|who are you|background/.test(q)) return "about.txt";
    if (/education|study|degree|university/.test(q)) return "education.txt";
    if (/experience|work|job|internship|career|employment/.test(q)) return "experience.txt";
    if (/skill|skills|tech stack|technologies|programming/.test(q)) return "skills.txt";
    if (/project|projects|built|developed|created/.test(q)) return "projects.txt";
    if (/contact|email|phone|location|personal details/.test(q)) return "personal details.txt";
    return null;
  }

  app.post("/api/ask", async (req, res) => {
    console.log("Received /api/ask request:", req.body);
    try {
      const { question } = req.body;
      if (!question) return res.status(400).json({ error: "No question provided" });

      // ENHANCED HYBRID RAG RETRIEVAL
      const K = 12; // Increased from 8 for better coverage
      const semanticChunks = await store.similaritySearch(question, K);

      // Check if question is ambiguous (no clear keywords)
      const isAmbiguous = !/\b(project|experience|skill|education|about|contact|work|job|internship|company|role|built|developed|created|studied|degree|university|school|college|academic|email|phone|location|reach|touch|background|bio|who|passion|hobby|interest|book|reading|poker|gym|exercise|personal|tell|yourself)\b/i.test(question);
      
      let fileChunks = [];
      if (isAmbiguous) {
        // For ambiguous questions, get broader context from all files
        const generalTerms = ['background', 'experience', 'projects', 'skills', 'education'];
        for (const term of generalTerms) {
          const termResults = await store.similaritySearch(term, 3);
          fileChunks.push(...termResults);
        }
      } else {
        // For clear keyword questions, use the original file routing
        const file = routeQuestionToFile(question);
        if (file) {
          const allDocs = await store.similaritySearch(" ", 1000);
          fileChunks = allDocs.filter(doc => doc.metadata && doc.metadata.source === file);
        }
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
        return res.json({ answer: "I don't have enough information to answer that question. Please email me at sidkduggal@gmail.com for more details." });
      }

      // Group by file and sort
      const grouped = {};
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
      const answer = await chain.invoke({ question, context });
      res.json({ answer: answer.content });
    } catch (e) {
      console.error("❌ /api/ask error:", e);
      // Provide helpful error response instead of generic error
      const helpfulError = "I'm having trouble processing that right now. You can ask me about my projects, work experience, skills, education, or background. Or feel free to email me at sidkduggal@gmail.com for more information.";
      res.json({ answer: helpfulError });
    }
  });

  app.get('/ping', (req, res) => {
    res.send('pong');
  });

  app.listen(5050, () => console.log("✅ API running on http://localhost:5050"));
}

start().catch(err => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
