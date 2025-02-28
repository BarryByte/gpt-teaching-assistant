export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string; // ISO string format
  read: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string; // ISO string format
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