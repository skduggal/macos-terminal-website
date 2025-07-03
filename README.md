# macOS Terminal Portfolio Website – AI Edition

An interactive, macOS-inspired developer portfolio designed by **Siddhanth Duggal**.

This isn’t your typical portfolio. Alongside a sleek macOS-style UI, this site integrates a **Retrieval-Augmented Generation (RAG)** pipeline that allows visitors to interact with an AI agent trained specifically on my resume, projects, and career highlights.

It’s not just a website - it’s **an intelligent assistant that knows me.**

---

### ⚡ What Makes This Unique?

✅ **RAG-Powered Terminal Chat**  
The macOS terminal is fully interactive and leverages an advanced **LLM + vector store architecture** to provide intelligent responses. Visitors can query the AI about my work experience, projects, or skills, and receive answers grounded in actual documents I’ve authored. 

✅ **Multi-Stage Retrieval Pipeline**  
The system combines semantic search using vector similarity with contextual re-ranking to ensure only the most relevant data is passed to the LLM. This allows for nuanced, high-accuracy answers even to open-ended queries.

✅ **Dynamic macOS UI**  
Includes an interactive terminal, rotating wallpapers, and a responsive macOS dock for quick access to my resume, LinkedIn, and GitHub. Styled with Tailwind CSS for a clean, minimal aesthetic.

✅ **Agentic Query Routing**  
The AI agent dynamically decides whether to fetch from the knowledge base, use GPT for reasoning, or execute predefined commands within the terminal environment.

---

### 🛠 Tech Stack & Architecture

- **Astro** – Static site generator for high performance and fast page loads  
- **React** – Renders interactive components like the terminal and dock  
- **TypeScript** – Provides type safety and maintainability across the project  
- **Tailwind CSS** – For utility-first responsive styling  
- **OpenAI GPT-4** – Powers the natural language understanding and generation  
- **Pinecone Vector DB** – Stores vector embeddings of knowledge sources for efficient semantic retrieval  
- **LangChain** – Handles RAG orchestration, including document chunking, embedding, retrieval, and prompt engineering  

---

### 🧠 Technical Implementation Details

1. **Document Ingestion & Embedding**  
   - Key documents (resume, GitHub READMEs, and articles) are processed and embedded using OpenAI’s `text-embedding-ada-002` model.
   - Each document is split into contextually coherent chunks with metadata tags for provenance tracking.

2. **Vector Storage**  
   - Embeddings are stored in Pinecone for efficient approximate nearest neighbor search.
   - Queries are vectorized in real time and matched against this index.

3. **Retriever + Generator (RAG)**  
   - LangChain manages retrieval and constructs prompts for GPT-4 with retrieved chunks, allowing the LLM to respond with grounded answers.
   - Implements a **hybrid retrieval strategy**: semantic similarity + keyword matching for fallback.

4. **Terminal UI Integration**  
   - AI responses are piped into a macOS-styled terminal UI built with React, maintaining the illusion of a native system interface.

5. **Query Routing Logic**  
   - Custom middleware distinguishes between RAG-required queries, local terminal commands, and fallback GPT reasoning.

---

### About Me

I’m **Siddhanth Duggal**, a BSc student in Statistics & Biochemistry at UBC with a focus on applied AI and quant finance. This portfolio demonstrates my ability to design **end-to-end AI systems**, from vector databases to UI integration, while keeping a focus on user-centric design.

> *“If ChatGPT and macOS had a baby, it would be this portfolio.”*
