# GPT Teaching Assistant - DSA Learning App

## Overview

GPT Teaching Assistant is a web application designed to aid students in understanding Data Structures and Algorithms (DSA) problems from LeetCode.  It offers a chat-based interface where users can submit LeetCode problem links and their questions.  Powered by the Google Gemini API, the backend provides guidance and hints, fostering problem-solving skills without giving direct answers. Built with FastAPI, React, Vite, and Tailwind CSS.

## Video Demo

[**Loom Video Demo**](https://www.loom.com/share/454e951cc1cd4ad98d5a7c372f672100?sid=1bfe9b35-44d0-49bb-bfdc-d8d8703b7c06)



## Features

*   **LeetCode Input:**  Easily submit LeetCode problem URLs.
*   **Doubt Submission:**  Chat interface for asking specific DSA questions.
*   **GPT-Powered Help:**  Uses Google Gemini API (gemini-flash2.0) for intelligent assistance.
*   **Guidance, Not Solutions:**  Provides hints and guiding questions to promote independent problem-solving.
*   **Interactive Chat:**  Clean, responsive chat interface with React and Tailwind CSS.
*   **Custom LeetCode Data:** Fetches problem details using a custom scraper for richer context.

## Tech Stack

*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, npm.
*   **Backend:** FastAPI, Python, Google Gemini API (gemini-flash2.0), `google-generativeai`, `python-dotenv`.
*   **Utilities:** `requests`, `beautifulsoup4`, `uvicorn`, `pydantic`.

[**Screenshot of the chat interface here**]
## Screenshots
![image](https://github.com/user-attachments/assets/c85f19c0-cff4-4b9f-a628-1cbdd71b3496)
![image](https://github.com/user-attachments/assets/9bdb976e-5a30-4d97-8904-2e3498c04095)



## Setup Instructions

1.  **Clone Repo:**
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd gpt-assistant-env
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    cd gpt_assistant_env/bin
    source activate # Activate virtual env
    cd ../..
    pip install -r requirements.txt
    ```
    *   **Dependencies:** See `requirements.txt` for Python packages.
    *   **.env Config:** Create `.env` in `backend/` and add:
        ```dotenv
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
        MONGODB_DB_NAME=YOUR_DATABASE_NAME
        ```
        *   Get Gemini API key from Google AI Studio. Setup MongoDB and add connection string if needed.
    *   **Run Backend:**
        ```bash
        uvicorn backend:app --reload
        ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    *   **Dependencies:** Frontend uses npm. Key: React, Vite, Tailwind CSS.

4.  **Configuration:** Frontend defaults to connect to backend on `http://localhost:[backend_port]`. Verify ports if needed.

[**Screenshot of folder structure could be inserted here**]


## Usage Instructions

1.  **Start:** Run backend and frontend servers.
2.  **Access:** Open browser to `http://localhost:5173`.
3.  **Chat Interface:**
    *   **LeetCode URL:** Paste LeetCode problem link.
    *   **Ask Doubt:** Type your question.
    *   **GPT Help:** Send message, receive guided assistance.
    *   **Interact:** Continue conversation for deeper understanding.



## Architecture

Client-server model:

*   **Frontend (Client):** React UI (Vite, Tailwind CSS). Handles user input/display, communicates with backend API.
*   **Backend (Server):** FastAPI (Python). API server for:
    *   Receiving frontend requests.
    *   Fetching problem data (`leet-scraper.py`).
    *   Interacting with Google Gemini API for responses.
    *   Managing `.env` variables.
    *   Sending responses to frontend.
*   **Google Gemini API:** Provides core AI assistance. Prompt-driven for hints and conceptual guidance.



## Example Prompts

*   **Initial Understanding:** "Tell me what you've tried for [LeetCode Problem] or what's confusing you?"
*   **Hint:** "Consider [DSA concept] - how might it apply here?"
*   **Guiding Question:** "What are the key problem constraints and how do they limit solutions?"
*   **Intuition:** "Problems like this often use [Algorithm Pattern/Data Structure]. Any similarities here?"
*   **Avoid Direct Answer:** "Let's break it down. What are the base cases?"
*   **Clarification:** "What aspect are you struggling with: problem, algorithm, or implementation?"
*   **Encouragement:** "You're on the right track! Consider [Algorithm Step/Data Structure] again."
*   **Alternative:** "If current approach isn't working, consider [Different Algorithm Paradigm]."



## Possible Enhancements

*   User Authentication & History
*   Support More Platforms (HackerRank, etc.)
*   Code Execution Environment
*   Advanced Prompt Engineering
*   Different LLM Options
*   Visualizations for DSA Concepts
*   Personalized Learning Paths

## Credits

Developed by Abhay Raj / BarryByte (Github_username) for Software Engineering Intern Assignment.

## License

MIT License
