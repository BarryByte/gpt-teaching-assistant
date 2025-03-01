from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import os
import google.generativeai as genai
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import logging
import asyncio
from typing import List, Dict
from functools import lru_cache
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME")

# Validate environment variables
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in .env")
if not MONGO_URI:
    raise ValueError("MONGO_URI not set in .env")
if not MONGODB_DB_NAME:
    raise ValueError("MONGODB_DB_NAME not set in .env")

# Initialize Gemini AI
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    raise ValueError("Gemini API Key not found. Set GEMINI_API_KEY in .env file")

# Initialize MongoDB Client
try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    client.admin.command('ping')
    logging.info("Successfully connected to MongoDB!")
    db = client[MONGODB_DB_NAME]
    chat_collection = db["chats"]
except Exception as e:
    logging.error(f"Failed to connect to MongoDB: {e}")
    raise ValueError("Failed to connect to MongoDB")

# FastAPI app
app = FastAPI()

# CORS (Allow frontend requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Helper function to clean text
def clean_text(text):
    return ' '.join(text.split()).strip()

# Fetch LeetCode problem details
@lru_cache(maxsize=100)
def get_leetcode_problem_data(slug: str) -> Dict:
    url = "https://leetcode.com/graphql"
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json",
        "Referer": f"https://leetcode.com/problems/{slug}/"
    }
    query = {
        "query": """
        query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                title
                difficulty
                topicTags { name }
                content
                hints
                stats
            }
        }""",
        "variables": {"titleSlug": slug}
    }

    try:
        response = requests.post(url, headers=headers, json=query)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        data = response.json().get("data", {}).get("question", {})
        if not data:
            raise HTTPException(status_code=404, detail=f"No data found for {slug}")

        # Parse description
        soup = BeautifulSoup(data.get("content", ""), "html.parser")
        description = clean_text(soup.get_text())

        # Structure output
        return {
            "title": data.get("title"),
            "difficulty": data.get("difficulty"),
            "tags": [tag["name"] for tag in data.get("topicTags", [])],
            "description": description,
            "hints": data.get("hints", None),

        }

    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching {slug}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching {slug}: {str(e)}")
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON response from LeetCode API for {slug}")
        raise HTTPException(status_code=500, detail="Invalid JSON response from LeetCode API")

# Request model for chat
class ChatRequest(BaseModel):
    question: str
    problem_slug: str
    user_id: str
    conversation_id: str # for every new conversation, this should be unique

# Fetch problem details
@app.get("/fetch-problem/{slug}")
def fetch_problem(slug: str) -> Dict:
    return get_leetcode_problem_data(slug)

@app.get("/fetch-problem-summary/{slug}")
def fetch_problem_summary(slug: str):
    try:
        problem_data = get_leetcode_problem_data(slug)
        # Extract description and examples (if present)
        description = problem_data.get("description", "")
        examples = []
        if "Example" in description:
            # Simple example extraction (can be improved)
            example_start = description.find("Example")
            examples_str = description[example_start:]
            examples = examples_str.split("Example")
            examples = [ex.strip() for ex in examples if ex.strip()]

        return {"description": description, "examples": examples}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat with Gemini AI
@app.post("/chat")
def chat(request: ChatRequest):
    print(f"Received chat request: {request.dict()}")
    problem_data = get_leetcode_problem_data(request.problem_slug)
    prompt = f"""
You are an expert AI-powered Data Structures and Algorithms (DSA) tutor using GPT. Your mission is to **guide the user** step-by-step in solving the LeetCode problem '{problem_data['title']}'. You are designed to be patient, encouraging, and focused on long-term learning.

---
### **Problem Details**
* **Difficulty:** {problem_data['difficulty']}
* **Tags:** {', '.join(problem_data['tags'])}
* **Description:** {problem_data['description']}

---
### **User's Current Question & Context**
**User asked:** {request.question}

**Conversation So Far:**
{json.dumps(get_user_chat_history(request.user_id, request.conversation_id)[-5:], indent=2)} # Pass conversation_id here


---
### **Teaching Principles - How You Should Guide the User**

1.  **Progressive Problem Decomposition:**  Break down the problem into smaller, logical steps. Start with high-level strategy and progressively delve into implementation details.  **Crucially, move forward to the next step after the user demonstrates understanding, avoid repeating questions on the same point.**

2.  **Adaptive Hinting Strategy:**  If the user is stuck or explicitly asks for help, provide hints in increasing levels of detail:
    *   **Level 1: Vague Hint (Directional):** Offer a general direction or related concept.  *(Example: "Think about the properties of sorted arrays." )*
    *   **Level 2: Medium Hint (Approach Suggestion):** Suggest a specific algorithm or data structure. *(Example: "Could a two-pointer approach be useful here?")*
    *   **Level 3: Specific Hint (Implementation Nudge):**  Provide a more concrete step or a crucial detail. *(Example: "Consider using two pointers, one at the start and one at the end, and move them inwards.")*
    *   **Only proceed to the next hint level if the user remains stuck after the previous hint.** Encourage the user to try solving with each hint before giving more.

3.  **Evaluate User Approaches & Code Constructively:** If the user provides their own approach or code:
    *   **First, acknowledge their effort and what's good about their attempt.**
    *   **Then, provide specific, actionable feedback:**  Point out areas for improvement, potential bugs, efficiency concerns, or better alternatives.
    *   **Suggest optimizations and alternative strategies.** Focus on learning and code quality, not just getting to a correct solution quickly.

4.  **Iterative Code Snippets - Not Full Solutions:** Provide code snippets to illustrate specific concepts or steps, **but avoid giving complete solutions upfront unless absolutely necessary (e.g., user explicitly gives up after multiple attempts).** When providing snippets, always explain the code's purpose and logic clearly.

5.  **Guiding Questions for Active Learning:**  End each response with a thoughtful question that prompts the user to think critically and actively engage with the problem-solving process.  These questions should encourage them to:
    *   Explain their reasoning.
    *   Consider next steps.
    *   Think about alternative approaches.
    *   Reflect on the concepts they are learning.

---
### **Handling "Edge Queries" and User States**

6.  **Address "I Don't Know" or User Frustration:** If the user expresses confusion or says "I don't know":
    *   **Acknowledge their difficulty and offer encouragement.** *(Example: "This problem is tricky, it's okay to feel stuck. We'll work through it.")*
    *   **Rephrase your previous question in a simpler way.**
    *   **Break down the problem into even smaller sub-problems.**
    *   **Offer to revisit foundational concepts** if needed.

7.  **Clarify Ambiguous Questions:** If the user's question is unclear, ask clarifying questions to understand their intent before responding. *(Example: "Could you please elaborate on what you mean by 'more efficient' in this context?")*

8.  **Handle Unrelated Questions (DSA Concepts):** If the user asks about a DSA concept not directly related to the current problem (e.g., "What is Big O?"):
    *   **Briefly address their question clearly and concisely.**
    *   **Then, gently guide them back to the LeetCode problem** to maintain focus on problem-solving.  *(Example: "Big O notation helps us analyze algorithm efficiency... Now, back to our problem, how do you think Big O applies to the approach we're discussing?")*

9.  **Code Generation Policy (Be Conservative):**  **Do not provide full solution code directly unless the user explicitly requests it after multiple attempts and expresses giving up.** Prioritize guiding them to write the code themselves. If full code is given as a last resort, explain it thoroughly.

---
Now, respond accordingly and continue guiding the user from where the conversation left off, keeping these teaching principles and edge case handling strategies in mind.
"""

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        ai_response = response.text.strip()

        # Store chat history in MongoDB
        chat_collection.insert_one({
            "user_id": request.user_id,
            "question": request.question,
            "conversation_id": request.conversation_id,
            "response": ai_response,
        })

        return {"response": ai_response}
    except Exception as e:
        logging.error(f"Gemini API error: {e}")
        raise HTTPException(status_code=500, detail="Error processing with Gemini API")

# Retrieve chat history from MongoDB
def get_user_chat_history(user_id: str, conversation_id: str) -> List[Dict[str, str]]:
    history = list(chat_collection.find(
        {"user_id": user_id, "conversation_id": conversation_id},
        {"_id": 0, "question": 1, "response": 1}
    ))
    return history


# Retrieve chat history endpoint - Corrected route to include conversation_id
@app.get("/history/{user_id}/{conversation_id}")
def fetch_history(user_id: str, conversation_id: str) -> List[Dict[str, str]]: # Renamed function to avoid conflict, using fetch_history for endpoint
    return get_user_chat_history(user_id, conversation_id) # Pass conversation_id

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)