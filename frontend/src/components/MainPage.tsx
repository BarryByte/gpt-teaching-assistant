import React, { useEffect, useRef, useState } from "react";
import { Send, MessageSquare, Zap } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { Message } from "../types";
import { generateUniqueId, getOrCreateUserId } from "../utils";
import { chatWithAI, ChatRequest } from "../services/api";
import robot from "../assets/robot.png";

interface MainPageProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  problemSlug: string | null;
  setProblemSlug: React.Dispatch<React.SetStateAction<string | null>>;
  hints: string[];
  setHints: React.Dispatch<React.SetStateAction<string[]>>;
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  handleProblemSelect: (slug: string) => Promise<void>;
  conversationId: string | undefined;
}

function MainPage({
  messages,
  setMessages,
  isTyping,
  setIsTyping,
  problemSlug,
  setProblemSlug: _setProblemSlug,
  hints: _hints,
  setHints,
  code: _code,
  setCode,
  handleProblemSelect,
  conversationId,
}: MainPageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [inputMessage, setInputMessage] = useState<string>("");
  const [localProblemSlug, setLocalProblemSlug] = useState<string | null>(problemSlug);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);

  useEffect(() => {
    setLocalProblemSlug(problemSlug);
  }, [problemSlug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputMessage]);

  const onFetchProblem = async () => {
    if (!localProblemSlug) return;
    setIsLoadingProblem(true);
    try {
      await handleProblemSelect(localProblemSlug);
    } catch (error) {
      console.error("Failed to fetch problem:", error);
    } finally {
      setIsLoadingProblem(false);
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || isTyping) return;

    if (!problemSlug) {
      alert("Please select a problem first.");
      return;
    }

    if (!conversationId) {
      console.error("Missing conversationId. Active convo:", conversationId);
      alert("Error: No active conversation session. Please refresh or create a new chat.");
      return;
    }

    const currentUser = getOrCreateUserId();
    const newUserMessage: Message = {
      id: generateUniqueId(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");

    setIsTyping(true);
    try {
      const chatRequest: ChatRequest = {
        question: inputMessage,
        problem_slug: problemSlug,
        user_id: currentUser,
        conversation_id: conversationId,
      };
      const response = await chatWithAI(chatRequest);

      const aiResponse: Message = {
        id: generateUniqueId(),
        content: response.response,
        sender: "ai",
        timestamp: new Date().toISOString(),
        read: false,
      };

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
      } else if (response.response.toLowerCase().includes("hint")) {
        // If response includes a hint, add it to the hints list
        setHints((prevHints) => [...prevHints, response.response]);
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);

      // Restore the input message so the user doesn't lose it
      setInputMessage(inputMessage);

      if (error.message && error.message.includes("429")) {
        alert("Rate Limit Reached: You are sending messages too fast. Please wait a moment before trying again.");
      } else {
        alert("Failed to send message. Please check your connection and try again.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Search Header */}
      {!problemSlug && (
        <div className="p-6 md:p-10 max-w-2xl mx-auto w-full">
          <div className="bg-white dark:bg-surface-dark p-2 rounded-2xl shadow-xl shadow-primary/5 border border-gray-100 dark:border-gray-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Paste LeetCode or Codeforces URL..."
              value={localProblemSlug || ""}
              onChange={(e) => setLocalProblemSlug(e.target.value)}
              className="flex-1 bg-transparent px-4 py-2 focus:outline-hidden text-sm md:text-base"
            />
            <button
              onClick={onFetchProblem}
              disabled={isLoadingProblem || !localProblemSlug}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center space-x-2"
            >
              {isLoadingProblem ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Fetch</span>
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-text-muted-light dark:text-text-muted-dark">
            Example: https://leetcode.com/problems/two-sum/
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 rotate-3">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Start your session</h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-sm leading-relaxed">
              Paste a problem link above to start a guided learning session with TeachAI.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex items-start mb-6">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center mr-3 shadow-sm">
                  <img src={robot} alt="..." className="w-full h-full object-cover opacity-50 grayscale" />
                </div>
                <div className="bg-surface-alt-light dark:bg-surface-alt-dark/40 backdrop-blur-sm rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {problemSlug && (
        <div className="p-4 md:p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/80 dark:via-background-dark/80 to-transparent">
          <div className="max-w-4xl mx-auto w-full relative">
            <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl focus-within:border-primary/50 transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or explain your approach..."
                className="w-full p-6 focus:outline-hidden bg-transparent resize-none min-h-[80px] max-h-[200px] text-sm md:text-base leading-relaxed"
                rows={1}
              />
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center text-xs text-text-muted-light dark:text-text-muted-dark font-medium">
                  <Zap className="w-3.5 h-3.5 mr-2 text-primary" />
                  AI Tutor is active
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-primary hover:bg-primary-dark disabled:opacity-30 disabled:hover:bg-primary text-white p-2.5 rounded-2xl transition-all shadow-lg shadow-primary/20 shadow-primary/25 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;