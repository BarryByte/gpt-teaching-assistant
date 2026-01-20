from app.main import app


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_flow_mocked(client, mock_gemini, mock_mongo, mock_auth_user, mocker):
    # Mock specific problem fetch
    mocker.patch(
        "app.api.v1.chat.get_problem_data",
        return_value={
            "title": "Two Sum",
            "platform": "LeetCode",
            "difficulty": "Easy",
            "tags": ["Array", "Hash Table"],
            "description": "Find two numbers that add up to target.",
            "examples": [],
        },
    )

    payload = {
        "question": "How do I solve this?",
        "conversation_id": "test-conv-123",
        "problem_slug": "two-sum",
    }

    # We need to authenticate, but since we mocked get_current_user dependency in conftest
    # (wait, we didn't override it in app, we patched it where it is imported)
    # The `mock_auth_user` fixture patches `app.api.v1.chat.get_current_user`.
    # However, FastAPI resolved dependencies at startup/request time.
    # Best way is to override dependency.

    from app.core.security import get_current_user

    app.dependency_overrides[get_current_user] = lambda: mock_auth_user

    response = client.post("/chat", json=payload)

    assert response.status_code == 200
    # response is streaming, so we check content
    assert "This is a mocked response from Gemini." in response.text

    # Cleanup
    app.dependency_overrides = {}
