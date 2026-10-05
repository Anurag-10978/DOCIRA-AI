from unittest.mock import patch, AsyncMock, MagicMock
from langchain_core.documents import Document as LCDoc


def test_semantic_search(client, auth_headers):
    kb_res = client.post("/api/knowledge-bases/", json={"name": "Search KB"}, headers=auth_headers)
    kb_id = kb_res.json()["id"]

    mock_results = [
        (LCDoc(page_content="Payment terms are net 30 days.", metadata={
            "document_id": 1, "title": "Contract.pdf", "filename": "contract.pdf",
            "file_type": "pdf", "page": 3, "chunk_index": 5,
        }), 0.92),
    ]

    with patch("app.api.search.rag_engine.semantic_search", new_callable=AsyncMock, return_value=mock_results):
        res = client.post("/api/search/semantic", json={
            "query": "payment terms",
            "knowledge_base_id": kb_id,
        }, headers=auth_headers)

    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["results"][0]["similarity_score"] == 0.92
    assert "payment" in data["results"][0]["snippet"].lower()


def test_search_history(client, auth_headers):
    res = client.get("/api/search/history", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_frequent_searches(client, auth_headers):
    res = client.get("/api/search/frequent", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)