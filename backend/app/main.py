
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router

# FastAPI app
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router) # /signup, /token, /users/me are at root or we can prefix
app.include_router(chat_router) # /chat, etc.

# We might want to prefix them for better structure, e.g. /api/v1
# But to maintain frontend compatibility without changing EVERY URL right now, 
# I will keep them as is or ensure frontend is updated.
# The user asked to make it production ready.
# Let's see: `auth.py` has `/signup`, `/token`. `chat.py` has `/chat`.
# The imports above just add them to the app.

@app.get("/health")
def health_check():
    return {"status": "ok"}
