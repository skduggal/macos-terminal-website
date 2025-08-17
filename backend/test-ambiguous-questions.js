// Test script for ambiguous questions
import dotenv from "dotenv";
dotenv.config();

const testQuestions = [
  // Ambiguous questions that should now work better
  "What do you do?",
  "Tell me about yourself",
  "What are you good at?",
  "What should I know about you?",
  "Why should I hire you?",
  "What makes you unique?",
  "How are you?",
  "What's up?",
  "Can you help me?",
  "I'm curious about you",
  
  // Clear keyword questions (should work as before)
  "What projects have you worked on?",
  "Tell me about your experience",
  "What are your skills?",
  "What's your education?",
  "How can I contact you?",
  "Tell me about your background"
];

async function testQuestions() {
  console.log("🧪 Testing ambiguous question handling...\n");
  
  for (const question of testQuestions) {
    try {
      const response = await fetch('http://localhost:4321/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      
      const data = await response.json();
      
      console.log(`❓ Question: "${question}"`);
      console.log(`✅ Response: ${data.answer.substring(0, 150)}...`);
      console.log(`📊 Status: ${response.status}`);
      console.log("─".repeat(80));
      
    } catch (error) {
      console.log(`❌ Error testing "${question}":`, error.message);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testQuestions();
}

export { testQuestions }; 