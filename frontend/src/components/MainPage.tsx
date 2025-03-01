// MainPage.tsx
import React, { useEffect, useRef } from "react";
import { Send, Paperclip, MessageSquare } from "lucide-react";
import ChatMessage from "./ChatMessage"; // Component to render individual messages
import { Message } from "../types";
import { generateUniqueId, getOrCreateUserId } from "../utils";
import { fetchChatHistory, chatWithAI, fetchProblem, fetchProblemSummary } from "../services/api";
import axios from "axios";

// Define the props required by MainPage
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
  // Refs for auto-scrolling, file input, and textarea resizing
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea based on its content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputMessage]);

  // Send chat message to backend and return the response
  const sendChatMessage = async (
    question: string,
    problemSlug: string,
    userId: string
  ) => {
    try {
      const response = await chatWithAI(question, problemSlug, userId);
      return response;
    } catch (error) {
      console.error("Failed to send chat message:", error);
      throw error;
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    // Retrieve (or generate) the current user ID
    const currentUser = getOrCreateUserId();

    // Create a new message from the user
    const newUserMessage: Message = {
      id: generateUniqueId(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
      read: true,
    };

    // Update the state with the new user message and clear input
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");

    setIsTyping(true);
    try {
      if (problemSlug) {
        // Send message to backend and get AI response
        const response = await sendChatMessage(inputMessage, problemSlug, currentUser);

        // Create an AI message from the response
        const aiResponse: Message = {
          id: generateUniqueId(),
          content: response.response,
          sender: "ai",
          timestamp: new Date().toISOString(),
          read: false,
        };

        setIsTyping(false);
        setMessages((prev) => [...prev, aiResponse]);

        // If response contains a code example, extract it
        if (response.response.includes("Code Example")) {
          const codeStart = response.response.indexOf("```python");
          if (codeStart !== -1) {
            const codeEnd = response.response.indexOf("```", codeStart + 3);
            if (codeEnd !== -1) {
              setCode(response.response.substring(codeStart + 9, codeEnd));
            }
          }
        } else if (response.response.includes("Hint")) {
          // If response includes a hint, add it to the hints list
          setHints((prevHints) => [...prevHints, response.response]);
        }

        // Update chat history in the backend using current user ID
        try {
          await axios.post("/chat", {
            question: inputMessage,
            problem_slug: problemSlug,
            user_id: currentUser,
          });
        } catch (historyUpdateError) {
          console.error("Failed to update chat history:", historyUpdateError);
        }
      } else {
        setIsTyping(false);
        alert("Please select a problem first");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsTyping(false);
    }
  };

  // Handle sending message when Enter key is pressed (without Shift)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Trigger file input for attachments
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Append file name to message input on file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      setInputMessage((prev) => prev + ` [Attached: ${fileName}]`);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Problem Fetch Section */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Enter LeetCode slug"
          onChange={(e) => setProblemSlug(e.target.value)}
          className="border rounded-sm p-2 w-full mb-2"
        />
        <button
          onClick={() => handleProblemSelect(problemSlug || "")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-sm"
        >
          Fetch Problem
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          // Display a friendly prompt if there are no messages
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
          // Map over messages and render each one
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
                    <div
                      className="w-2 h-2 bg-primary dark:bg-primary-light rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary dark:bg-primary-light rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary dark:bg-primary-light rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Section */}
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
              style={{ height: "56px" }}
              aria-label="Message input"
            />
            <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleAttachmentClick}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Attach file"
              >
                {/* Uncomment and add the Paperclip icon if needed */}
                {/* <Paperclip className="h-5 w-5 text-text-secondary-light dark:text-text-secondary-dark" /> */}
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
