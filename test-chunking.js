// Test what chunks are generated from experience.txt
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Read experience.txt
const experienceFile = path.join(__dirname, "data", "experience.txt");
const experienceText = fs.readFileSync(experienceFile, "utf8");

console.log("📁 EXPERIENCE.TXT CONTENT:");
console.log("=" * 60);
console.log(experienceText);
console.log("=" * 60);

console.log("\n🔍 CHUNKS GENERATED:");
console.log("=" * 60);

const chunks = chunkTextSlidingWindow(experienceText, 400, 100);

chunks.forEach((chunk, index) => {
  console.log(`\n--- CHUNK ${index + 1} ---`);
  console.log(`Length: ${chunk.length} chars`);
  console.log(`Content: "${chunk}"`);

  // Check if this chunk contains Zamp information
  if (chunk.toLowerCase().includes('zamp')) {
    console.log("🎯 *** CONTAINS ZAMP INFO ***");
  }
  if (chunk.toLowerCase().includes('ai and go-to-market')) {
    console.log("🎯 *** CONTAINS CORRECT ZAMP TITLE ***");
  }
  if (chunk.toLowerCase().includes('transaction-screening')) {
    console.log("🎯 *** CONTAINS TRANSACTION-SCREENING ***");
  }
});

console.log(`\n📊 SUMMARY:`);
console.log(`Total chunks: ${chunks.length}`);
console.log(`Original text length: ${experienceText.length} chars`);

const zampChunks = chunks.filter(chunk => chunk.toLowerCase().includes('zamp'));
console.log(`Chunks containing 'Zamp': ${zampChunks.length}`);