# GPT Teaching Assistant 🧠

> A personalized, AI-powered tutor for mastering Data Structures and Algorithms.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## Overview

**GPT Teaching Assistant** is an interactive platform designed to help students learn DSA concepts effectively. Unlike traditional AI tools that give direct answers, this assistant uses the **Google Gemini API** to provide Socratic guidance, hints, and conceptual explanations, fostering true problem-solving skills.

## ✨ Key Features

- **🚀 Smart Authentication**: Secure user signup, login, and session management using JWT.
- **💬 Real-Time Streaming Chat**: Experience instant, typewriter-style responses for a natural conversation flow.
- **📚 User-Specific History**: All your chat sessions are saved privately to your account.
- **🗑️ Conversation Management**: Easily delete old or irrelevant sessions.
- **🧩 Deep LeetCode Integration**: Paste a problem URL to instantly load context, constraints, and specific hints.
- **🎯 Guidance-First Approach**: The AI avoids spoon-feeding solutions, instead guiding you to the answer.

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (via PyMongo)
- **AI Engine**: Google Gemini 2.0 Flash
- **Architecture**: Modular Service-Oriented Architecture

### Frontend
- **Framework**: React (Vite) + TypeScript
- **Styling**: Tailwind CSS
- **State**: Context API
- **Routing**: React Router

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.9+
- MongoDB Instance
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/gpt-teaching-assistant.git
cd gpt-teaching-assistant
```

### 2. Backend Setup
```bash
cd backend
python -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
GEMINI_API_KEY=your_gemini_key
MONGO_URI=your_mongodb_connection_string
MONGODB_DB_NAME=gpt_tutor_db
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
```

Run the server:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to start learning!

## 📸 Screenshots

| Login Page | Chat Interface |
|:---:|:---:|
| ![Login UI](https://placehold.co/600x400/e2e8f0/475569?text=Login+Securely) | ![Chat UI](https://placehold.co/600x400/e2e8f0/475569?text=Interactive+Tutor) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-sourced under the MIT License.
