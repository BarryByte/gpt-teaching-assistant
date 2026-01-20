import React, { useState } from 'react';
import { Plus, Search, MessageSquare, Trash2, Edit2, X, Check } from 'lucide-react';
import { Conversation } from '../services/api';
import { formatDate } from '../utils';

interface ChatHistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const saveTitle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 transition-all duration-300">
      {/* Header */}
      <div className="p-6 shrink-0">
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
            placeholder="Search saved chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-text-muted-light/50 dark:placeholder:text-text-muted-dark/50"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
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
              className={`w-full group relative p-3 rounded-2xl transition-all duration-300 flex items-start space-x-3 text-left cursor-pointer ${activeConversationId === conv.id
                ? 'bg-primary/10 border border-primary/20 shadow-xl shadow-primary/5'
                : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              {/* Icon */}
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${activeConversationId === conv.id
                ? 'bg-primary text-background-dark border-primary shadow-lg shadow-primary/20'
                : 'bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 text-text-muted-light dark:text-text-muted-dark group-hover:border-primary/30 group-hover:text-primary'
                }`}>
                <MessageSquare className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {editingId === conv.id ? (
                  <div className="flex items-center space-x-1 h-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="flex-1 min-w-0 bg-transparent border-b border-primary text-sm focus:outline-none"
                    />
                    <button onClick={saveTitle} className="text-green-500 hover:text-green-600 p-1"><Check className="h-3 w-3" /></button>
                    <button onClick={cancelEditing} className="text-red-500 hover:text-red-600 p-1"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`text-sm font-bold truncate pr-2 transition-colors ${activeConversationId === conv.id ? 'text-primary' : 'text-text-primary-light dark:text-text-primary-dark group-hover:text-primary'
                        }`}>
                        {conv.title}
                      </h3>
                      <span className="text-[10px] text-text-muted-light dark:text-text-muted-dark font-medium opacity-60 shrink-0">
                        {conv.timestamp ? formatDate(conv.timestamp) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate opacity-70 group-hover:opacity-100 transition-opacity">
                      {conv.lastMessage || 'Start exploring...'}
                    </p>
                  </>
                )}
              </div>

              {/* Hover Actions */}
              {!editingId && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                  <button
                    onClick={(e) => startEditing(e, conv)}
                    className="p-1.5 hover:bg-blue-500/10 text-text-muted-light dark:text-text-muted-dark hover:text-blue-500 rounded-md transition-all"
                    title="Rename"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this conversation?")) {
                        onDeleteConversation(conv.id);
                      }
                    }}
                    className="p-1.5 hover:bg-red-500/10 text-text-muted-light dark:text-text-muted-dark hover:text-red-500 rounded-md transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;