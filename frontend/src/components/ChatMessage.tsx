import React from "react";
import { MessageSquare, Check, Clock } from "lucide-react";
import { Message } from "../types";
import { formatDate } from "../utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-start max-w-[80%] ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-secondary ml-2" : "bg-gray-300 dark:bg-gray-700 mr-2"
          }`}
        >
          {isUser ? (
            <span className="text-white text-sm font-medium">You</span>
          ) : (
            <MessageSquare className="h-4 w-4 text-gray-800 dark:text-gray-300" />
          )}
        </div>

        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          <div
            className={`rounded-2xl ${
              isUser ? "rounded-br-sm" : "rounded-bl-sm"
            } p-4 shadow-sm ${
              isUser
                ? "bg-primary text-white"
                : "bg-surface-alt-light dark:bg-surface-alt-dark text-text-primary-light dark:text-text-primary-dark"
            }`}
          >
            <div className="bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark p-4 rounded-lg shadow-card-light dark:shadow-card-dark border border-gray-200 dark:border-gray-700">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>

          <div className="flex items-center mt-2 text-xs text-text-muted-light dark:text-text-muted-dark">
            <span>{formatDate(message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
