const API_BASE_URL = "http://localhost:8000"; // Replace with your backend URL if different

// --- Interfaces for Type Safety ---
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
  user_id: string;
  conversation_id: string;
}

export interface ChatResponse {
  response: string;
}

export interface ChatHistoryItem {
  question: string;
  response: string;
}

export interface ChatHistoryResponse {
  history: ChatHistoryItem[]; // Assuming the backend returns history as a list of items
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
  conversationId: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  timestamp: string;
  problemSlug: string | null; // Add problemSlug to Conversation interface
}

// --- API Functions ---

export async function fetchProblem(slug: string): Promise<ProblemData> {
  const response = await fetch(`${API_BASE_URL}/fetch-problem/${slug}`);
  if (!response.ok) {
    // Improved error handling with status text
    throw new Error(`Failed to fetch problem: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<ProblemData>; // Type assertion
}

export async function fetchProblemSummary(slug: string): Promise<ProblemSummary> {
  const response = await fetch(`${API_BASE_URL}/fetch-problem-summary/${slug}`);
  if (!response.ok) {
    // Improved error handling with status text
    throw new Error(`Failed to fetch problem summary: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<ProblemSummary>; // Type assertion
}

export async function chatWithAI(
  requestData: ChatRequest // Using ChatRequest interface for type safety and to include conversation_id
): Promise<ChatResponse> {
  console.log("Sending to /chat:", requestData); // Log all data including conversation_id

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
  if (!response.ok) {
    console.error("Failed to chat with AI:", response); // Log full response for detailed error info
    // Improved error handling with status text
    throw new Error(`Failed to chat with AI: ${response.status} ${response.statusText}`);
  }
  const data = await response.json() as ChatResponse; // Type assertion
  console.log("Received from /chat:", data);
  return data;
}

export async function fetchChatHistory(user_id: string, conversationId: string): Promise<ChatHistoryItem[]> { // Added conversationId parameter and return type
  const response = await fetch(`${API_BASE_URL}/history/${user_id}/${conversationId}`); // Correct URL with conversationId
  if (!response.ok) {
    // Improved error handling with status text
    throw new Error(`Failed to fetch chat history: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<ChatHistoryItem[]>; // Type assertion, directly returning array of history items
}

