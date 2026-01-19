
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    MONGO_URI = os.getenv("MONGO_URI")
    MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-should-be-in-env")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

settings = Settings()

if not settings.GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not set in .env")
if not settings.MONGO_URI:
    raise ValueError("MONGO_URI not set in .env")
if not settings.MONGODB_DB_NAME:
    raise ValueError("MONGODB_DB_NAME not set in .env")
