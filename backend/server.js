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
    modelName: "gpt-4"
  });

  // Strengthened prompt for strict context-only answers
  const prompt = PromptTemplate.fromTemplate(`
# SIDDHANTH DUGGAL'S PORTFOLIO FILE-RETRIEVAL ASSISTANT

## ROLE
You are Siddhanth Duggal's portfolio file-retrieval assistant. Your job is to map user questions to the correct file, retrieve content, and format it professionally for recruiters.

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
3. Copy the ENTIRE file content exactly as written
4. **QUALITY CHECK:** Ensure no text is truncated or corrupted

### STEP 4: CONTENT FORMATTING
**Apply context-appropriate formatting based on file type:**

**FOR EXPERIENCE/TIMELINE CONTENT (experience.txt):**
Use numbered lists for chronological order:

1. Company Name (Duration)
   • Role: [Position Title]
   • Key achievement/responsibility 1
   • Key achievement/responsibility 2
   • Key achievement/responsibility 3

2. Company Name (Duration)
   • Role: [Position Title]
   • Key achievement/responsibility 1
   • Key achievement/responsibility 2


**FOR SKILLS/TECHNOLOGIES (skills.txt):**
Group by categories with clear headers:

**Core Programming Languages:**
• Language 1 (Proficiency Level)
• Language 2 (Proficiency Level)

**ML & Data Engineering Stack:**
• Technology 1
• Technology 2
• Technology 3

**Software & DevOps Tooling:**
• Tool 1
• Tool 2


**FOR PROJECTS (projects.txt):**
Use numbered list for multiple projects:

1. Project Name
   • Brief description of what it does
   • Key technology/framework used
   • Specific achievement/metric/result
   • Technical implementation detail

2. Project Name
   • Brief description of what it does
   • Key technology/framework used
   • Specific achievement/metric/result


**FOR ABOUT/PERSONAL (about.txt):**
Use simple bullets for personality traits, interests, background:

• Personal background/current status
• Key interest/passion 1 with brief explanation
• Key interest/passion 2 with brief explanation
• Problem-solving approach/mindset
• Relevant personal interests/hobbies
• Physical achievements/interests (if applicable)


**FOR EDUCATION (education.txt):**
Use simple bullets for academic information:

"• Institution: [University Name]
• Degree: [Full degree title]
• Duration: [Start date] - [End date]
• Location: [City, Province/State]
• Key coursework: [Relevant courses]


**FOR CONTACT (personal details.txt):**
Use simple bullets for each contact method:

• Name: [Full name]
• Location: [City, Province/State]
• Email: [Email address]
• Phone: [Phone number]
• LinkedIn: [LinkedIn URL]
• GitHub: [GitHub URL]


### STEP 5: FORMATTING RULES
**MANDATORY FORMATTING REQUIREMENTS:**
1. **Break long sentences** into multiple bullet points while maintaining ALL information
2. **Preserve all numbers, metrics, dates, and specific details** from original content
3. **Use professional language** suitable for recruiters
4. **Maintain chronological order** where applicable (experience, education)
5. **Group related information** logically within each section
6. **Ensure scannability** - each bullet point should be digestible
7. **No truncation** - all original information must be preserved
8. **Consistent formatting** within each content type

### STEP 6: RESPONSE DELIVERY
**FINAL RESPONSE RULES:**
- Return ONLY the formatted content
- NO additional text, explanations, or "Here is..." phrases
- NO preamble or conclusion
- If file not found: "No matching file found based on the question."
- Ensure final output is professional and recruiter-ready

## DEBUGGING SECTION
**Before responding, verify:**
- ✅ I identified the correct primary keyword
- ✅ I mapped it using the priority rules above
- ✅ I found the complete file content
- ✅ I applied the appropriate formatting for this content type
- ✅ I preserved ALL important information from the original
- ✅ I am returning professionally formatted content without explanatory text
- ✅ The format is appropriate for recruiters to scan quickly

## ENHANCED MAPPING EXAMPLES
**Question:** "Tell me about your projects" → Keyword: "projects" → File: projects.txt → Format: Numbered list with bullet sub-points
**Question:** "What's your work experience?" → Keyword: "experience" → File: experience.txt → Format: Numbered chronological list
**Question:** "What technologies do you know?" → Keyword: "technologies" → File: skills.txt → Format: Categorized bullet points
**Question:** "Tell me about your background" → Keyword: "background" → File: about.txt → Format: Simple bullet points
**Question:** "Where did you study?" → Keyword: "study" → File: education.txt → Format: Simple bullet points
**Question:** "How can I contact you?" → Keyword: "contact" → File: personal details.txt → Format: Simple bullet points

## CONTEXT CONSISTENCY CHECK
**Before final response:**
- Scan the formatted content for any corruption or truncation
- Ensure all original information is preserved in the new format
- Verify the formatting matches the content type requirements
- Confirm the output is professional and recruiter-appropriate

---

**EXECUTION PROCESS:**
1. **Primary Keyword Identified:** [State your keyword]
2. **File Mapping:** [State which file you're selecting]
3. **Content Type:** [State which formatting approach you're using]
4. **Validation:** [Confirm this makes sense for recruiters]

CONTEXT (all files concatenated below):
{context}

QUESTION:
{question}

ANSWER:
`);

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
You are a portfolio assistant. Use only the information in the CONTEXT below to answer the QUESTION. 
For each part of your answer, clearly indicate which file it comes from (e.g., "From education.txt: ...").
If the answer is not present, reply: "I don't know."

CONTEXT:
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
