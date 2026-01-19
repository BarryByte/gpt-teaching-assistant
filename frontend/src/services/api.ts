import axios from 'axios';

const API_BASE_URL = "http://localhost:8000";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interfaces ---

export interface User {
  username: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ProblemData {
  title: string;
  difficulty: string;
  tags: string[];
  description: string;
  hints: string[] | null;
}

export interface ProblemSummary {
  description: string;
  examples: string[];
}

export interface ChatRequest {
  question: string;
  problem_slug: string;
  conversation_id: string;
  // user_id removed, handled by backend token
}

export interface ChatResponse {
  response: string;
}

export interface ChatHistoryItem {
  question: string;
  response: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  conversationId: string; // The UUID used for backend communication
  title: string;
  messages: Message[];
  lastMessage: string;
  timestamp: string;
  problemSlug: string | null;
}

// --- API Functions ---

export const authApi = {
  signup: async (username: string, password: string): Promise<any> => {
    const response = await api.post("/signup", { username, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    const response = await api.post("/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get("/users/me");
    return response.data;
  }
};

export async function fetchProblem(slug: string): Promise<ProblemData> {
  const response = await api.get(`/fetch-problem/${slug}`);
  return response.data;
}

export async function fetchProblemSummary(slug: string): Promise<ProblemSummary> {
  const response = await api.get(`/fetch-problem-summary/${slug}`);
  return response.data;
}

export async function chatWithAI(requestData: ChatRequest): Promise<ChatResponse> {
  const response = await api.post("/chat", requestData);
  return response.data;
}

export async function fetchChatHistory(conversationId: string): Promise<ChatHistoryItem[]> {
  // New endpoint structure: /history/{conversationId} (User inferred from token)
  const response = await api.get(`/history/${conversationId}`);
  return response.data;
}

export default api;

