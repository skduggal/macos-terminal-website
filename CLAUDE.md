# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Runs Astro dev server with React components
- **Build**: `npm run build` - Builds the production site with SSR
- **Preview**: `npm run preview` - Previews the production build locally

## Architecture Overview

This is a **macOS-inspired portfolio site** with an integrated **RAG-powered AI assistant** that can answer questions about the developer's background using a vector database.

### Core Technologies
- **Astro** - Main framework with server-side rendering
- **React** - Interactive components (terminal, dock)
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Styling (configured via Vite plugin)
- **OpenAI GPT-4** - LLM for chat responses
- **Qdrant Cloud** - Vector database for embeddings
- **LangChain** - RAG orchestration

### Key Components

**Frontend Architecture:**
- `/src/pages/index.astro` - Main landing page
- `/src/components/global/MacTerminal.tsx` - Interactive terminal component with chat functionality
- `/src/components/global/DesktopDock.tsx` & `MobileDock.tsx` - macOS-style dock navigation
- `/src/layouts/Layout.astro` & `AppLayout.tsx` - Page layouts with macOS styling

**Backend API:**
- `/src/pages/api/ask.ts` - Main RAG endpoint that handles chat queries
- Uses dual prompt system: `masterPrompt` for structured questions, `conversationalPrompt` for ambiguous queries
- Integrates Qdrant vector search with OpenAI embeddings and GPT-4

**Knowledge Base:**
- `/data/*.txt` files contain resume information (experience, projects, skills, education, etc.)
- `/backend/embed-knowledge.js` - Script to process and embed knowledge files into Qdrant
- Uses sliding window chunking (400 chars, 100 overlap) with metadata tracking

### Environment Requirements

The following environment variables are required:
- `OPENAI_API_KEY` - OpenAI API access
- `QDRANT_URL` - Qdrant Cloud instance URL
- `QDRANT_API_KEY` - Qdrant Cloud API key

### RAG System Details

The AI assistant uses a sophisticated retrieval system:
1. **Semantic Search**: Vector similarity search in Qdrant using OpenAI embeddings
2. **Dual Prompts**: Automatically selects between structured vs conversational prompts based on question analysis
3. **Enhanced Retrieval**: Primary search + fallback general terms for ambiguous queries
4. **Context Assembly**: Combines and deduplicates results, takes top 10 chunks

### Deployment Configuration

- **SSR Mode**: `output: 'server'` in astro.config.mjs for API routes
- **Vercel Adapter**: Configured for serverless deployment
- **External Dependencies**: LangChain packages externalized in Rollup config
- **Proxy Setup**: Dev server proxies `/api` to localhost:5050

### Knowledge Base Management

To update the AI's knowledge:
1. Edit files in `/data/` directory
2. Run `node backend/embed-knowledge.js` to re-embed content
3. Deploy changes to update the live assistant

The system expects specific file structure in `/data/`:
- `experience.txt` - Work history and internships
- `projects.txt` - Technical projects and achievements
- `skills.txt` - Technical skills and technologies
- `education.txt` - Academic background
- `about.txt` - Personal information and interests
- `personal details.txt` - Contact information