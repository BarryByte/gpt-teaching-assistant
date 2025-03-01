// api.ts

const API_BASE_URL = "http://localhost:8000"; // Replace with your backend URL if different

export async function fetchProblem(slug: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/fetch-problem/${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch problem: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchProblemSummary(slug: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/fetch-problem-summary/${slug}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch problem summary: ${response.statusText}`);
  }
  return response.json();
}

export async function chatWithAI(
  question: string,
  problem_slug: string,
  user_id: string
): Promise<any> {
  console.log("Sending to /chat:", { question, problem_slug, user_id }); // Log the data being sent

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, problem_slug, user_id }),
  });
  if (!response.ok) {
    console.error("Failed to chat with AI:", response); // Log the response for error details
    throw new Error(`Failed to chat with AI: ${response.statusText}`);
  }
  const data = await response.json();
  console.log("Received from /chat:", data); // Log the received data
  return data;
}

export async function fetchChatHistory(user_id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/history/${user_id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch chat history: ${response.statusText}`);
  }
  return response.json();
}

// import axios from 'axios';
// import { ProblemSummaryResponse } from '../types';

// const API_BASE_URL = 'http://localhost:8000';

// export const fetchProblem = async (slug: string) => {
//   try {
//     const response = await fetch(`/fetch-problem/${slug}`);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data: ProblemSummaryResponse = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching problem:', error);
//     throw error; // Re-throw the error for the component to handle
//   }
//   // const response = await axios.get(`${API_BASE_URL}/fetch-problem-summary/${slug}`);
//   // console.log('fetchProblem response data:', response.data);
//   // return response.data;
// };

// export const sendChatMessage = async (question: string, problemSlug: string, userId: string) => {
//   const response = await axios.post(`${API_BASE_URL}/chat`, {
//     question,
//     problem_slug: problemSlug,
//     user_id: userId,
//   });
//   console.log('sendChatMessage response data:', response.data);
//   return response.data;
// };

// export const fetchChatHistory = async (userId: string) => {
//   const response = await axios.get(`${API_BASE_URL}/history/${userId}`);
//   console.log('fetchChatHistory response data:', response.data);
//   return response.data;
// };
