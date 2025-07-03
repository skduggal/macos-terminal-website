import { useState, useEffect, useRef } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatHistory = {
  messages: Message[];
  input: string;
};

// Customize these placeholder messages for the input field
const PLACEHOLDER_MESSAGES = [
  'Type your question...',
  'How old are you?',
  'What are your skills?',
  'Where are you located?',
  'What projects have you worked on?',
];

export default function MacTerminal() {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    messages: [],
    input: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentMessage = PLACEHOLDER_MESSAGES[currentPlaceholderIndex];

    const animatePlaceholder = () => {
      if (isDeleting) {
        if (placeholder.length === 0) {
          setIsDeleting(false);
          setCurrentPlaceholderIndex(
            (prev) => (prev + 1) % PLACEHOLDER_MESSAGES.length
          );
          timeout = setTimeout(animatePlaceholder, 400);
        } else {
          setPlaceholder((prev) => prev.slice(0, -1));
          timeout = setTimeout(animatePlaceholder, 80);
        }
      } else {
        if (placeholder.length === currentMessage.length) {
          timeout = setTimeout(() => setIsDeleting(true), 1500);
        } else {
          setPlaceholder(currentMessage.slice(0, placeholder.length + 1));
          timeout = setTimeout(animatePlaceholder, 120);
        }
      }
    };

    timeout = setTimeout(animatePlaceholder, 100);

    return () => clearTimeout(timeout);
  }, [placeholder, isDeleting, currentPlaceholderIndex]);

  // Customize this welcome message with your information
  const welcomeMessage = `Welcome to My Portfolio

Name: Siddhanth Duggal
Role: Full Stack Developer
Location: Austin, TX

Contact: john@johndoe.com
GitHub: github.com/johndoe

Ask me anything!
`;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Customize the system prompt with your personal information
  const systemPrompt = `IMPORTANT: You ARE Siddhanth Duggal himself. You must always speak in first-person ("I", "my", "me"). Never refer to "John" in third-person.
CURRENT DATE: ${formattedDate} - Always use this exact date when discussing the current date/year.

Example responses:
Q: "Where do you live?"
A: "I live in Austin, TX"

Q: "What's your background?"
A: "I'm a Full Stack Developer with experience in React, Next.js, and Node.js"

Q: "How old are you?"
A: "I'm 34 years old"

Core details about me:
- I'm 34 years old
- I live in Austin, TX
- I'm a Full Stack Developer
- My email is john@johndoe.com
- I was born in 1991
- I was born in Austin, TX

My technical expertise:
- Full Stack Development
- React, Express, Node, Astro, JavaScript, TypeScript
- Node.js/Express

Response rules:
1. ALWAYS use first-person (I, me, my)
2. Never say "Sid" or refer to myself in third-person
3. Keep responses concise and professional
4. Use markdown formatting when appropriate
5. Maintain a friendly, conversational tone

If a question is unrelated to my work or portfolio, say: "That's outside my area of expertise. Feel free to email me at john@johndoe.com and we can discuss further!"`;

  useEffect(() => {
    setChatHistory((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: 'assistant', content: welcomeMessage },
      ],
    }));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatHistory((prev) => ({ ...prev, input: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = chatHistory.input.trim();

    if (!userInput) return;

    setChatHistory((prev) => ({
      messages: [...prev.messages, { role: 'user', content: userInput }],
      input: '',
    }));

    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory.messages,
            { role: 'user', content: userInput },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: data.message },
        ],
      }));
    } catch (error) {
      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content:
              "I'm having trouble processing that. Please email me at john@johndoe.com",
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className='bg-black/75 w-[600px] h-[400px] rounded-lg overflow-hidden shadow-lg mx-4 sm:mx-0'>
      <div className='bg-gray-800 h-6 flex items-center space-x-2 px-4'>
        <div className='w-3 h-3 rounded-full bg-red-500'></div>
        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
        <div className='w-3 h-3 rounded-full bg-green-500'></div>
        <span className='text-sm text-gray-300 flex-grow text-center font-semibold flex items-center justify-center gap-2'>
          <FaRegFolderClosed size={14} className='text-gray-300' />
          sidkd.com ⸺ zsh
        </span>
      </div>
      <div className='p-4 text-gray-200 font-mono text-xs h-[calc(400px-1.5rem)] flex flex-col'>
        <div className='flex-1 overflow-y-auto'>
          {chatHistory.messages.map((msg, index) => (
            <div key={index} className='mb-2'>
              {msg.role === 'user' ? (
                <div className='flex items-start space-x-2'>
                  <span className='text-green-400'>{'>'}</span>
                  <pre className='whitespace-pre-wrap'>{msg.content}</pre>
                </div>
              ) : (
                <pre className='whitespace-pre-wrap'>{msg.content}</pre>
              )}
            </div>
          ))}
          {isTyping && <div className='animate-pulse'>...</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className='mt-2'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'>
            {/* Customize the terminal title with your domain */}
            <span className='whitespace-nowrap'>john@johndoe.com root %</span>
            <input
              type='text'
              value={chatHistory.input}
              onChange={handleInputChange}
              className='w-full sm:flex-1 bg-transparent outline-none text-white placeholder-gray-400'
              placeholder={placeholder}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
