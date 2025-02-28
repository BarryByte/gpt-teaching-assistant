import React, {  useEffect, useRef } from 'react';
import { Send, Paperclip, MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { Message } from '../types';
import { generateUniqueId } from '../utils';
import { fetchChatHistory, fetchProblem , fetchProblemSummary, chatWithAI} from '../services/api.ts';

interface MainPageProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  problemSlug: string | null;
  setProblemSlug: React.Dispatch<React.SetStateAction<string | null>>;
  hints: string[];
  setHints: React.Dispatch<React.SetStateAction<string[]>>;
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  handleProblemSelect: (slug: string) => Promise<void>;
}

function MainPage({
  messages,
  setMessages,
  inputMessage,
  setInputMessage,
  isTyping,
  setIsTyping,
  problemSlug,
  setProblemSlug,
  hints,
  setHints,
  code,
  setCode,
  handleProblemSelect,

}: MainPageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputMessage]);
  // new apis
  const sendChatMessage = async (
    question: string,
    problemSlug: string,
    userId: string
  ) => {
    try {
      const response = await chatWithAI(question, problemSlug, userId);
      return response;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newUserMessage: Message = {
      id: generateUniqueId(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage('');

    setIsTyping(true);
    try {
      if (problemSlug) {
        const response = await sendChatMessage(
          inputMessage,
          problemSlug,
          localStorage.getItem('userId') || ''
        );
        const aiResponse: Message = {
          id: generateUniqueId(),
          content: response.response,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          read: false,
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, aiResponse]);

        if (response.response.includes('Code Example')) {
          const codeStart = response.response.indexOf('```python');
          if (codeStart !== -1) {
            const codeEnd = response.response.indexOf('```', codeStart + 3);
            if (codeEnd !== -1) {
              setCode(response.response.substring(codeStart + 9, codeEnd));
            }
          }
        } else if (response.response.includes('Hint')) {
          setHints((prevHints) => [...prevHints, response.response]);
        }
      } else {
        setIsTyping(false);
        alert('Please select a problem first');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      setInputMessage((prev) => prev + ` [Attached: ${fileName}]`);
    }
  };

  // const handleProblemSelect = async (slug: string) => {
  //   try {
  //     const summary = await fetchProblem(slug);
  //     setProblemSlug(slug);
  //   } catch (error) {
  //     console.error('Failed to fetch problem summary:', error);
  //   }
  // };

  async function handleFetchProblem(slug: string) {
    try {
      const problem = await fetchProblem(slug);
      console.log('Problem:', problem);
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  }

  async function handleChat(question: string, problem_slug: string, user_id: string) {
      try {
          const response = await chatWithAI(question, problem_slug, user_id);
          console.log("AI Response:", response);
      } catch (error) {
          console.error("Error chatting with AI:", error);
      }
  }

  async function handleFetchHistory(user_id:string){
      try{
          const history = await fetchChatHistory(user_id);
          console.log("Chat History:", history);
      } catch (error){
          console.error("Error fetching chat history:", error);
      }
  }

  async function handleFetchProblemSummary(slug:string){
      try{
          const summary = await fetchProblemSummary(slug);
          console.log("Problem Summary:", summary)
      } catch(error){
          console.error("Error fetching problem summary:", error)
      }

  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4">
        <input
          type="text"
          placeholder="Enter LeetCode slug"
          onChange={(e) => setProblemSlug(e.target.value)}
          className="border rounded-sm p-2 w-full mb-2"
        />
        <button
          onClick={() => handleProblemSelect(problemSlug || '')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm"
        >
          Fetch Problem
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-primary dark:text-primary-light" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Start a new conversation</h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-md">
              Type a message below to begin chatting with the AI assistant.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex items-start">
                <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-300 dark:bg-gray-700 mr-2">
                  <MessageSquare className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="bg-surface-alt-light dark:bg-surface-alt-dark rounded-2xl rounded-bl-sm p-4 max-w-[80%] shadow-xs">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary dark:bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary dark:bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary dark:bg-primary-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-alt-dark overflow-hidden shadow-card-light dark:shadow-card-dark transition-all">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full p-4 focus:outline-hidden bg-transparent resize-none min-h-[56px] max-h-[160px] text-text-primary-light dark:text-text-primary-dark"
              style={{ height: '56px' }}
              aria-label="Message input"
            />
            <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleAttachmentClick}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-full bg-primary hover:bg-primary-light active:bg-primary-dark text-white transition-colors"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MainPage;