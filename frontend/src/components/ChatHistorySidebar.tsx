// ChatHistorySidebar.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Conversation } from '../types';

interface ChatHistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
}) => {
  // Local state for filtering conversations
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full p-4">
      {/* Header with title and "New Conversation" button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Conversations</h2>
        <button
          onClick={onCreateConversation}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="New Conversation"
        >
          <Plus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* List of Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <p className="text-center text-gray-500">No conversations yet.</p>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                activeConversationId === conv.id ? 'bg-gray-200 dark:bg-gray-600' : ''
              }`}
            >
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{conv.title}</h3>
              <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;



// // ChatHistorySidebar.tsx
// import React, { useState, useEffect } from "react";
// import { MessageSquare, Search, Moon, Sun, Plus } from "lucide-react";
// import ConversationItem from "./ConversationItem"; // Component for rendering a single conversation
// import { Conversation } from "../types";
// import { getInitialTheme, getOrCreateUserId, saveThemePreference } from "../utils";
// import { fetchChatHistory } from "../services/api";

// // Define the props expected by ChatHistorySidebar
// interface ChatHistorySidebarProps {
//   conversations: Conversation[];
//   setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
//   activeConversationId: string | null;
//   setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
//   setMessages: React.Dispatch<React.SetStateAction<any[]>>;
//   showSidebar: boolean;
//   setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
// }

// function ChatHistorySidebar({
//   conversations,
//   setConversations,
//   activeConversationId,
//   setActiveConversationId,
//   setMessages,
//   showSidebar,
//   setShowSidebar,
// }: ChatHistorySidebarProps) {
//   // Local state for search input and dark mode
//   const [searchQuery, setSearchQuery] = useState("");
//   const [darkMode, setDarkMode] = useState(getInitialTheme());

//   // Toggle dark mode by adding/removing class on document element
//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//     saveThemePreference(darkMode);
//   }, [darkMode]);

//   // Handle conversation selection: set active conversation and fetch its history
//   const handleConversationSelect = async (conversationId: string) => {
//     setActiveConversationId(conversationId);
//     try {
//       const currentUserId = getOrCreateUserId();
//       const history = await fetchChatHistory(currentUserId);
//       setMessages(history.history);
//     } catch (error) {
//       console.error("Failed to fetch chat history:", error);
//       setMessages([]);
//     }
//     // Hide the sidebar on mobile devices after selection
//     if (window.innerWidth < 768) {
//       setShowSidebar(false);
//     }
//   };

//   // Start a new conversation by clearing active conversation and messages
//   const handleNewConversation = () => {
//     setActiveConversationId(null);
//     setMessages([]);
//     if (window.innerWidth < 768) {
//       setShowSidebar(false);
//     }
//   };

//   // Toggle dark mode state
//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//   };

//   // Filter conversations based on search query
//   const filteredConversations = conversations.filter(
//     (conv) =>
//       conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div
//       className={`${
//         showSidebar ? "w-80" : "w-0"
//       } md:w-80 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden fixed md:relative z-30 h-full shadow-sidebar-light dark:shadow-sidebar-dark`}
//     >
//       {/* Sidebar Header */}
//       <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <MessageSquare className="h-6 w-6 text-primary dark:text-primary-light" />
//           <h1 className="text-xl font-bold">AI Chat</h1>
//         </div>
//         <button
//           onClick={toggleDarkMode}
//           className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//           aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//         >
//           {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//         </button>
//       </div>

//       {/* Search and New Conversation Controls */}
//       <div className="p-4">
//         <div className="relative mb-4">
//           <input
//             type="text"
//             placeholder="Search conversations..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full h-12 px-4 pl-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-surface-alt-dark focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary transition-all"
//             aria-label="Search conversations"
//           />
//           <Search className="absolute left-3 top-3.5 h-5 w-5 text-text-muted-light dark:text-text-muted-dark" />
//         </div>

//         <button
//           onClick={handleNewConversation}
//           className="w-full py-3 px-4 bg-primary hover:bg-primary-light active:bg-primary-dark text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-button font-semibold"
//         >
//           <Plus className="h-5 w-5 mr-2" />
//           New Conversation
//         </button>
//       </div>

//       {/* List of Conversations */}
//       <div className="flex-1 overflow-y-auto">
//         <div className="px-2">
//           {filteredConversations.length === 0 ? (
//             <div className="p-4 text-center text-text-muted-light dark:text-text-muted-dark">
//               No conversations yet
//             </div>
//           ) : (
//             filteredConversations.map((conversation) => (
//               <ConversationItem
//                 key={conversation.id}
//                 conversation={conversation}
//                 isActive={conversation.id === activeConversationId}
//                 onClick={() => handleConversationSelect(conversation.id)}
//               />
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatHistorySidebar;
