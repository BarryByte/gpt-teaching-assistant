from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
import os
import google.generativeai as genai
from scrapers import get_scraper, extract_identifier
import logging
from functools import lru_cache
from typing import List, Dict
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from dotenv import load_dotenv



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


# Generic problem data fetcher with caching
@lru_cache(maxsize=100)
def get_problem_data(identifier: str) -> Dict:
    scraper, platform = get_scraper(identifier)
    if not scraper:
        raise HTTPException(status_code=400, detail="Unsupported platform or invalid URL")
    
    clean_id = extract_identifier(identifier, platform)
    data = scraper.fetch_problem(clean_id)
    
    if not data:
        raise HTTPException(status_code=404, detail=f"No data found for {identifier} on {platform}")
        
    return data



# Request model for chat
class ChatRequest(BaseModel):
    question: str
    problem_slug: str # Keeping the name for backward compatibility, but it's now a URL or identifier
    user_id: str
    conversation_id: str


# Fetch problem details
@app.get("/fetch-problem/{problem_identifier:path}")
def fetch_problem(problem_identifier: str) -> Dict:
    return get_problem_data(problem_identifier)

@app.get("/fetch-problem-summary/{problem_identifier:path}")
def fetch_problem_summary(problem_identifier: str):
    try:
        problem_data = get_problem_data(problem_identifier)
        # Extract description and examples (if present)
        description = problem_data.get("description", "")
        examples = []
        if "Example" in description:
            example_start = description.find("Example")
            examples_str = description[example_start:]
            examples = examples_str.split("Example")
            examples = [ex.strip() for ex in examples if ex.strip()]

        return {"description": description, "examples": examples}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from google.api_core import exceptions

# Chat with Gemini AI
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        logging.info(f"Received chat request for problem: {request.problem_slug}")
        
        # 1. Fetch problem data (handles its own HTTPExceptions)
        problem_data = get_problem_data(request.problem_slug)
        
        # 2. Build Chat History Context
        try:
            history = get_user_chat_history(request.user_id, request.conversation_id)
            history_context = json.dumps(history[-5:], indent=2)
        except Exception as e:
            logging.error(f"MongoDB history fetch error: {e}")
            history_context = "[]" # Fallback to empty history if DB fails

        # 3. Construct Prompt
        prompt = f"""
You are an expert AI-powered Data Structures and Algorithms (DSA) tutor. Your mission is to **guide the user** step-by-step in solving the problem '{problem_data['title']}' from {problem_data['platform']}. You are designed to be patient, encouraging, and focused on long-term learning.

---
### **Problem Details**
* **Platform:** {problem_data['platform']}
* **Difficulty:** {problem_data['difficulty']}
* **Tags:** {', '.join(problem_data['tags'])}
* **Description:** {problem_data['description']}


---
### **User's Current Question & Context**
**User asked:** {request.question}

**Conversation So Far:**
{history_context}


---
### **Teaching Principles - How You Should Guide the User**

1.  **Progressive Problem Decomposition:**  Break down the problem into smaller, logical steps. Start with high-level strategy and progressively delve into implementation details.  **Crucially, move forward to the next step after the user demonstrates understanding, avoid repeating questions on the same point.**

2.  **Adaptive Hinting Strategy:**  If the user is stuck or explicitly asks for help, provide hints in increasing levels of detail:
    *   **Level 1: Vague Hint (Directional):** Offer a general direction or related concept.
    *   **Level 2: Medium Hint (Approach Suggestion):** Suggest a specific algorithm or data structure. 
    *   **Level 3: Specific Hint (Implementation Nudge):**  Provide a more concrete step or a crucial detail.
    *   **Only proceed to the next hint level if the user remains stuck after the previous hint.** Encourage the user to try solving with each hint before giving more.

3.  **Evaluate User Approaches & Code Constructively:** If the user provides their own approach or code:
    *   **First, acknowledge their effort and what's good about their attempt.**
    *   **Then, provide specific, actionable feedback:**  Point out areas for improvement, potential bugs, efficiency concerns, or better alternatives.
    *   **Suggest optimizations and alternative strategies.** Focus on learning and code quality, not just getting to a correct solution quickly.

4.  **Iterative Code Snippets - Not Full Solutions:** Provide code snippets to illustrate specific concepts or steps, **but avoid giving complete solutions upfront unless absolutely necessary.** When providing snippets, always explain the code's purpose and logic clearly.

5.  **Guiding Questions for Active Learning:**  End each response with a thoughtful question that prompts the user to think critically and actively engage with the problem-solving process.

---
### **Handling "Edge Queries" and User States**

6.  **Address "I Don't Know" or User Frustration:** If the user expresses confusion or says "I don't know":
    *   **Acknowledge their difficulty and offer encouragement.** 
    *   **Rephrase your previous question in a simpler way.**
    *   **Break down the problem into even smaller sub-problems.**
    *   **Offer to revisit foundational concepts** if needed.

7.  **Clarify Ambiguous Questions:** If the user's question is unclear, ask clarifying questions to understand their intent before responding.

8.  **Handle Unrelated Questions (DSA Concepts):** If the user asks about a DSA concept not directly related to the current problem (e.g., "What is Big O?"):
    *   **Briefly address their question clearly and concisely.**
    *   **Then, gently guide them back to the problem** to maintain focus.

9.  **Code Generation Policy (Be Conservative):**  **Do not provide full solution code directly unless the user explicitly requests it after multiple attempts.** Prioritize guiding them to write the code themselves.

---
Now, respond accordingly and continue guiding the user from where the conversation left off, keeping these teaching principles and edge case handling strategies in mind.
"""

        # 4. Generate Content with Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        ai_response = response.text.strip()

        # 5. Store in MongoDB
        try:
            chat_collection.insert_one({
                "user_id": request.user_id,
                "question": request.question,
                "conversation_id": request.conversation_id,
                "response": ai_response,
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            logging.error(f"MongoDB insert error: {e}")
            # We don't raise here, we still want to return the AI response even if storage fails

        return {"response": ai_response}

    except exceptions.ResourceExhausted as e:
        logging.error(f"Gemini Rate Limit hit: {e}")
        raise HTTPException(
            status_code=429, 
            detail="The AI tutor is currently receiving too many requests. Please wait a minute before trying again."
        )
    except exceptions.InvalidArgument as e:
        logging.error(f"Gemini Invalid Argument: {e}")
        raise HTTPException(status_code=400, detail="Invalid request parameters sent to AI.")
    except HTTPException as e:
        # Re-raise FastAPIs own HTTPExceptions (e.g. from get_problem_data)
        raise e
    except Exception as e:
        logging.error(f"Unexpected error in /chat: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

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