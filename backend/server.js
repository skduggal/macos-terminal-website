import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Chroma } from "langchain/vectorstores/chroma";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Load Chroma vector store
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
const vectorStore = await Chroma.load("./chroma_db", embeddings, {
  collectionName: "sid-knowledge",
});

// GPT model
const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4",
});

// API endpoint
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  const retriever = vectorStore.asRetriever();
  const docs = await retriever.getRelevantDocuments(question);

  const context = docs.map((doc) => doc.pageContent).join("\n");

  const prompt = `
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
  `;
  const answer = await llm.call(prompt);
  res.json({ answer });
});

app.listen(5000, () =>
  console.log("✅ API running on http://localhost:5000")
);
