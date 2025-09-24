// NEW EMBEDDING SYSTEM - Document-Aware Hierarchical Approach
import dotenv from "dotenv";
dotenv.config();

import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-small"
});

// SEMANTIC CHUNKING: Parse experience.txt into logical company blocks
function parseExperience(text) {
  const companies = [];
  const lines = text.split('\n').filter(line => line.trim());

  let currentCompany = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip headers
    if (trimmed === 'WORK EXPERIENCE' || !trimmed) continue;

    // Detect new company (contains | and dates)
    if (trimmed.includes('|') && (trimmed.includes('2022') || trimmed.includes('2023') || trimmed.includes('2024') || trimmed.includes('2025'))) {
      // Save previous company
      if (currentCompany) {
        companies.push(currentCompany);
      }

      // Start new company
      const [companyInfo, dates] = trimmed.split('|').map(s => s.trim());
      currentCompany = {
        company: companyInfo,
        dates: dates,
        title: '',
        details: [],
        fullText: trimmed
      };
    }
    // Job title (no bullet, no |, not empty)
    else if (currentCompany && !trimmed.startsWith('-') && trimmed.length > 0) {
      currentCompany.title = trimmed;
      currentCompany.fullText += '\n' + trimmed;
    }
    // Bullet point details
    else if (currentCompany && trimmed.startsWith('-')) {
      currentCompany.details.push(trimmed);
      currentCompany.fullText += '\n' + trimmed;
    }
  }

  // Don't forget the last company
  if (currentCompany) {
    companies.push(currentCompany);
  }

  return companies;
}

// SEMANTIC CHUNKING: Parse projects.txt into logical project blocks
function parseProjects(text) {
  const projects = [];
  const lines = text.split('\n').filter(line => line.trim());

  let currentProject = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip headers
    if (trimmed === 'PROJECTS' || !trimmed) continue;

    // Detect new project (title without bullets or dates)
    if (!trimmed.startsWith('-') && trimmed.length > 0) {
      // Save previous project
      if (currentProject) {
        projects.push(currentProject);
      }

      // Start new project
      currentProject = {
        project: trimmed,
        details: [],
        fullText: trimmed
      };
    }
    // Bullet point details
    else if (currentProject && trimmed.startsWith('-')) {
      currentProject.details.push(trimmed);
      currentProject.fullText += '\n' + trimmed;
    }
  }

  // Don't forget the last project
  if (currentProject) {
    projects.push(currentProject);
  }

  return projects;
}

// CREATE STRUCTURED DOCUMENTS with rich metadata
function createStructuredDocuments() {
  const documents = [];
  const dataDir = path.resolve(__dirname, "../data");

  // Process each file with semantic understanding
  for (const file of fs.readdirSync(dataDir)) {
    if (!file.endsWith(".txt")) continue;

    const text = fs.readFileSync(path.join(dataDir, file), "utf8");
    const fileType = file.replace('.txt', '');

    console.log(`\n📁 Processing ${file}...`);

    if (file === 'experience.txt') {
      const companies = parseExperience(text);
      console.log(`   Found ${companies.length} companies`);

      companies.forEach((company, index) => {
        documents.push({
          id: `experience_${company.company.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${index}`,
          text: company.fullText,
          metadata: {
            source: 'experience.txt',
            type: 'experience',
            company: company.company,
            title: company.title,
            dates: company.dates,
            index: index,
            chunk_type: 'complete_experience'
          }
        });
        console.log(`     • ${company.company} - ${company.title}`);
      });
    }
    else if (file === 'projects.txt') {
      const projects = parseProjects(text);
      console.log(`   Found ${projects.length} projects`);

      projects.forEach((project, index) => {
        documents.push({
          id: `project_${project.project.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${index}`,
          text: project.fullText,
          metadata: {
            source: 'projects.txt',
            type: 'project',
            project: project.project,
            index: index,
            chunk_type: 'complete_project'
          }
        });
        console.log(`     • ${project.project}`);
      });
    }
    else {
      // For other files, use simple chunking but with better metadata
      const chunks = semanticChunk(text, 500, 50);
      chunks.forEach((chunk, index) => {
        documents.push({
          id: `${fileType}_${index}`,
          text: chunk,
          metadata: {
            source: file,
            type: fileType,
            index: index,
            chunk_type: 'text_chunk'
          }
        });
      });
      console.log(`   Created ${chunks.length} chunks`);
    }
  }

  return documents;
}

// Better chunking for non-structured files
function semanticChunk(text, maxSize = 500, overlap = 50) {
  // Split by paragraphs first, then by sentences
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length <= maxSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks.filter(Boolean);
}

// VALIDATION: Verify documents before embedding
function validateDocuments(documents) {
  console.log('\n🔍 VALIDATING DOCUMENTS...');

  // Check for Zamp specifically
  const zampDocs = documents.filter(doc =>
    doc.text.toLowerCase().includes('zamp') ||
    doc.metadata.company?.toLowerCase().includes('zamp')
  );

  console.log(`✓ Found ${zampDocs.length} Zamp-related documents`);
  zampDocs.forEach(doc => {
    console.log(`   - ${doc.id}: "${doc.text.substring(0, 100)}..."`);
    console.log(`     Metadata:`, doc.metadata);
  });

  // Check all experience companies
  const experienceDocs = documents.filter(doc => doc.metadata.type === 'experience');
  console.log(`\n✓ Found ${experienceDocs.length} experience documents:`);
  experienceDocs.forEach(doc => {
    console.log(`   - ${doc.metadata.company} (${doc.metadata.title})`);
  });

  // Check all projects
  const projectDocs = documents.filter(doc => doc.metadata.type === 'project');
  console.log(`\n✓ Found ${projectDocs.length} project documents:`);
  projectDocs.forEach(doc => {
    console.log(`   - ${doc.metadata.project}`);
  });

  return documents;
}

// MAIN EMBEDDING FUNCTION
async function embedNewSystem() {
  try {
    console.log('🚀 STARTING NEW EMBEDDING SYSTEM...\n');

    // Create structured documents
    const documents = createStructuredDocuments();
    console.log(`\n📊 Total documents created: ${documents.length}`);

    // Validate before embedding
    const validatedDocs = validateDocuments(documents);

    // Prepare for Qdrant
    const texts = validatedDocs.map(d => d.text);
    const metadatas = validatedDocs.map(d => d.metadata);

    console.log('\n📤 EMBEDDING TO QDRANT...');

    // Clear and recreate collection
    const store = await QdrantVectorStore.fromTexts(
      texts,
      metadatas,
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "portfolio-knowledge-v2", // New collection name
      }
    );

    console.log(`\n✅ SUCCESS: Embedded ${validatedDocs.length} structured documents!`);
    console.log(`   Collection: portfolio-knowledge-v2`);

    // Final validation
    console.log('\n🔍 FINAL VERIFICATION...');
    const testQuery = "Zamp experience";
    const testResults = await store.similaritySearch(testQuery, 3);

    console.log(`Test query "${testQuery}" returned ${testResults.length} results:`);
    testResults.forEach((result, i) => {
      console.log(`${i+1}. "${result.pageContent.substring(0, 100)}..."`);
    });

  } catch (error) {
    console.error('❌ EMBEDDING FAILED:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  embedNewSystem();
}

export { embedNewSystem, createStructuredDocuments };