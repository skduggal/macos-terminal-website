// backend/embed-knowledge.js
import dotenv from "dotenv";
dotenv.config();

import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Init OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-small" // or "text-embedding-ada-002"
});

// 2) Read & chunk your data/*.txt files
const dataDir = path.resolve(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  console.error(`❌ Data directory not found at ${dataDir}`);
  process.exit(1);
}

function chunkTextSlidingWindow(text, chunkSize = 400, overlap = 100) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk.trim());
    if (end === text.length) break;
    start += chunkSize - overlap;
  }
  return chunks.filter(Boolean);
}

const documents = [];
for (const file of fs.readdirSync(dataDir)) {
  if (!file.endsWith(".txt")) continue;
  const text = fs.readFileSync(path.join(dataDir, file), "utf8");
  // Use sliding window chunking for richer context
  const chunks = chunkTextSlidingWindow(text, 400, 100);
  for (let i = 0; i < chunks.length; i++) {
    documents.push({
      id: `${file}__${i}`,
      text: chunks[i],
      metadata: {
        source: file,
        chunkIndex: i
      },
    });
  }
}

// 3) Embed & push to Qdrant Cloud
async function run() {
  const texts = documents.map(d => d.text);
  const metadatas = documents.map(d => d.metadata);

  // Create Qdrant vector store (pushes to remote Qdrant Cloud)
  const store = await QdrantVectorStore.fromTexts(
    texts,
    metadatas,
    embeddings,
    {
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: "portfolio-knowledge",
    }
  );

  console.log(`✅ Embedded ${documents.length} chunks into Qdrant Cloud collection`);
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Failed to embed knowledge:", err);
  process.exit(1);
});
