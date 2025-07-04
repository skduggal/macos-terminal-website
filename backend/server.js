import dotenv from "dotenv";
dotenv.config();

import express                   from "express";
import cors                      from "cors";
import { Chroma }                from "langchain/vectorstores/chroma";
import { OpenAIEmbeddings, OpenAI } from "@langchain/openai";

const app = express();
app.use(cors());
app.use(express.json());

async function start() {
  // 1) Load your persisted Chroma store
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const store = await Chroma.load(
    "./chroma_db",
    embeddings,
    { collectionName: "sid-knowledge" }
  );
  console.log("✅ Loaded Chroma vector store from disk");

  // 2) Init GPT
  const llm = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName:    "gpt-4",   // or whatever model tag you have access to
  });

  // 3) API endpoint
  app.post("/api/ask", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) return res.status(400).json({ error: "No question provided" });

      // Retrieve top‐K chunks
      const retriever = store.asRetriever({ topK: 3 });
      const docs      = await retriever.getRelevantDocuments(question);
      const context   = docs.map(d => d.pageContent).join("\n");

      // Build your prompt
      const prompt = `
            You are Siddhanth Duggal’s portfolio AI assistant.  

            Response rules:
            1. ALWAYS use first-person (I, me, my)
            2. Never say "Sid" or refer to myself in third-person
            3. Keep responses concise and professional
            4. Use markdown formatting when appropriate
            5. Maintain a friendly, conversational tone

            If a question is unrelated to my work or portfolio, say: "That's outside my area of expertise. Feel free to email me at sidkduggal@gmail.com and we can discuss further!"

            Context:
            ${context}

            Question: ${question}

            Answer:
      `.trim();

      const answer = await llm.call(prompt);
      res.json({ answer });
    } catch (e) {
      console.error("❌ /api/ask error:", e);
      res.status(500).json({ error: "Server error" });
    }
  });

  // 4) Start server
  app.listen(5000, () => console.log("✅ API running on http://localhost:5000"));
}

start().catch(err => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
