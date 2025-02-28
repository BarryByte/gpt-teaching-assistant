import React from 'react';
import { formatDate } from '../utils';
import { Conversation } from '../types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 rounded-lg mb-1 ${
        isActive
          ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-primary dark:border-primary-light'
          : 'hover:bg-surface-alt-light dark:hover:bg-surface-alt-dark border-l-4 border-transparent'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-medium truncate ${isActive ? 'text-primary dark:text-primary-light' : ''}`}>
          {conversation.title}
        </h3>
        <span className="text-xs text-text-muted-light dark:text-text-muted-dark whitespace-nowrap ml-2">
          {formatDate(conversation.timestamp)}
        </span>
      </div>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate mt-1">
        {conversation.lastMessage}
      </p>
    </div>
  );
};

export default ConversationItem;