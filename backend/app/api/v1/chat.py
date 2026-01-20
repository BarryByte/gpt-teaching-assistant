import json
import logging
from datetime import datetime
from typing import Dict, List

import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from google.api_core import exceptions

from app.core.config import settings, require_gemini_key
from app.core.security import get_current_user
from app.db.database import get_chat_collection
from app.models.schemas import ChatRequest, User
from app.services.scraper_service import get_problem_data

# Initialize Gemini


router = APIRouter()


# --- Helpers ---
def get_user_chat_history(username: str, conversation_id: str) -> List[Dict[str, str]]:
    chat_collection = get_chat_collection()
    history = list(
        chat_collection.find(
            {"user_id": username, "conversation_id": conversation_id},
            {"_id": 0, "question": 1, "response": 1},
        )
    )
    return history


# --- Routes ---


@router.get("/fetch-problem/{problem_identifier:path}")
def fetch_problem(problem_identifier: str):
    return get_problem_data(problem_identifier)


@router.get("/fetch-problem-summary/{problem_identifier:path}")
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


@router.post("/chat")
async def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    try:
        # Initialize Gemini and validate key
        api_key = require_gemini_key()
        genai.configure(api_key=api_key)

        logging.info(
            f"Received chat request from {current_user.username} for problem: {request.problem_slug}"
        )

        # 1. Fetch problem data
        problem_data = get_problem_data(request.problem_slug)

        # 2. Build Chat History Context
        try:
            history = get_user_chat_history(
                current_user.username, request.conversation_id
            )
            history_context = json.dumps(history[-5:], indent=2)
        except Exception as e:
            logging.error(f"MongoDB history fetch error: {e}")
            history_context = "[]"

        # 3. Construct Prompt
        prompt = f"""
You are an expert AI-powered Data Structures and Algorithms (DSA) tutor. Your mission is to **guide the user** step-by-step in solving the problem '{problem_data["title"]}' from {problem_data["platform"]}. You are designed to be patient, encouraging, and focused on long-term learning.

---
### **Problem Details**
* **Platform:** {problem_data["platform"]}
* **Difficulty:** {problem_data["difficulty"]}
* **Tags:** {", ".join(problem_data["tags"])}
* **Description:** {problem_data["description"]}


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

        # 4. Generate Content with Gemini (STREAMING)
        model = genai.GenerativeModel(
            "gemini-2.5-flash-lite",
            generation_config=genai.types.GenerationConfig(
                temperature=0.0,  # Deterministic output
                candidate_count=1,
            ),
        )

        async def response_generator():
            full_response = ""
            try:
                # Use stream=True for streaming
                responses = model.generate_content(prompt, stream=True)
                for chunk in responses:
                    if chunk.text:
                        full_response += chunk.text
                        yield chunk.text

                # After streaming is complete, save to DB
                try:
                    chat_collection = get_chat_collection()
                    chat_collection.insert_one(
                        {
                            "user_id": current_user.username,
                            "question": request.question,
                            "conversation_id": request.conversation_id,
                            "problem_slug": request.problem_slug,
                            "response": full_response,
                            "timestamp": datetime.now().isoformat(),
                        }
                    )
                except Exception as e:
                    logging.error(f"MongoDB insert error after stream: {e}")

            except Exception as e:
                logging.error(f"Error during streaming: {e}")
                yield f"Error: {str(e)}"

        return StreamingResponse(response_generator(), media_type="text/plain")

    except exceptions.ResourceExhausted as e:
        logging.error(f"Gemini Rate Limit hit: {e}")
        raise HTTPException(status_code=429, detail="Too many requests.")
    except Exception as e:
        logging.error(f"Unexpected error in /chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{conversation_id}")
def fetch_history(
    conversation_id: str, current_user: User = Depends(get_current_user)
) -> List[Dict[str, str]]:
    return get_user_chat_history(current_user.username, conversation_id)


@router.get("/conversations")
def get_conversations(current_user: User = Depends(get_current_user)):
    try:
        pipeline = [
            {"$match": {"user_id": current_user.username}},
            {"$sort": {"timestamp": -1}},
            {
                "$group": {
                    "_id": "$conversation_id",
                    "last_message": {"$first": "$response"},
                    "timestamp": {"$first": "$timestamp"},
                    "problem_slug": {"$first": "$problem_slug"},
                    "title": {"$first": "$title"},  # Try to get custom title
                }
            },
            {"$sort": {"timestamp": -1}},
        ]



        chat_collection = get_chat_collection()
        conversations_agg = list(chat_collection.aggregate(pipeline))

        results = []
        for conv in conversations_agg:
            # Title logic: Use saved title -> Format slug -> Default
            title = conv.get("title")
            if not title and conv.get("problem_slug"):
                # "two-sum" -> "Two Sum"
                title = " ".join(
                    word.capitalize() for word in conv["problem_slug"].split("-")
                )
            if not title:
                title = "New Chat"

            results.append(
                {
                    "conversation_id": conv["_id"],
                    "title": title,
                    "last_message": conv.get("last_message", "")[
                        :100
                    ],  # Send a bit more for preview
                    "timestamp": conv.get("timestamp"),
                    "problem_slug": conv.get("problem_slug"),
                }
            )

        return results
    except Exception as e:
        logging.error(f"Error fetching conversations: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversations")


@router.patch("/history/{conversation_id}")
def rename_conversation(
    conversation_id: str,
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user),
):
    new_title = payload.get("title")
    if not new_title:
        raise HTTPException(status_code=400, detail="Title is required")

    # Update all messages in this conversation with the new title
    # This acts as a persistent metadata update since we aggregate from messages
    chat_collection = get_chat_collection()
    result = chat_collection.update_many(
        {"conversation_id": conversation_id, "user_id": current_user.username},
        {"$set": {"title": new_title}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"message": "Conversation renamed", "title": new_title}


@router.delete("/history/{conversation_id}")
def delete_conversation(
    conversation_id: str, current_user: User = Depends(get_current_user)
):
    chat_collection = get_chat_collection()
    result = chat_collection.delete_many(
        {"conversation_id": conversation_id, "user_id": current_user.username}
    )
    if result.deleted_count == 0:
        return {"message": "Conversation deleted or not found"}

    return {
        "message": f"Deleted {result.deleted_count} messages for conversation {conversation_id}"
    }
