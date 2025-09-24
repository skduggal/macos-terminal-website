// Test the source filtering logic without external APIs
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the source filtering function logic
function determineTargetFiles(question) {
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

const testCases = [
  // Experience questions - should target ONLY experience.txt
  { question: "Tell me about your experience at Zamp", expected: ['experience.txt'] },
  { question: "What did you do at Zamp?", expected: ['experience.txt'] },
  { question: "Tell me about your work experience", expected: ['experience.txt'] },
  { question: "What are your experiences?", expected: ['experience.txt'] },
  { question: "Tell me about your internships", expected: ['experience.txt'] },

  // Project questions - should target ONLY projects.txt
  { question: "Tell me about your projects", expected: ['projects.txt'] },
  { question: "What projects have you built?", expected: ['projects.txt'] },
  { question: "What did you develop?", expected: ['projects.txt'] },

  // Mixed questions - should target both but we want to ensure separation
  { question: "Tell me about yourself", expected: ['about.txt'] },

  // Ambiguous questions - should return all files
  { question: "Hi there", expected: ['experience.txt', 'projects.txt', 'skills.txt', 'education.txt', 'about.txt', 'personal details.txt'] }
];

function testSourceFiltering() {
  console.log("🧪 Testing source filtering logic...\n");

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    const result = determineTargetFiles(testCase.question);

    const passed = JSON.stringify(result.sort()) === JSON.stringify(testCase.expected.sort());

    if (passed) {
      console.log(`✅ "${testCase.question}"`);
      console.log(`   → ${result.join(', ')}`);
      passedTests++;
    } else {
      console.log(`❌ "${testCase.question}"`);
      console.log(`   Expected: ${testCase.expected.join(', ')}`);
      console.log(`   Got: ${result.join(', ')}`);
      failedTests++;
    }
    console.log("");
  }

  console.log(`📊 SOURCE FILTERING TEST RESULTS:`);
  console.log(`✅ Passed: ${passedTests}/${passedTests + failedTests}`);
  console.log(`❌ Failed: ${failedTests}/${passedTests + failedTests}`);

  // Test the critical Zamp cases
  console.log(`\n🎯 CRITICAL ZAMP TESTS:`);
  const zampQuestions = [
    "Tell me about your experience at Zamp",
    "What did you do at Zamp?",
    "Tell me about your Zamp internship"
  ];

  for (const question of zampQuestions) {
    const result = determineTargetFiles(question);
    if (result.length === 1 && result[0] === 'experience.txt') {
      console.log(`✅ "${question}" → experience.txt only`);
    } else {
      console.log(`❌ "${question}" → ${result.join(', ')} (should be experience.txt only)`);
    }
  }

  if (failedTests === 0) {
    console.log(`\n🎉 Source filtering logic is working correctly!`);
    console.log(`   Zamp questions will only target experience.txt, preventing contamination.`);
  } else {
    console.log(`\n⚠️  Source filtering has issues that need to be fixed.`);
  }
}

testSourceFiltering();