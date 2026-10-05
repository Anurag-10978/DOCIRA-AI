from unittest.mock import patch, AsyncMock


def create_kb_and_conv(client, headers):
    kb_res = client.post("/api/knowledge-bases/", json={"name": "Chat KB"}, headers=headers)
    kb_id = kb_res.json()["id"]
    conv_res = client.post("/api/chat/", json={"knowledge_base_id": kb_id}, headers=headers)
    return kb_id, conv_res.json()["id"]


def test_create_conversation(client, auth_headers):
    kb_res = client.post("/api/knowledge-bases/", json={"name": "KB"}, headers=auth_headers)
    kb_id = kb_res.json()["id"]
    res = client.post("/api/chat/", json={"knowledge_base_id": kb_id}, headers=auth_headers)
    print("\nSTATUS:", res.status_code)
    print("BODY:", res.json())
    print(res.status_code)
    print(res.json())
    assert res.status_code == 201
    assert res.json()["knowledge_base_id"] == kb_id


def test_list_conversations(client, auth_headers):
    create_kb_and_conv(client, auth_headers)
    res = client.get("/api/chat/", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_send_message_calls_langgraph(client, auth_headers):
    _, conv_id = create_kb_and_conv(client, auth_headers)

    mock_result = {
        "response": "This is a grounded answer from your documents.",
        "task_type": "qa",
        "citations": [],
        "metadata": {
            "model": "llama3.2", "task_type": "qa",
            "chunks_retrieved": 3, "tokens_used": 150,
            "latency_ms": 1200, "embedding_model": "nomic-embed-text",
        },
    }

    with patch("app.api.chat.run_agent", new_callable=AsyncMock, return_value=mock_result):
        res = client.post(
            f"/api/chat/{conv_id}/message",
            json={"content": "What are the payment terms?"},
            headers=auth_headers,
        )

    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "assistant"
    assert data["content"] == mock_result["response"]
    assert data["ai_metadata"]["task_type"] == "qa"


def test_get_messages(client, auth_headers):
    _, conv_id = create_kb_and_conv(client, auth_headers)
    res = client.get(f"/api/chat/{conv_id}/messages", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_delete_conversation(client, auth_headers):
    _, conv_id = create_kb_and_conv(client, auth_headers)
    res = client.delete(f"/api/chat/{conv_id}", headers=auth_headers)
    assert res.status_code == 204


def test_auto_title_from_first_message(client, auth_headers):
    _, conv_id = create_kb_and_conv(client, auth_headers)

    mock_result = {
        "response": "Answer", "task_type": "qa", "citations": [],
        "metadata": {"model": "llama3.2", "task_type": "qa", "chunks_retrieved": 0,
                     "tokens_used": 0, "latency_ms": 0, "embedding_model": "nomic-embed-text"},
    }

    with patch("app.api.chat.run_agent", new_callable=AsyncMock, return_value=mock_result):
        client.post(
            f"/api/chat/{conv_id}/message",
            json={"content": "What are the key clauses in this contract?"},
            headers=auth_headers,
        )

    res = client.get(f"/api/chat/{conv_id}", headers=auth_headers)
    # Title should be auto-set from first message
    assert "contract" in res.json()["title"].lower() or len(res.json()["title"]) > 5