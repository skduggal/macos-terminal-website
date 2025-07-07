import fetch from 'node-fetch';

const API_URL = 'http://localhost:5050/api/ask';

async function testPrompt(question) {
  try {
    console.log(`\n🤔 Testing: "${question}"`);
    console.log('─'.repeat(50));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ Error: ${data.error}`);
    } else {
      console.log(`✅ Answer: ${data.answer}`);
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

// Test different types of questions
const testQuestions = [
  "Tell me about your education",
  "What are your skills?",
  "Tell me about your projects",
  "What's your background?",
  "Where did you study?",
  "What technologies do you know?",
  "Tell me about your experience",
  "What projects have you worked on?",
  "Tell me about yourself",
  "What's your contact information?"
];

async function runTests() {
  console.log('🚀 Starting prompt tests...\n');
  
  for (const question of testQuestions) {
    await testPrompt(question);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n✨ All tests completed!');
}

runTests().catch(console.error); 