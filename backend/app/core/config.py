import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    @property
    def GEMINI_API_KEY(self):
        return os.getenv("GEMINI_API_KEY")

    @property
    def MONGO_URI(self):
        return os.getenv("MONGO_URI")

    @property
    def MONGODB_DB_NAME(self):
        return os.getenv("MONGODB_DB_NAME")

    @property
    def SECRET_KEY(self):
        return os.getenv("SECRET_KEY")

    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


settings = Settings()


def require_gemini_key() -> str:
    key = settings.GEMINI_API_KEY
    if not key:
        raise RuntimeError("GEMINI_API_KEY is required for Gemini operations")
    return key


def require_mongo_config() -> tuple[str, str]:
    uri = settings.MONGO_URI
    db_name = settings.MONGODB_DB_NAME
    if not uri or not db_name:
        raise RuntimeError(
            "MongoDB configuration (MONGO_URI, MONGODB_DB_NAME) is missing"
        )
    return uri, db_name


def require_secret_key() -> str:
    key = settings.SECRET_KEY
    if not key:
        raise RuntimeError("SECRET_KEY is required for authentication")
    return key
