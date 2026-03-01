# GPT Teaching Assistant 🧠

> A personalized, AI-powered tutor for mastering Data Structures and Algorithms.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://gpt-teaching-assistant.vercel.app)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF)

## 📖 System Overview

**GPT Teaching Assistant** is a production-grade educational platform designed to simulate a real human tutor. It moves beyond simple Q&A by using a **Socratic method**, guiding students through problems with hints and conceptual breakdowns rather than direct answers.

### Architecture

```
User → Vercel (React SPA) → AWS EC2 (FastAPI + Docker) → MongoDB Atlas
                                        ↓
                                  Google Gemini API
```

| Layer | Technology | Hosting |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + TypeScript + Tailwind CSS | Vercel (auto-deploy) |
| **Backend** | FastAPI (Python 3.12), Dockerized | AWS EC2 (t3.micro) |
| **Database** | MongoDB Atlas (M0 free tier) | Cloud-hosted |
| **AI Engine** | Google Gemini 2.0 Flash | External API |
| **HTTPS** | Caddy (auto-renewing Let's Encrypt) | EC2 |
| **Auth** | JWT (HS256, 24h expiry) | Backend |

## ✨ Key Features

- **🚀 Smart Authentication** — Secure signup, login, and session management using JWT.
- **💬 Real-Time Streaming** — Typewriter-style AI responses via Server-Sent Events for a natural flow.
- **📚 Persistent Chat History** — All sessions are saved privately; users can rename, delete, and revisit conversations.
- **🧩 Deep LeetCode Integration** — Paste a problem URL to instantly load context, constraints, and targeted hints.
- **⚡ Auto-Start Sessions** — Fetching a problem automatically jump-starts the AI teaching conversation context.
- **💻 Code Editor Awareness** — The AI reads the built-in code editor in real-time to provide highly specific logic and syntax feedback. 
- **🎯 Socratic Guidance-First** — The AI acts as a tutor, refusing to spoon-feed answers and successfully navigating edge cases (e.g. infinite loops, overconfidence).
- **🛡️ Production-Grade** — HTTPS everywhere, CORS-hardened, container auto-restart, health-check monitoring, and rate limiting.

## 🛠️ DevOps & Infrastructure

This project follows industry-standard DevOps practices for reliability and automation.

- **Containerization**: Backend is fully Dockerized with non-root user, health checks, and auto-restart policies.
- **HTTPS**: Caddy reverse proxy with automatic Let's Encrypt certificate renewal.
- **CI/CD**: Full automation via **GitHub Actions** — push to `main` and everything deploys.

### CI/CD Pipelines

| Workflow | Trigger | Description |
| :--- | :--- | :--- |
| **CI Pipeline** | Push to `main` | Lints (Ruff), SAST (Bandit), SCA (Pip-Audit), unit tests (Pytest), Docker build, container scan (Trivy), and pushes to DockerHub. |
| **CD Pipeline** | CI Success | SSHes into EC2, pulls latest code, rebuilds Docker image, restarts the container, and verifies the health endpoint. |

---

## 🚀 Getting Started

### Prerequisites
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))
- **MongoDB** (Local instance or [Atlas free tier](https://www.mongodb.com/cloud/atlas))

### Method 1: Docker (Recommended)

```bash
# Clone
git clone https://github.com/BarryByte/gpt-teaching-assistant.git
cd gpt-teaching-assistant

# Backend
docker build -t gta-backend ./backend
docker run -d -p 8000:8000 \
  -e GEMINI_API_KEY="your_key" \
  -e MONGO_URI="your_mongo_uri" \
  -e MONGODB_DB_NAME="mygta" \
  -e SECRET_KEY="your_secret_key" \
  gta-backend

# Frontend
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Visit `http://localhost:5173` to start learning!

### Method 2: Local Development

```bash
# Backend
cd backend
python -m venv myenv && source myenv/bin/activate
pip install -r requirements.txt
# Create .env with: GEMINI_API_KEY, MONGO_URI, MONGODB_DB_NAME, SECRET_KEY
uvicorn app.main:app --reload --port 8000

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

---

## 🌐 Production Deployment

The live application is deployed as follows:

| Component | Platform | URL |
| :--- | :--- | :--- |
| Frontend | Vercel | [gpt-teaching-assistant.vercel.app](https://gpt-teaching-assistant.vercel.app) |
| Backend API | AWS EC2 + Caddy | `https://gta-api.duckdns.org` |
| Database | MongoDB Atlas | Cloud-managed |

Pushes to `main` auto-deploy both frontend (Vercel) and backend (GitHub Actions → EC2).

## 📸 Screenshots

| Login Page | Chat Interface |
|:---:|:---:|
| ![Login UI](https://placehold.co/600x400/e2e8f0/475569?text=Login+Securely) | ![Chat UI](https://placehold.co/600x400/e2e8f0/475569?text=Interactive+Tutor) |


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).
