// Test script specifically for Zamp hallucination issues
import dotenv from "dotenv";
dotenv.config();

const testQuestions = [
  // Direct Zamp experience questions that were hallucinating
  "Tell me about your experience at Zamp",
  "What did you do at Zamp?",
  "Tell me about your Zamp internship",
  "What technologies did you use at Zamp?",
  "What projects did you work on at Zamp?",

  // General experience questions
  "Tell me about your work experience",
  "What are your experiences?",
  "Tell me about your experiences",

  // Control tests - these should work correctly
  "Tell me about your projects",
  "What projects have you built?",
];

const FORBIDDEN_TERMS = [
  'astro', 'react', 'tailwindcss', 'tailwind', 'macos terminal', 'portfolio',
  'terminal-style', 'terminal aesthetic', 'responsive front-end'
];

const ALLOWED_ZAMP_TERMS = [
  'transaction-screening', 'pantheon', 'temporal', 'morpheus', 'trinity',
  'infosec', 'compliance', 'semantic search', 'rag', 'openai embeddings', 'qdrant'
];

async function testZampHallucination() {
  console.log("🧪 Testing Zamp hallucination fixes...\n");
  console.log("⚠️  Looking for contamination from portfolio project technologies\n");

  let passedTests = 0;
  let failedTests = 0;

  for (const question of testQuestions) {
    try {
      console.log(`❓ Testing: "${question}"`);

      const response = await fetch('http://localhost:4321/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      const answer = data.answer.toLowerCase();

      // Check for forbidden terms (portfolio project contamination)
      const foundForbidden = FORBIDDEN_TERMS.filter(term => answer.includes(term));

      // Check if this is a Zamp question
      const isZampQuestion = question.toLowerCase().includes('zamp');

      if (foundForbidden.length > 0) {
        console.log(`❌ HALLUCINATION DETECTED!`);
        console.log(`🚨 Forbidden terms found: ${foundForbidden.join(', ')}`);
        console.log(`📝 Response excerpt: "${data.answer.substring(0, 200)}..."`);
        failedTests++;
      } else {
        console.log(`✅ No hallucination detected`);
        if (isZampQuestion) {
          // For Zamp questions, check if appropriate terms are present
          const foundAllowed = ALLOWED_ZAMP_TERMS.filter(term => answer.includes(term));
          console.log(`🎯 Zamp-appropriate terms found: ${foundAllowed.join(', ')}`);
        }
        console.log(`📝 Response: "${data.answer.substring(0, 150)}..."`);
        passedTests++;
      }

      console.log("─".repeat(80));

    } catch (error) {
      console.log(`❌ Error testing "${question}":`, error.message);
      failedTests++;
    }
  }

  console.log(`\n📊 TEST RESULTS:`);
  console.log(`✅ Passed: ${passedTests}/${passedTests + failedTests}`);
  console.log(`❌ Failed: ${failedTests}/${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log(`🎉 All tests passed! Hallucination issue appears to be fixed.`);
  } else {
    console.log(`⚠️  ${failedTests} tests failed. Hallucination issue persists.`);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testZampHallucination();
}

export { testZampHallucination };