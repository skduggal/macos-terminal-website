// Comprehensive test for the new RAG system
import dotenv from "dotenv";
dotenv.config();

const testQuestions = [
  // Critical Zamp tests
  {
    question: "Tell me about your experience at Zamp",
    expectedKeywords: ["AI and Go-To-Market Intern", "transaction-screening", "Pantheon/Temporal", "Morpheus", "Trinity", "95% true-match accuracy"],
    forbiddenKeywords: ["astro", "react", "tailwindcss", "portfolio", "vibe-rater", "data science intern"],
    type: "experience"
  },
  {
    question: "What did you do at Zamp specifically",
    expectedKeywords: ["transaction-screening AI agent", "InfoSec agents", "Morpheus and Trinity", "60%+ cost savings"],
    forbiddenKeywords: ["astro", "react", "tailwindcss", "terminal-style", "portfolio project"],
    type: "experience"
  },

  // Experience completeness tests
  {
    question: "Tell me about your work experience",
    expectedKeywords: ["Zamp", "iKites.AI", "Ernst & Young", "Medanta", "AI and Go-To-Market Intern", "Applied ML Research Intern", "Transaction Diligence Intern", "Machine Learning Intern"],
    forbiddenKeywords: ["vibe-rater", "emotion detection", "spam filtering", "workday2ical"],
    type: "experience"
  },
  {
    question: "What are your experiences",
    expectedKeywords: ["Zamp", "iKites.AI", "EY", "Medanta"],
    forbiddenKeywords: ["projects", "vibe-rater", "terminal portfolio"],
    type: "experience"
  },

  // Project isolation tests
  {
    question: "Tell me about your projects",
    expectedKeywords: ["Vibe-Rater", "Emotion Detection", "Email Spam Filtering", "macOS Terminal Portfolio", "Workday2iCal"],
    forbiddenKeywords: ["Zamp", "iKites.AI", "Ernst & Young", "Medanta", "internship"],
    type: "project"
  },
  {
    question: "What projects have you built",
    expectedKeywords: ["sentiment analysis", "deep learning", "K-NN", "terminal-style interface"],
    forbiddenKeywords: ["Zamp", "work experience", "internship", "AI and Go-To-Market"],
    type: "project"
  },

  // Specific accuracy tests
  {
    question: "What was your role at iKites.AI",
    expectedKeywords: ["Applied ML Research Intern", "Prof. Amit Sethi", "breast tissue images", "Inception-v3 CNN", "93% accuracy"],
    forbiddenKeywords: ["data science", "transaction-screening", "portfolio project"],
    type: "experience"
  },
  {
    question: "What did you do at EY",
    expectedKeywords: ["Transaction Diligence Intern", "financial due diligence", "chemical manufacturer", "M&A decisions"],
    forbiddenKeywords: ["technology risk", "AI and Go-To-Market", "machine learning"],
    type: "experience"
  }
];

async function testNewSystem() {
  console.log("🧪 TESTING NEW RAG SYSTEM...\n");
  console.log("⚠️  Testing both accuracy and contamination prevention\n");

  let passedTests = 0;
  let failedTests = 0;

  for (const test of testQuestions) {
    try {
      console.log(`❓ Testing: "${test.question}"`);

      const response = await fetch('http://localhost:4321/api/ask-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: test.question }),
      });

      const data = await response.json();
      const answer = data.answer.toLowerCase();

      // Check for required keywords
      const missingKeywords = test.expectedKeywords.filter(keyword =>
        !answer.includes(keyword.toLowerCase())
      );

      // Check for forbidden keywords (contamination)
      const foundForbidden = test.forbiddenKeywords.filter(keyword =>
        answer.includes(keyword.toLowerCase())
      );

      let testPassed = true;
      let issues = [];

      if (missingKeywords.length > 0) {
        testPassed = false;
        issues.push(`Missing keywords: ${missingKeywords.join(', ')}`);
      }

      if (foundForbidden.length > 0) {
        testPassed = false;
        issues.push(`❌ CONTAMINATION: Found forbidden terms: ${foundForbidden.join(', ')}`);
      }

      if (testPassed) {
        console.log(`✅ PASSED`);
        passedTests++;
      } else {
        console.log(`❌ FAILED`);
        issues.forEach(issue => console.log(`   - ${issue}`));
        failedTests++;
      }

      console.log(`📝 Response (first 200 chars): "${data.answer.substring(0, 200)}..."`);
      console.log("─".repeat(80));

    } catch (error) {
      console.log(`❌ ERROR testing "${test.question}":`, error.message);
      failedTests++;
    }
  }

  console.log(`\n📊 FINAL TEST RESULTS:`);
  console.log(`✅ Passed: ${passedTests}/${passedTests + failedTests}`);
  console.log(`❌ Failed: ${failedTests}/${passedTests + failedTests}`);

  if (failedTests === 0) {
    console.log(`\n🎉 ALL TESTS PASSED! The new RAG system is working correctly.`);
    console.log(`   ✓ No contamination between experience and project data`);
    console.log(`   ✓ Accurate information retrieval`);
    console.log(`   ✓ Proper source isolation`);
  } else {
    console.log(`\n⚠️  ${failedTests} tests failed. System needs further refinement.`);
  }

  return { passed: passedTests, failed: failedTests };
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testNewSystem();
}

export { testNewSystem };