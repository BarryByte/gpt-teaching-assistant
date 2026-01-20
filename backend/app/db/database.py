import logging

from pymongo import MongoClient
from pymongo.server_api import ServerApi

from app.core.config import require_mongo_config

_client = None
_db = None


def get_mongo_client():
    global _client
    if _client is None:
        uri, _ = require_mongo_config()
        try:
            _client = MongoClient(uri, server_api=ServerApi("1"))
            _client.admin.command("ping")
            logging.info("Successfully connected to MongoDB!")
        except Exception as e:
            logging.error(f"Failed to connect to MongoDB: {e}")
            raise ValueError("Failed to connect to MongoDB")
    return _client


def get_db():
    global _db
    if _db is None:
        client = get_mongo_client()
        _, db_name = require_mongo_config()
        _db = client[db_name]
    return _db


def get_chat_collection():
    return get_db()["chats"]


def get_users_collection():
    return get_db()["users"]
