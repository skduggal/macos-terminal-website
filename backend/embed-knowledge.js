// backend/embed-knowledge.js
import dotenv from "dotenv";
dotenv.config();

import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
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

const documents = [];
for (const file of fs.readdirSync(dataDir)) {
  if (!file.endsWith(".txt")) continue;
  const text = fs.readFileSync(path.join(dataDir, file), "utf8");
  // Split by double newlines (section/paragraph)
  const sections = text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  for (let i = 0; i < sections.length; i++) {
    const sectionText = sections[i];
    // Use first non-empty line as section title (if looks like a header)
    let sectionTitle = sectionText.split("\n").find(line => line.trim().length > 0) || "Section";
    // Heuristic: if sectionTitle is all-caps or ends with ':' or '|', treat as title, else fallback to file name
    if (!/^([A-Z\s\-\|:]+|.+:|.+\|)$/.test(sectionTitle.trim())) {
      sectionTitle = file;
    }
    documents.push({
      id: `${file}__${i}`,
      text: sectionText,
      metadata: {
        source: file,
        section: sectionTitle.trim(),
        chunkIndex: i
      },
    });
  }
}

// 3) Embed & persist locally
async function run() {
  const texts = documents.map(d => d.text);
  const metadatas = documents.map(d => d.metadata);

  // Create FAISS vector store
  const store = await FaissStore.fromTexts(texts, metadatas, embeddings);
  // Save the FAISS index to disk
  await store.save("faiss-index");

  console.log(`✅ Embedded ${documents.length} chunks into local FAISS index`);
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Failed to embed knowledge:", err);
  process.exit(1);
});
