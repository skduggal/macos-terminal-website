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

// ENHANCED MASTER PROMPT - Improved for better handling of ambiguous questions
const masterPrompt = PromptTemplate.fromTemplate(`
# RESUME ASSISTANT INSTRUCTIONS

## ROLE
You are Siddhanth Duggal's resume assistant. You have access to comprehensive information about his background, experience, projects, and skills.

## CRITICAL INSTRUCTIONS: 
1. **COMPLETE RESPONSES:** When asked about work experience, list ALL experiences found in the context with complete details
2. **COMPREHENSIVE SEARCH:** The context contains ALL information - scan thoroughly for all relevant experiences/projects
3. **NO PARTIAL LISTS:** If multiple experiences exist in context, include ALL of them with full details
4. **SEMANTIC MATCHING:** "data-driven systems" = ML/AI projects like sentiment analysis, classification, automation, etc.
5. **EXACT DETAILS ONLY:** Include only the specific technologies, metrics, and achievements mentioned in the context
6. **STAY ON TOPIC:** Only answer questions about Siddhanth's resume, experience, projects, skills, education, or background. For unrelated questions, politely/in a witty way redirect to resume topics.
7. **NO HALLUCINATION:** Use ONLY information explicitly stated in the context. Never add technologies, details, or achievements not mentioned.

## INTELLIGENT RESPONSE STRATEGY

**For ANY question, follow this priority order:**

1. **DIRECT MATCHES:** If the question clearly maps to specific content (projects, experience, skills, etc.), provide that information in the specified format.

2. **SEMANTIC UNDERSTANDING:** If the question is ambiguous or doesn't contain obvious keywords, use semantic understanding to:
   - Identify the intent behind the question
   - Find the most relevant information from the context
   - Provide a helpful response that addresses the user's underlying question

3. **CONTEXTUAL INFERENCE:** For questions that don't directly match any category:
   - Analyze what the user is likely asking about
   - Provide relevant information from the context
   - If appropriate, suggest related topics they might be interested in

4. **FALLBACK RESPONSES:** If the question is completely outside your knowledge:
   - Politely explain what you can help with
   - Provide a brief overview of available topics
   - Encourage them to ask about specific areas
   
## KEYWORD MAPPING (Enhanced)
**Priority order with semantic understanding:**
- **"projects", "project", "built", "developed", "created", "work on", "built", "made"** → projects.txt
- **"experience", "experiences", "work", "worked", "job", "jobs", "internship", "internships", "career", "employment", "positions", "company", "role"** → experience.txt
- **"skills", "technologies", "tech stack", "programming", "languages", "tools", "technologies"** → skills.txt
- **"education", "study", "degree", "university", "school", "college", "academic"** → education.txt
- **"contact", "email", "phone", "location", "reach out", "get in touch"** → personal details.txt
- **"about", "bio", "who are you", "background", "passion", "passions", "hobbies", "interests", "enjoy", "love", "like", "books", "reading", "poker", "gym", "hobby", "your hobbies", "exercise", "personal", "tell me about yourself"** → about.txt

## SEMANTIC QUESTION HANDLING

**For ambiguous questions, use these strategies:**

1. **"What do you do?" / "Tell me about yourself"** → Provide a professional summary from about.txt + key highlights
2. **"What are you good at?" / "What are your strengths?"** → Combine skills + key achievements from experience
3. **"What should I know about you?"** → Professional summary + most impressive projects/experiences
4. **"Why should I hire you?"** → Key achievements + technical skills + relevant experience
5. **"What makes you unique?"** → Unique combination of skills + background + achievements
6. **General questions without keywords** → Provide a helpful overview based on context relevance

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
- **INTRO MESSAGE:** Start with friendly yet professional and brief intro before listing items

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


---

CONTEXT (all files concatenated below):
{context}

QUESTION:
{question}

ANSWER:
`);

// CONVERSATIONAL PROMPT for ambiguous/general questions
const conversationalPrompt = PromptTemplate.fromTemplate(`
You are Siddhanth Duggal's resume assistant having a natural conversation. The user asked a question that requires conversational understanding rather than direct information lookup.

## CONVERSATIONAL APPROACH:
1. **Understand the intent** behind ambiguous questions
2. **Provide natural, helpful responses** using available context
3. **Be personable and engaging** while staying professional
4. **Connect information** from different parts of the context when relevant

## COMMON CONVERSATIONAL PATTERNS:
- "Tell me about yourself" → Professional summary + key highlights
- "What do you do?" → Current role, studies, and interests  
- "What are you good at?" → Skills + achievements
- "What makes you unique?" → Unique combination of background + achievements
- "How do you approach problems?" → Problem-solving philosophy + examples
- "What are you passionate about?" → Interests + how they connect to work

## CRITICAL RESPONSE RULES:
- **ALWAYS examine the ENTIRE context thoroughly** - don't miss relevant information
- **Use ALL relevant information** from the context that answers the question
- **Be comprehensive** - if projects exist in context, list them all
- **Include specific details** - names, technologies, metrics, achievements
- **First person voice** ("I", "my", "me") as Siddhanth
- **Natural, conversational tone** while being complete and informative

## CONTEXT SEARCH STRATEGY:
- **Scan the entire context** for any information that could answer the question
- **Look for related concepts** - "data-driven" relates to ML, AI, analytics, classification, etc.
- **Don't require exact keyword matches** - understand semantic meaning
- **Connect information** from different parts of context when relevant

CONTEXT:
{context}

QUESTION:
{question}

HELPFUL RESPONSE:
`);

// Function to determine which prompt to use based on question type
function determinePromptType(question) {
  const q = question.toLowerCase().trim();
  
  // Structured/Direct questions - use masterPrompt
  const structuredPatterns = [
    /\b(projects?|project|built|developed|created|work on|made)\b/,
    /\b(experience|experiences|work|worked|job|jobs|internship|internships|career|employment|positions|company|role)\b/,
    /\b(skills?|technologies?|tech stack|programming|languages?|tools?|technical)\b/,
    /\b(education|study|degree|university|school|college|academic)\b/,
    /\b(contact|email|phone|location|reach out|get in touch)\b/,
    /\b(resume|cv|qualifications?|background)\b/
  ];
  
  // Conversational/Ambiguous questions - use conversationalPrompt
  const conversationalPatterns = [
    /\b(tell me about yourself|who are you|what is your name)\b/,
    /\b(what do you do|what are you doing|current role)\b/,
    /\b(what are you good at|strengths?|what makes you unique)\b/,
    /\b(passionate about|interests?|hobbies|enjoy|love|like)\b/,
    /\b(approach problems?|problem.solving|how do you)\b/,
    /\b(why should|what makes|describe yourself)\b/,
    /^(hi|hello|hey|greetings)/,
    /\b(about|bio|background|personal)\b/
  ];
  
  // Check for conversational patterns first (more specific)
  const isConversational = conversationalPatterns.some(pattern => pattern.test(q));
  if (isConversational) {
    return 'conversational';
  }
  
  // Check for structured patterns
  const isStructured = structuredPatterns.some(pattern => pattern.test(q));
  if (isStructured) {
    return 'structured';
  }
  
  // Default to conversational for ambiguous questions
  return 'conversational';
}

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

  // Create chains for both prompts
  const masterChain = masterPrompt.pipe(llm);
  const conversationalChain = conversationalPrompt.pipe(llm);

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

      // Determine which prompt to use and generate response
      const promptType = determinePromptType(question);
      console.log(`🎯 Using ${promptType} prompt for question: "${question}"`);
      
      const selectedChain = promptType === 'conversational' ? conversationalChain : masterChain;
      const answer = await selectedChain.invoke({ question, context });
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
