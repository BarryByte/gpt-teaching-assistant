import os
import sys
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock MongoDB before importing app to avoid connection errors
import sys

# Mock the pymongo module completely if needed, or just MongoClient
# But since we use from pymongo import MongoClient, we need to mock it in sys.modules or before import?
# Easiest is to mock it via sys.modules["pymongo"] = ... but that denies real pymongo.
# Better: Patch it via unittest.mock.
# However, we can also just use a context manager or just sets of mocks.
# Actually, since 'app.db.database' executes on import, we must ensure MongoClient is mocked.
import pymongo

# We overwrite MongoClient globally before importing app
original_mongo_client = pymongo.MongoClient
pymongo.MongoClient = MagicMock()

from app.main import app  # noqa: E402

# Restore is hard here once imported, but for tests it is fine to keep it mocked.
# If we need real mongo for some tests, we are in trouble, but user asked to mock external calls.


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_gemini(mocker):
    """Mocks the Google Generative AI module to avoid real API calls."""
    mock_genai = mocker.patch("app.api.v1.chat.genai")
    mock_model = MagicMock()
    mock_genai.GenerativeModel.return_value = mock_model

    # Mock streaming response
    async def mock_stream_response(prompt, stream=True):
        yield MagicMock(text="This is a mocked response from Gemini.")

    mock_model.generate_content.side_effect = lambda prompt, stream=True: [
        MagicMock(text="This is a mocked response from Gemini.")
    ]
    return mock_genai


@pytest.fixture
def mock_mongo(mocker):
    """Mocks MongoDB interactions to avoid database dependency."""
    mock_db = mocker.patch("app.api.v1.chat.chat_collection")
    return mock_db


@pytest.fixture
def mock_auth_user(mocker):
    """Overrides the get_current_user dependency."""
    from app.models.schemas import User

    user = User(
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        disable=False,
    )
    mocker.patch("app.api.v1.chat.get_current_user", return_value=user)
    return user
