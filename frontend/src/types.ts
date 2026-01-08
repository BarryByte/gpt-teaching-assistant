export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string; // ISO string format
  read: boolean;
}

export interface Conversation {
  problemSlug: string | null;

  id: string;
  title: string;
  lastMessage: string;
  timestamp: string; // ISO string format
  conversationId: string;
  messages: Message[];
}

export interface ChatHistoryResponse {
  history: Message[];
}

export interface ChatApiResponse {
  response: string;
}

export interface ProblemSummaryResponse {
  description: string;
  examples: string[];
}