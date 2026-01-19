from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
import requests
import json
import os
import google.generativeai as genai
from scrapers import get_scraper, extract_identifier
import logging
from functools import lru_cache
from typing import List, Dict, Optional
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime, timedelta
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import JWTError, jwt

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME")

# Secret key for JWT - In production, this should be in .env!
# Using a random string for now or get from env
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-should-be-in-env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Validate environment variables
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in .env")
if not MONGO_URI:
    raise ValueError("MONGO_URI not set in .env")
if not MONGODB_DB_NAME:
    raise ValueError("MONGODB_DB_NAME not set in .env")

# Initialize Gemini AI
genai.configure(api_key=GEMINI_API_KEY)

# Initialize MongoDB Client
try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    client.admin.command('ping')
    logging.info("Successfully connected to MongoDB!")
    db = client[MONGODB_DB_NAME]
    chat_collection = db["chats"]
    users_collection = db["users"]
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

# Authentication Utilities
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Models
class UserCreate(BaseModel):
    username: str
    password: str

class User(BaseModel):
    username: str
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatRequest(BaseModel):
    question: str
    problem_slug: str
    conversation_id: str
    # user_id is no longer taken from request body but from auth token

# Dependencies
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_doc = users_collection.find_one({"username": username})
    if user_doc is None:
        raise credentials_exception
    
    return UserInDB(
        username=user_doc["username"],
        hashed_password=user_doc["hashed_password"],
        disabled=user_doc.get("disabled")
    )

# --- Auth Endpoints ---

@app.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = {
        "username": user.username,
        "hashed_password": hashed_password,
        "disabled": False,
        "created_at": datetime.now()
    }
    users_collection.insert_one(user_dict)
    return {"message": "User created successfully"}

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_doc = users_collection.find_one({"username": form_data.username})
    if not user_doc or not verify_password(form_data.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_doc["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username}

# --- Existing Logic Refactored ---

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

# Chat with Gemini AI (Protected)
@app.post("/chat")
def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    try:
        logging.info(f"Received chat request from {current_user.username} for problem: {request.problem_slug}")
        
        # 1. Fetch problem data (handles its own HTTPExceptions)
        problem_data = get_problem_data(request.problem_slug)
        
        # 2. Build Chat History Context (User Specific)
        try:
            history = get_user_chat_history(current_user.username, request.conversation_id)
            history_context = json.dumps(history[-5:], indent=2)
        except Exception as e:
            logging.error(f"MongoDB history fetch error: {e}")
            history_context = "[]" # Fallback to empty history

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

        # 5. Store in MongoDB (using verified username)
        try:
            chat_collection.insert_one({
                "user_id": current_user.username,
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
        raise e
    except Exception as e:
        logging.error(f"Unexpected error in /chat: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

# Retrieve chat history from MongoDB (Filtered by User)
def get_user_chat_history(username: str, conversation_id: str) -> List[Dict[str, str]]:
    history = list(chat_collection.find(
        {"user_id": username, "conversation_id": conversation_id},
        {"_id": 0, "question": 1, "response": 1}
    ))
    return history


# Retrieve chat history endpoint (Protected)
@app.get("/history/{conversation_id}")
def fetch_history(conversation_id: str, current_user: User = Depends(get_current_user)) -> List[Dict[str, str]]:
    # We ignore any user_id passed in URL (previously it was /history/{user_id}/...)
    # Now we rely on the token to identify the user
    return get_user_chat_history(current_user.username, conversation_id)

# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)