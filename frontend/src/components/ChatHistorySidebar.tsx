// ChatHistorySidebar.tsx
import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Trash2 } from 'lucide-react';
import { Conversation } from '../types';
import { formatDate } from '../utils';

interface ChatHistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 transition-all duration-300">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-text-primary-light dark:text-text-primary-dark">
                Brain<span className="text-primary">Box</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark leading-none mt-1">
                Deep Learning Tutor
              </p>
            </div>
          </div>
          <button
            onClick={onCreateConversation}
            className="p-2.5 bg-primary text-background-dark rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
            aria-label="New Session"
            title="New Session"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted-light dark:text-text-muted-dark group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search clusters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        <div className="mb-4 px-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted-light dark:text-text-muted-dark">
            Recent Sessions
          </h3>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 opacity-50">
              <Search className="h-6 w-6 text-text-muted-light dark:text-text-muted-dark" />
            </div>
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark font-medium">No sessions found.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`w-full group relative p-4 rounded-2xl transition-all duration-300 flex items-start space-x-3 text-left ${activeConversationId === conv.id
                ? 'bg-primary/10 border border-primary/20 shadow-xl shadow-primary/5'
                : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                }`}
            >
              <button
                onClick={() => onSelectConversation(conv.id)}
                className="flex-1 flex items-start space-x-3 text-left focus:outline-none"
              >
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${activeConversationId === conv.id
                  ? 'bg-primary text-background-dark border-primary shadow-lg shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 text-text-muted-light dark:text-text-muted-dark group-hover:border-primary/30 group-hover:text-primary'
                  }`}>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-bold truncate transition-colors ${activeConversationId === conv.id ? 'text-primary' : 'text-text-primary-light dark:text-text-primary-dark group-hover:text-primary'
                      }`}>
                      {conv.title}
                    </h3>
                    <span className="text-[10px] text-text-muted-light dark:text-text-muted-dark font-medium opacity-60">
                      {conv.timestamp ? formatDate(conv.timestamp) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate opacity-70 group-hover:opacity-100 transition-opacity">
                    {conv.lastMessage || 'Start exploring...'}
                  </p>
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this conversation?")) {
                    onDeleteConversation(conv.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-text-muted-light dark:text-text-muted-dark hover:text-red-500 rounded-lg transition-all"
                title="Delete Conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      
      
    </div>
  );
};

export default ChatHistorySidebar;