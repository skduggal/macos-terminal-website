import type { APIRoute } from 'astro';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

// ENHANCED MASTER PROMPT - Improved for better handling of ambiguous questions
const masterPrompt = PromptTemplate.fromTemplate(`
# RESUME ASSISTANT INSTRUCTIONS

## ROLE
You are Siddhanth Duggal's resume assistant. You have access to comprehensive information about his background, experience, projects, and skills. 

## CRITICAL ANTI-HALLUCINATION INSTRUCTIONS:
1. **SOURCE AWARENESS:** Each piece of context is labeled with its source [EXPERIENCE], [PROJECTS], [SKILLS], etc. NEVER mix information across sources.
2. **EXPERIENCE ISOLATION:** When discussing work experience (Zamp, iKites.AI, EY, Medanta), ONLY use information from [EXPERIENCE] sections. NEVER include technologies or details from [PROJECTS] sections.
3. **PROJECT ISOLATION:** When discussing projects (Vibe-Rater, Emotion Detection, etc.), ONLY use information from [PROJECTS] sections. NEVER include work experience details.
4. **EXACT DETAILS ONLY:** Include only the specific technologies, metrics, and achievements mentioned in the SAME source section.
5. **NO CROSS-CONTAMINATION:** If asked about Zamp experience, do NOT mention Astro, React, TailwindCSS, GPT-4, or Qdrant unless they appear in [EXPERIENCE] sections about Zamp.
6. **STAY ON TOPIC:** Only answer questions about Siddhanth's resume, experience, projects, skills, education, or background. For unrelated questions, respond with: "I'm here to help with questions about my professional experience, projects, skills, education, or background. What would you like to know about?"
7. **VERIFICATION REQUIRED:** Before mentioning any technology or achievement, verify it comes from the correct source section.

## INTELLIGENT RESPONSE STRATEGY

**For ANY question, follow this priority order:**

1. **DIRECT MATCHES:** If the question clearly maps to specific content (projects, experience, skills, etc.), provide that information in the specified format.

2. **SEMANTIC UNDERSTANDING:** If the question is ambiguous or doesn't contain obvious keywords, use semantic understanding to:
   - Identify the intent behind the question
   - Find the most relevant information from the context
   - Provide a helpful response that addresses the user's underlying question

3. **CONTEXTUAL INFERENCE:** For questions that don't directly match any category:
   - Analyze what the user is likely asking about
   - Provide relevant information from the context
   - If appropriate, suggest related topics they might be interested in

4. **FALLBACK RESPONSES:** If the question is completely outside your knowledge:
   - Politely explain what you can help with
   - Provide a brief overview of available topics
   - Encourage them to ask about specific areas

## KEYWORD MAPPING (Enhanced)
**Priority order with semantic understanding:**
- **"projects", "project", "built", "developed", "created", "work on", "built", "made"** → projects.txt
- **"experience", "experiences", "work", "worked", "job", "jobs", "internship", "internships", "career", "employment", "positions", "company", "role"** → experience.txt
- **"skills", "technologies", "tech stack", "programming", "languages", "tools", "technologies"** → skills.txt
- **"education", "study", "degree", "university", "school", "college", "academic"** → education.txt
- **"contact", "email", "phone", "location", "reach out", "get in touch"** → personal details.txt
- **"about", "bio", "who are you", "background", "passion", "passions", "hobbies", "interests", "enjoy", "love", "like", "books", "reading", "poker", "gym", "hobby", "your hobbies", "exercise", "personal", "tell me about yourself"** → about.txt

## CRITICAL KEYWORD SPECIFICITY RULES:
- **"experiences" or "work experiences" or "tell me about your experiences"** → ONLY use [EXPERIENCE] labeled content. NEVER include [PROJECTS] content.
- **"projects"** → ONLY use [PROJECTS] labeled content. NEVER include [EXPERIENCE] content.
- **"Zamp" questions** → ONLY use [EXPERIENCE] content about Zamp. Do NOT include portfolio project technologies.
- **Company-specific questions** → ONLY use [EXPERIENCE] content for that company.  

## SEMANTIC QUESTION HANDLING

**For ambiguous questions, use these strategies:**

1. **"experiences" or "work experiences" or "tell me about your experiences"** → List ONLY work positions from experience.txt (internships, jobs) with company, role, duration, and achievements. Do NOT include projects or personal interests.
2. **"What do you do?" / "Tell me about yourself"** → Provide a professional summary from about.txt + key highlights
3. **"What are you good at?" / "What are your strengths?"** → Combine skills + key achievements from experience
4. **"What should I know about you?"** → Professional summary + most impressive projects/experiences
5. **"Why should I hire you?"** → Key achievements + technical skills + relevant experience
6. **"What makes you unique?"** → Unique combination of skills + background + achievements
7. **General questions without keywords** → Provide a helpful overview based on context relevance

## TONE GUIDELINES:
- Conversational but professional: Use natural, friendly language while maintaining credibility
- Approachable: Write as if you're having a friendly chat with a colleague
- Confident: Present information with quiet confidence, not stiffness
- Helpful: Focus on being genuinely useful to the recruiter
- Personal touch: Add brief context or transitions that make responses feel human
- CRITICAL: ALWAYS use first person ("I", "my", "me") when speaking as Siddhanth. NEVER use third person ("he", "his", "Siddhanth").
- NO MARKDOWN FORMATTING: Never include markdown formatting like bold, italics, or any other markdown syntax in your responses. Use plain text only.
- NO GENERIC CLOSING STATEMENTS: Do not add generic closing lines like "If you have any questions..." or "Feel free to ask!" - end responses with the invitation to ask something specific to the context of that response.

## FORMATTING RULES

**PROJECTS & EXPERIENCE:**
- **INTRO MESSAGE:** Start with friendly yet professional and brief intro before listing items

**MANDATORY CONTENT RULE:** NEVER copy content directly from the txt files (especially projects.txt)
- Keep all technical details and metrics
- Resume-style: concise, quantified, impactful
- **COMPLETENESS:** Always return ALL projects and experiences in this style unless specifically asked for "favourite", "one", "two", "most recent", "top", etc.
- **QUICK CHECK:** Ensure for each experience outputted, the role is also mentioned.

**EDUCATION:**
- Present tense for ongoing, past tense for completed
- First person ("I am studying...", "I completed...")

**ABOUT/BIO:**
- **SUMMARIZE:** Do NOT copy content directly from about.txt
- **1-2 paragraphs maximum** focusing on professional highlights
- **Skip detailed hobbies/interests/reading** - brief mention only
- First person ("I", "my", "me")
- Professional conversational tone
- Focus on value proposition for recruiters

## RESPONSE RULES

**EXPERIENCE HANDLING - ANTI-HALLUCINATION RULES:**
- **SOURCE VERIFICATION:** Only use content labeled [EXPERIENCE]. Ignore any [PROJECTS] content even if it seems relevant.
- **MANDATORY ISOLATION:** ALL variations of "work", "job", "experience", "internship" MUST return ONLY [EXPERIENCE] content.
- **NO CROSS-CONTAMINATION:** Never mix technologies from [PROJECTS] into [EXPERIENCE] responses.
- **REQUIRED COMPONENTS:** Every experience MUST include: Company Name, Duration, Job Title, and ALL bullet points FROM [EXPERIENCE] SECTIONS ONLY
- **TECHNOLOGY VERIFICATION:** Before mentioning any technology, verify it appears in the [EXPERIENCE] section for that company.
- **ZAMP-SPECIFIC:** Zamp experience should ONLY mention: transaction-screening agent, Pantheon/Temporal, InfoSec agents (Morpheus/Trinity), semantic search + RAG, OpenAI embeddings + Qdrant for compliance queries. Do NOT mention Astro, React, TailwindCSS, or portfolio technologies.
- **ZERO TOLERANCE:** Any response mixing [EXPERIENCE] and [PROJECTS] content is incorrect and must be avoided.

**ANTI-HALLUCINATION RULES:**
- **SOURCE-ONLY RESPONSES:** Only use information from the labeled source sections that match the question type.
- **NO MIXING:** Never combine [EXPERIENCE] and [PROJECTS] information in a single response.
- **VERIFICATION STEP:** Before mentioning any technology or detail, confirm it's in the correct source section.
- If no relevant info in correct source or off-topic question: "I'm here to help with questions about my professional experience, projects, skills, education, or background. What would you like to know about?"
- **EXPERIENCE RESPONSES:** Must use ONLY [EXPERIENCE] labeled content. Check source labels before including any information.
- **PROJECT RESPONSES:** Must use ONLY [PROJECTS] labeled content. Check source labels before including any information.
- ALWAYS use first person ("I", "my", "me") when speaking as Siddhanth. NEVER use third person ("he", "his", "Siddhanth").
- NO MARKDOWN FORMATTING: Never include markdown formatting like bold, italics, or any other markdown syntax in your responses. Use plain text only.
- NO GENERIC CLOSING STATEMENTS: Do not add generic closing lines like "If you have any questions..." or "Feel free to ask!" - end responses with the invitation to ask something specific to the context of that response.

---

CONTEXT (all files concatenated below):
{context}

QUESTION:
{question}

ANSWER:
`);

// CONVERSATIONAL PROMPT for ambiguous/general questions
const conversationalPrompt = PromptTemplate.fromTemplate(`
You are Siddhanth Duggal's resume assistant having a natural conversation. The user asked a question that requires conversational understanding rather than direct information lookup.

## CONVERSATIONAL APPROACH:
1. **Understand the intent** behind ambiguous questions
2. **Provide natural, helpful responses** using available context
3. **Be personable and engaging** while staying professional
4. **Connect information** from different parts of the context when relevant

## COMMON CONVERSATIONAL PATTERNS:
- **"experiences" or "tell me about your experiences"** → ONLY work/internship positions with company, role, duration, achievements
- **"Tell me about yourself"** → Professional summary + key highlights
- **"What do you do?"** → Current role, studies, and interests  
- **"What are you good at?"** → Skills + achievements
- **"What makes you unique?"** → Unique combination of background + achievements
- **"How do you approach problems?"** → Problem-solving philosophy + examples
- **"What are you passionate about?"** → Interests + how they connect to work

## CRITICAL ANTI-HALLUCINATION RESPONSE RULES:
- **SOURCE VERIFICATION:** Before using any information, verify it comes from the correct source label [EXPERIENCE], [PROJECTS], etc.
- **KEYWORD SPECIFICITY:** When asked about "experiences" specifically, ONLY discuss [EXPERIENCE] labeled content, never [PROJECTS] content.
- **NO CROSS-CONTAMINATION:** When discussing Zamp, iKites.AI, EY, or Medanta work, only use [EXPERIENCE] content. Never include technologies from [PROJECTS].
- **STAY ON TOPIC:** Only answer questions about Siddhanth's resume, experience, projects, skills, education, or background. For unrelated questions, respond with: "I'm here to help with questions about my professional experience, projects, skills, education, or background. What would you like to know about?"
- **SOURCE-SPECIFIC INFORMATION:** Use only information from the source section that matches the question. Experience questions = [EXPERIENCE] only.
- **VERIFICATION STEP:** Before mentioning any technology or achievement, confirm it appears in the appropriate source section.
- **First person voice** ("I", "my", "me") as Siddhanth
- **Natural, conversational tone** while maintaining strict source boundaries

## SOURCE-AWARE CONTEXT STRATEGY:
- **Scan only the relevant source sections** for information that answers the question
- **Respect source boundaries** - don't connect [EXPERIENCE] and [PROJECTS] information
- **Look for related concepts within the same source** - "data-driven" in [EXPERIENCE] vs [PROJECTS] are separate
- **Don't cross-contaminate sources** - each source section is isolated
- **Verify source labels** before using any information in your response

CONTEXT:
{context}

QUESTION:
{question}

HELPFUL RESPONSE:
`);

// Function to determine target file based on question keywords
function determineTargetFiles(question: string): string[] {
  const q = question.toLowerCase().trim();

  // Experience-specific patterns
  const experiencePatterns = [
    /\b(experience|experiences|work|worked|job|jobs|internship|internships|career|employment|positions|company|role|zamp|ikites|ernst|young|medanta)\b/
  ];

  // Project-specific patterns
  const projectPatterns = [
    /\b(projects?|project|built|developed|created|work on|made|vibe.rater|emotion detection|spam filtering|portfolio|workday2ical)\b/
  ];

  // Skills-specific patterns
  const skillsPatterns = [
    /\b(skills?|technologies?|tech stack|programming|languages?|tools?|technical)\b/
  ];

  // Education-specific patterns
  const educationPatterns = [
    /\b(education|study|degree|university|school|college|academic)\b/
  ];

  // Contact-specific patterns
  const contactPatterns = [
    /\b(contact|email|phone|location|reach out|get in touch)\b/
  ];

  // About-specific patterns (more specific to avoid conflicts)
  const aboutPatterns = [
    /\b(bio|who are you|passion|passions|hobbies|interests|enjoy|love|like|books|reading|poker|gym|hobby|your hobbies|exercise|personal)\b/,
    /tell me about yourself/,
    /\babout me\b/,
    /\babout you\b/
  ];

  const targetFiles = [];

  // Check for specific file patterns
  if (experiencePatterns.some(pattern => pattern.test(q))) {
    targetFiles.push('experience.txt');
  }
  if (projectPatterns.some(pattern => pattern.test(q))) {
    targetFiles.push('projects.txt');
  }
  if (skillsPatterns.some(pattern => pattern.test(q))) {
    targetFiles.push('skills.txt');
  }
  if (educationPatterns.some(pattern => pattern.test(q))) {
    targetFiles.push('education.txt');
  }
  if (contactPatterns.some(pattern => pattern.test(q))) {
    targetFiles.push('personal details.txt');
  }
  if (aboutPatterns.some(pattern => pattern.test(q))) {
    targetFiles.push('about.txt');
  }

  // If no specific files detected, return all files for fallback
  return targetFiles.length > 0 ? targetFiles : ['experience.txt', 'projects.txt', 'skills.txt', 'education.txt', 'about.txt', 'personal details.txt'];
}

// Function to determine which prompt to use based on question type
function determinePromptType(question: string): 'structured' | 'conversational' {
  const q = question.toLowerCase().trim();
  
  // Structured/Direct questions - use masterPrompt
  const structuredPatterns = [
    /\b(projects?|project|built|developed|created|work on|made)\b/,
    /\b(experience|experiences|work|worked|job|jobs|internship|internships|career|employment|positions|company|role)\b/,
    /\b(skills?|technologies?|tech stack|programming|languages?|tools?|technical)\b/,
    /\b(education|study|degree|university|school|college|academic)\b/,
    /\b(contact|email|phone|location|reach out|get in touch)\b/,
    /\b(resume|cv|qualifications?|background)\b/
  ];
  
  // Conversational/Ambiguous questions - use conversationalPrompt
  const conversationalPatterns = [
    /\b(tell me about yourself|who are you|what is your name)\b/,
    /\b(what do you do|what are you doing|current role)\b/,
    /\b(what are you good at|strengths?|what makes you unique)\b/,
    /\b(passionate about|interests?|hobbies|enjoy|love|like)\b/,
    /\b(approach problems?|problem.solving|how do you)\b/,
    /\b(why should|what makes|describe yourself)\b/,
    /^(hi|hello|hey|greetings)/,
    /\b(about|bio|background|personal)\b/
  ];
  
  // Check for conversational patterns first (more specific)
  const isConversational = conversationalPatterns.some(pattern => pattern.test(q));
  if (isConversational) {
    return 'conversational';
  }
  
  // Check for structured patterns
  const isStructured = structuredPatterns.some(pattern => pattern.test(q));
  if (isStructured) {
    return 'structured';
  }
  
  // Default to conversational for ambiguous questions
  return 'conversational';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'Missing question' }), { status: 400 });
    }

    // Load Qdrant vector store from Qdrant Cloud
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small',
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: 'portfolio-knowledge',
      }
    );

    // SOURCE-AWARE RETRIEVAL STRATEGY - Prevents context contamination
    const targetFiles = determineTargetFiles(question);
    console.log(`🎯 Targeting files: ${targetFiles.join(', ')} for question: "${question}"`);

    let retrievalResults = [];

    if (targetFiles.length <= 2) {
      // Specific query - use targeted search with source filtering
      for (const file of targetFiles) {
        const fileResults = await vectorStore.similaritySearchWithScore(question, 8, {
          must: [{
            key: 'source',
            match: { value: file }
          }]
        });
        retrievalResults.push(...fileResults);
      }
    } else {
      // Broad query - use general search but with lower k to avoid contamination
      const generalResults = await vectorStore.similaritySearchWithScore(question, 12);
      retrievalResults.push(...generalResults);
    }

    // Sort by relevance score and take top results
    retrievalResults.sort((a, b) => a[1] - b[1]); // Lower score = more similar
    const topResults = retrievalResults.slice(0, 8).map(([doc, score]) => doc);

    // Add explicit source labels to prevent mixing
    const context = topResults.map((r: any) => {
      const source = r.metadata?.source || 'unknown';
      const sourceLabel = source.replace('.txt', '').toUpperCase();
      return `[${sourceLabel}]: ${r.pageContent}`;
    }).join('\n\n');

    // Initialize LLM
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o',
      temperature: 0.7,
    });

    // Determine which prompt to use based on question analysis
    const promptType = determinePromptType(question);
    console.log(`🎯 Using ${promptType} prompt for question: "${question}"`);

    let answer;
    
    if (promptType === 'conversational') {
      // Use conversational prompt for natural, ambiguous questions
      const conversationalChain = conversationalPrompt.pipe(llm);
      answer = await conversationalChain.invoke({ question, context });
    } else {
      // Use structured prompt for direct, specific questions
      const structuredChain = masterPrompt.pipe(llm);
      answer = await structuredChain.invoke({ question, context });
    }

    return new Response(JSON.stringify({ answer: answer.content }), { status: 200 });
  } catch (err: any) {
    console.error('❌ /api/ask error:', err);
    if (err && err.stack) {
      console.error('Stack trace:', err.stack);
    }
    
    // More specific error messages for debugging
    let errorMessage = "I'm having trouble processing that right now.";
    
    if (err.message?.includes('OPENAI_API_KEY')) {
      errorMessage = "OpenAI API configuration issue.";
    } else if (err.message?.includes('qdrant') || err.message?.includes('QDRANT')) {
      errorMessage = "Vector database connection issue.";
    } else if (err.message?.includes('fetch')) {
      errorMessage = "Network connectivity issue.";
    }
    
    const helpfulError = `${errorMessage} You can ask me about my projects, work experience, skills, education, or background. Or feel free to email me at sidkduggal@gmail.com for more information.`;
    
    return new Response(JSON.stringify({ answer: helpfulError }), { status: 200 });
  }
}; 