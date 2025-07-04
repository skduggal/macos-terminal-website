import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Chroma } from "langchain/vectorstores/chroma";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// Init OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Read all text files from /data folder
const dataFolder = "../data";
const texts = [];

fs.readdirSync(dataFolder).forEach((file) => {
  const content = fs.readFileSync(path.join(dataFolder, file), "utf8");
  const chunks = content.match(/(.|[\r\n]){1,500}/g) || [];
  chunks.forEach((chunk, i) => {
    texts.push({
      id: `${file}_${i}`,
      text: chunk,
    });
  });
});

// Embed and save Chroma DB
const embedData = async () => {
  const vectorStore = await Chroma.fromTexts(
    texts.map((t) => t.text),
    texts.map((t) => ({ source: t.id })),
    embeddings,
    { collectionName: "sid-knowledge" }
  );

  await vectorStore.save("./chroma_db");
  console.log("✅ Knowledge base embedded into ChromaDB!");
};

embedData();
