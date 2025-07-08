import { useState, useEffect, useRef } from 'react';
import { FaRegFolderClosed } from 'react-icons/fa6';
import React from 'react';

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
  "Tell me about yourself?",
  "What's your work experience?",
  'What are your skills?',
  'What projects have you worked on?',
];

// ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: '1rem' }}>Something went wrong: {this.state.error?.toString()}</div>;
    }
    return this.props.children;
  }
}

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

Hey! I'm a Statistics and Biochemistry student at the University of British Columbia, with a deep focus in artificial intelligence and the design of data-driven systems.

This LLM-powered portfolio website blends my interest in AI architectures (like RAG pipelines) with design-forward development.

Ask me anything!
`;

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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
      // Send to RAG backend
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userInput }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      setChatHistory((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: 'assistant', content: data.answer },
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
              "I'm having trouble processing that. Please email me at sidkduggal@gmail.com",
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ErrorBoundary>
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
          <div className='flex-1 overflow-y-auto overflow-x-hidden'>
            {chatHistory.messages.map((msg, index) => (
              <div key={index} className='mb-2'>
                {msg.role === 'user' ? (
                  <div className='flex items-start space-x-2'>
                    <span className='text-green-400 flex-shrink-0'>{'>'}</span>
                    <pre className='whitespace-pre-wrap break-words overflow-hidden flex-1'>{msg.content}</pre>
                  </div>
                ) : (
                  <pre className='whitespace-pre-wrap break-words overflow-hidden'>{msg.content}</pre>
                )}
              </div>
            ))}
            {isTyping && <div className='animate-pulse'>...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className='mt-2'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2'>
              {/* Customize the terminal title with your domain */}
              <span className='whitespace-nowrap'>sidkduggal@gmail.com root %</span>
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
    </ErrorBoundary>
  );
}
