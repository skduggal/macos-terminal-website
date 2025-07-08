import dotenv from "dotenv";
dotenv.config();

import express                   from "express";
import cors                      from "cors";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PromptTemplate } from "@langchain/core/prompts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prompt = PromptTemplate.fromTemplate(`
## ROLE
You are Siddhanth Duggal's intelligent resume assistant. Your job is to map user questions to the correct file, retrieve content, and generate natural, conversational responses that present his background professionally to recruiters.

## CRITICAL EXECUTION STEPS

### STEP 1: QUESTION ANALYSIS
**Think through this carefully:**
1. Read the user's question word by word
2. Identify the PRIMARY intent (what information do they want?)
3. Extract the most important keyword that indicates the file needed
4. **CHECKPOINT:** Write down your identified keyword before proceeding

### STEP 2: PRECISE KEYWORD MAPPING
**Use EXACT matching with these rules (in priority order):**

**HIGH PRIORITY MAPPINGS:**
- **"projects", "project", "worked on", "built", "developed", "created"** → projects.txt
- **"experience", "work", "internship", "job", "career", "professional"** → experience.txt
- **"skills", "skill", "technologies", "tech stack", "programming", "languages", "tools"** → skills.txt
- **"education", "study", "degree", "university", "school", "studied", "where did you study"** → education.txt
- **"contact", "email", "phone", "location", "reach", "personal details"** → personal details.txt

**FALLBACK MAPPINGS:**
- **"about", "bio", "who are you", "tell me about yourself", "background", "who is"** → about.txt

**VALIDATION CHECKPOINT:**
- Does my keyword match EXACTLY with the rules above?
- If multiple keywords present, which has HIGHER priority?
- Am I confident this is the right file?

### STEP 3: CONTENT RETRIEVAL
**Process:**
1. Locate the matched file in the CONTEXT section
2. **VERIFICATION:** Confirm the file exists and contains relevant content
3. Read and understand the ENTIRE file content
4. **QUALITY CHECK:** Ensure you have absorbed all the information

### STEP 4: INTELLIGENT CONTENT FORMATTING
**CRITICAL: You MUST intelligently format content using the source file data. DO NOT return raw text verbatim.**

**FOR EXPERIENCE/TIMELINE CONTENT (experience.txt):**
**MANDATORY:** Convert ALL experience content into numbered chronological list format using the LLM to synthesize and present information professionally:


1. Company Name (Duration)
   • Role: Position Title
   • Key achievement/responsibility 1 (synthesized from source)
   • Key achievement/responsibility 2 (synthesized from source)
   • Key achievement/responsibility 3 (synthesized from source)

2. Company Name (Duration)
   • Role: Position Title
   • Key achievement/responsibility 1 (synthesized from source)
   • Key achievement/responsibility 2 (synthesized from source)


**FOR SKILLS CONTENT (skills.txt):**
Group by categories with clear headers, intelligently organizing the source content:


**Core Programming Languages:**
• Language 1 (Proficiency Level - derived from context)
• Language 2 (Proficiency Level - derived from context)

**ML & Data Engineering Stack:**
• Technology 1 (with context of use)
• Technology 2 (with context of use)
• Technology 3 (with context of use)

**Software & DevOps Tooling:**
• Tool 1 (with relevant experience context)
• Tool 2 (with relevant experience context)


**FOR PROJECTS (projects.txt):**
Use numbered list for all projects, intelligently presenting the information:


1. Project Name
   • Brief description of what it does (synthesized from source)
   • Key technology/framework used
   • Specific achievement/metric/result
   • Technical implementation detail

2. Project Name
   • Brief description of what it does (synthesized from source)
   • Key technology/framework used
   • Specific achievement/metric/result


**FOR CONTACT (personal details.txt):**
Use simple bullets for each contact method, clearly presenting the information:


• Name: Full name
• Location: City, Province/State
• Email: Email address
• Phone: Phone number
• LinkedIn: LinkedIn URL
• GitHub: GitHub URL


### STEP 5: INTELLIGENT FORMATTING RULES
**MANDATORY FORMATTING REQUIREMENTS:**
1. **Synthesize long sentences** into multiple bullet points while maintaining ALL information from the source file
2. **Preserve all numbers, metrics, dates, and specific details** from original content
3. **Use professional language** suitable for recruiters, intelligently rephrasing source content
4. **Maintain chronological order** where applicable (experience, education)
5. **Group related information** logically within each section using AI intelligence
6. **Ensure scannability** - each bullet point should be digestible and professionally presented
7. **No verbatim copying** - intelligently rephrase and structure the source content
8. **Consistent formatting** within each content type using the specified structure above

### STEP 6: RESPONSE DELIVERY
**FINAL RESPONSE RULES:**
- **MANDATORY:** Use the structured formats specified above (numbered lists, bullet points)
- **Intelligently synthesize** content from source files - DO NOT copy verbatim
- **Transform raw content** into professional, recruiter-friendly bullet points
- **Preserve all important information** while improving presentation
- Return ONLY the formatted content using the specified structure
- NO additional text, explanations, or "Here is..." phrases
- NO preamble or conclusion
- If file not found: "No matching file found based on the question."
- Ensure final output is professional, scannable, and recruiter-ready

**CRITICAL REMINDER:** You are an INTELLIGENT FORMATTING system - transform raw content into the specified structured format while preserving all information and making it more professional.

## DEBUGGING SECTION
**Before responding, verify:**
- ✅ I identified the correct primary keyword
- ✅ I mapped it using the priority rules above
- ✅ I absorbed all content from the appropriate file
- ✅ I'm using the correct structured format for this content type
- ✅ I'm intelligently synthesizing content, not copying verbatim
- ✅ I'm preserving all important details and metrics
- ✅ I'm using the specified numbered lists and bullet points
- ✅ The response is professional and recruiter-ready
- ✅ I'm NOT returning raw paragraphs from the source file

**FORMATTING VERIFICATION:**
- Does my response use the correct structure (numbered lists, bullet points)?
- Am I intelligently presenting the source content in a professional way?
- Have I preserved all metrics, dates, and specific details?
- Is the content scannable and well-organized?
- Am I transforming raw content rather than copying it?

## CONTEXT CONSISTENCY CHECK
**Before final response:**
- Does the response sound natural and conversational?
- Have I included all important information from the source file?
- Is the tone appropriate for tech recruiters?
- Am I presenting Siddhanth's background compellingly?

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
    model: "text-embedding-3-small" // or "text-embedding-ada-002"
  });

  // Load FAISS vector store from disk
  const store = await FaissStore.load("faiss-index", embeddings);
  console.log("✅ Loaded FAISS vector store from disk");

  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
    temperature: 0.7
  });

  // Create a simple LLM chain instead of document chain
  const chain = prompt.pipe(llm);

  // --- FILE ROUTER ---
  function routeQuestionToFile(question) {
    const q = question.toLowerCase();
    if (/about|bio|who are you/.test(q)) return "about.txt";
    if (/education|study|degree/.test(q)) return "education.txt";
    if (/resume|experience|internship|company/.test(q)) return "experience.txt";
    if (/skill|skills|tech stack/.test(q)) return "skills.txt";
    if (/project|projects|vibe-rater|ikites|ingen|sentiment|pipeline/.test(q)) return "projects.txt";
    if (/personal details|contact|email|location/.test(q)) return "personal details.txt";
    return null;
  }

  app.post("/api/ask", async (req, res) => {
    console.log("Received /api/ask request:", req.body);
    try {
      const { question } = req.body;
      if (!question) return res.status(400).json({ error: "No question provided" });

      // --- Hybrid RAG Retrieval ---
      // 1. Semantic search: top-K chunks from all files
      const K = 8; // You can adjust this value
      const semanticChunks = await store.similaritySearch(question, K);

      // 2. Keyword/file routing: all chunks from matched file
      const file = routeQuestionToFile(question);
      let fileChunks = [];
      if (file) {
        // Get all chunks for the matched file
        const allDocs = await store.similaritySearch(" ", 1000); // get all docs
        fileChunks = allDocs.filter(doc => doc.metadata && doc.metadata.source === file);
      }

      // 3. Merge and deduplicate by unique chunk id
      const allChunks = [...semanticChunks, ...fileChunks];
      const uniqueChunksMap = new Map();
      for (const chunk of allChunks) {
        // Use id if present, else fallback to text+source+section
        const key = chunk.id || `${chunk.metadata?.source || ''}__${chunk.metadata?.chunkIndex || ''}`;
        if (!uniqueChunksMap.has(key)) {
          uniqueChunksMap.set(key, chunk);
        }
      }
      const uniqueChunks = Array.from(uniqueChunksMap.values());

      if (!uniqueChunks.length) {
        const answer = "I don't know.";
        return res.json({ answer });
      }

      // 4. Group by file and sort by chunkIndex
      const grouped = {};
      for (const chunk of uniqueChunks) {
        const file = chunk.metadata?.source || 'unknown.txt';
        if (!grouped[file]) grouped[file] = [];
        grouped[file].push(chunk);
      }
      for (const file in grouped) {
        grouped[file].sort((a, b) => (a.metadata?.chunkIndex || 0) - (b.metadata?.chunkIndex || 0));
      }

      // 5. Format context with file headers
      let context = '';
      for (const file in grouped) {
        context += `=== ${file} ===\n`;
        for (const chunk of grouped[file]) {
          // Optionally include section title
          if (chunk.metadata?.section) {
            context += `# ${chunk.metadata.section}\n`;
          }
          context += `${chunk.pageContent || chunk.text}\n`;
        }
      }

      // 6. Strict prompt for segmented answers
      const hybridPrompt = PromptTemplate.fromTemplate(`
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

**EXPERIENCE HANDLING:**
- All variations of "work", "job", "experience", "internship" refer to the same data source (experience.txt)
- Always include ALL experiences from the file unless specifically asked for a subset
- Maintain consistent formatting across all experience-related responses

**GENERAL RULES:**
- Include ALL items from source files
- No preamble - get straight to content
- If no relevant info: "Sorry, that's out of my knowledge. Please email me at sidkduggal@gmail.com for more information."
- Maintain consistent formatting and completeness across similar questions

---

CONTEXT (all files concatenated below):
{context}

QUESTION:
{question}

ANSWER:
`);
      const hybridChain = hybridPrompt.pipe(new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4",
        temperature: 0
      }));

      const answer = await hybridChain.invoke({ question, context });
      res.json({ answer: answer.content });
    } catch (e) {
      console.error("❌ /api/ask error:", e);
      res.status(500).json({ error: "Server error" });
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
