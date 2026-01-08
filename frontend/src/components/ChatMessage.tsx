import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

import { Message } from "../types";
import { formatDate } from "../utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import robot from "../assets/robot.png";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] md:max-w-[75%]", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <div className={cn(
          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden",
          isUser ? "bg-primary ml-3" : "bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 mr-3"
        )}>
          {isUser ? (
            <span className="text-white text-sm font-bold">U</span>
          ) : (
            <img src={robot} alt="AI" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Content */}
        <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
          <div className={cn(
            "rounded-2xl p-4 shadow-sm relative group transition-all duration-200",
            isUser
              ? "bg-primary text-white rounded-tr-none"
              : "bg-white dark:bg-surface-dark/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 text-text-primary-light dark:text-text-primary-dark rounded-tl-none"
          )}>
            <ReactMarkdown
              className="prose dark:prose-invert prose-sm max-w-none"
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const codeContent = String(children).replace(/\n$/, "");

                  if (!inline && language) {
                    return (
                      <div className="relative my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2 text-xs font-mono text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>{language}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(codeContent)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-text-muted-light dark:text-text-muted-dark"
                            title="Copy code"
                          >
                            {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={language}
                          PreTag="div"
                          customStyle={{ margin: 0, border: 0, borderRadius: 0, fontSize: "0.85rem" }}
                          {...props}
                        >
                          {codeContent}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  return (
                    <code className={cn("px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-xs", className)} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          <span className="mt-2 text-[10px] font-medium text-text-muted-light dark:text-text-muted-dark uppercase tracking-widest opacity-60">
            {formatDate(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

