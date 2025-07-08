# macOS Terminal Portfolio – AI Edition

An interactive, macOS-inspired developer portfolio designed by **Siddhanth Duggal**.

Alongside a sleek macOS-style UI, this site integrates a **Retrieval-Augmented Generation (RAG)** pipeline that allows visitors to interact with an AI agent trained specifically on my resume, projects, and career highlights.

---

### ⚡ What Makes This Unique?

✅ **RAG-Powered Terminal Chat**  
The macOS terminal is fully interactive and leverages an advanced **LLM + vector store architecture** to provide intelligent responses. Visitors can query the AI about my work experience, projects, or skills, and receive answers grounded in actual documents I've authored. 

✅ **Multi-Stage Retrieval Pipeline**  
The system combines semantic search using vector similarity with contextual re-ranking to ensure only the most relevant data is passed to the LLM. This allows for nuanced, high-accuracy answers even to open-ended queries.

✅ **Dynamic macOS UI**  
Includes an interactive terminal, rotating wallpapers, and a responsive macOS dock for quick access to my resume, LinkedIn, and GitHub. Styled with Tailwind CSS for a clean, minimal aesthetic.

✅ **Agentic Query Routing**  
The AI agent dynamically decides whether to fetch from the knowledge base, use GPT for reasoning, or execute predefined commands within the terminal environment.

---

### 🛠 Tech Stack & Architecture

- **Astro** – Modern web framework for high performance and fast page loads  
- **React** – Renders interactive components like the terminal and dock  
- **TypeScript** – Provides type safety and maintainability across the project  
- **Tailwind CSS** – For utility-first responsive styling  
- **OpenAI GPT-4** – Powers the natural language understanding and generation  
- **Qdrant Cloud Vector DB** – Stores vector embeddings of knowledge sources for efficient semantic retrieval  
- **LangChain** – Handles RAG orchestration, including document chunking, embedding, retrieval, and prompt engineering  

---

### 🧠 Technical Implementation Details

1. **Document Ingestion & Embedding**  
   - Key documents (resume, experience, skills, projects, etc.) in `/data/*.txt` are processed and embedded using OpenAI's `text-embedding-3-small` model.
   - Each document is split into contextually coherent chunks using a sliding window (400 chars, 100 overlap) with metadata tags for provenance tracking.
   - Embeddings are uploaded to Qdrant Cloud using the ingestion script in `backend/embed-knowledge.js`.

2. **Vector Storage**  
   - Embeddings are stored in Qdrant Cloud for efficient approximate nearest neighbor search.
   - Queries are vectorized in real time and matched against this index.

3. **Retriever + Generator (RAG)**  
   - LangChain manages retrieval and constructs prompts for GPT-4 with retrieved chunks, allowing the LLM to respond with grounded answers.
   - Implements a **hybrid retrieval strategy**: semantic similarity + prompt-based synthesis for high-quality, recruiter-ready answers.

4. **Serverless API Backend**  
   - The `/api/ask` route (Astro API endpoint) handles RAG logic, using Qdrant for retrieval and OpenAI for LLM synthesis.
   - No separate Express server is needed; the backend is fully serverless and Vercel-compatible.

5. **Terminal UI Integration**  
   - AI responses are piped into a macOS-styled terminal UI built with React, maintaining the illusion of a native system interface.

---

### About Me

I'm **Siddhanth Duggal**, a BSc student in Statistics & Biochemistry at UBC with a focus on applied AI and quant finance. This portfolio demonstrates my ability to design **end-to-end AI systems**, from vector databases to UI integration, while keeping a focus on user-centric design.

> *"If ChatGPT and macOS had a baby, it would be this portfolio."*
