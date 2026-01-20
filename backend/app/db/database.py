import logging

from pymongo import MongoClient
from pymongo.server_api import ServerApi

from app.core.config import settings

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

try:
    client = MongoClient(settings.MONGO_URI, server_api=ServerApi("1"))
    client.admin.command("ping")
    logging.info("Successfully connected to MongoDB!")
    db = client[settings.MONGODB_DB_NAME]
    chat_collection = db["chats"]
    users_collection = db["users"]
except Exception as e:
    logging.error(f"Failed to connect to MongoDB: {e}")
    raise ValueError("Failed to connect to MongoDB")
