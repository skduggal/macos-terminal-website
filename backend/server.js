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
You are Siddhanth Duggal's portfolio file-retrieval assistant.

GOAL  
• Identify the single most relevant keyword in the user's QUESTION.  
• Map that keyword to one of these file names:  
    ▸ about.txt  
    ▸ education.txt  
    ▸ resume.txt  
    ▸ skills.txt  
    ▸ projects.txt  
    ▸ personal details.txt  
• Return the ENTIRE content of the matched file exactly as provided in CONTEXT.  
• Do NOT add explanations, summaries, or additional text.  
• If no keyword clearly maps to a file, reply:  
  "No matching file found based on the question."

MAPPING RULES  
• "about", "bio", "who are you"      → about.txt  
• "education", "study", "degree"      → education.txt  
• "resume", "experience", "internship", company names → resume.txt  
• "skill", "skills", "tech stack"     → skills.txt  
• "project", "projects", specific project names → projects.txt  
• "personal details", "contact", "email", "location" → personal details.txt

FORMAT  
• Reply with the file content verbatim.  
• If multiple keywords map to different files, choose the first matching rule in the list above.  

CONTEXT (all files concatenated below):  
{context}

QUESTION:  
{question}

ANSWER:

`);

  // Create the stuffDocuments chain
  const chain = await createStuffDocumentsChain({
    llm,
    prompt,
    inputKey: "question",
    contextKey: "context"
  });

  // --- FILE ROUTER ---
  function routeQuestionToFile(question) {
    const q = question.toLowerCase();
    if (/about|bio|who are you/.test(q)) return "about.txt";
    if (/education|study|degree/.test(q)) return "education.txt";
    if (/resume|experience|internship|company/.test(q)) return "resume.txt";
    if (/skill|skills|tech stack/.test(q)) return "skills.txt";
    if (/project|projects|vibe-rater|ikites|ingen|sentiment|pipeline/.test(q)) return "projects.txt";
    if (/personal details|contact|email|location/.test(q)) return "personal.txt";
    return null;
  }

  app.post("/api/ask", async (req, res) => {
    console.log("Received /api/ask request:", req.body);
    try {
      const { question } = req.body;
      if (!question) return res.status(400).json({ error: "No question provided" });

      // 1. Route question to file
      const file = routeQuestionToFile(question);
      if (!file) {
        // No matching file, pass empty context
        const answer = await chain.invoke({ question, context: "" });
        return res.json({ answer });
      }

      // 2. Retrieve ALL docs for that file from FAISS
      //    (FAISS doesn't support metadata filtering directly, so we load all docs and filter)
      const allDocs = await store.similaritySearch(" ", 1000); // get all docs (large K)
      const fileDocs = allDocs.filter(doc => doc.metadata && doc.metadata.source === file);
      if (!fileDocs.length) {
        const answer = await chain.invoke({ question, context: "" });
        return res.json({ answer });
      }
      // 3. Sort docs by chunk index (from id)
      fileDocs.sort((a, b) => {
        const ai = parseInt((a.metadata.id || a.id || "0").split("__")[1] || 0);
        const bi = parseInt((b.metadata.id || b.id || "0").split("__")[1] || 0);
        return ai - bi;
      });
      // 4. Concatenate all chunks to reconstruct file
      const context = fileDocs.map(doc => doc.pageContent || doc.text).join("\n");
      // 5. Pass to LLM
      const answer = await chain.invoke({ question, context });
      res.json({ answer });
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
