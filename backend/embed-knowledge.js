// backend/embed-knowledge.js
import dotenv from "dotenv";
dotenv.config();

import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma }             from "langchain/vectorstores/chroma";
import fs                     from "fs";
import path                   from "path";
import { fileURLToPath }      from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// 1) Init OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
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
  const chunks = text.match(/(.|[\r\n]){1,500}/g) || [];
  for (let i = 0; i < chunks.length; i++) {
    documents.push({
      id:       `${file}__${i}`,
      text:     chunks[i].trim(),
      metadata: { source: file },
    });
  }
}

// 3) Embed & persist locally
async function run() {
  const store = await Chroma.fromTexts(
    documents.map(d => d.text),
    documents.map(d => d.metadata),
    embeddings,
    {
      collectionName:   "sid-knowledge",
      persistDirectory: "./chroma_db",
    }
  );

  // write to disk
  await store.persist();
  console.log(`✅ Embedded ${documents.length} chunks into ./chroma_db`);
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Failed to embed knowledge:", err);
  process.exit(1);
});
