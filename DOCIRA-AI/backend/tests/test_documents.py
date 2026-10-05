import io
from unittest.mock import patch, AsyncMock


def create_kb(client, headers):
    res = client.post("/api/knowledge-bases/", json={"name": "Test KB", "category": "Legal"}, headers=headers)
    assert res.status_code == 201
    return res.json()["id"]


def test_create_knowledge_base(client, auth_headers):
    res = client.post("/api/knowledge-bases/", json={"name": "HR Docs", "category": "HR"}, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "HR Docs"
    assert data["category"] == "HR"


def test_list_knowledge_bases(client, auth_headers):
    create_kb(client, auth_headers)
    res = client.get("/api/knowledge-bases/", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_delete_knowledge_base(client, auth_headers):
    kb_id = create_kb(client, auth_headers)
    res = client.delete(f"/api/knowledge-bases/{kb_id}", headers=auth_headers)
    assert res.status_code == 204


def test_upload_document(client, auth_headers):
    kb_id = create_kb(client, auth_headers)

    with patch("app.api.documents.asyncio.create_task"):
        file_content = b"This is a test document content for testing purposes."
        res = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            data={"knowledge_base_id": str(kb_id), "title": "Test Doc", "tags": "[]"},
            files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")},
        )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Test Doc"
    assert data["status"] == "pending"
    assert data["file_type"] == "txt"


def test_upload_invalid_type(client, auth_headers):
    kb_id = create_kb(client, auth_headers)
    res = client.post(
        "/api/documents/upload",
        headers=auth_headers,
        data={"knowledge_base_id": str(kb_id), "tags": "[]"},
        files={"file": ("test.exe", io.BytesIO(b"binary"), "application/octet-stream")},
    )
    assert res.status_code == 400


def test_delete_document_removes_vectors(client, auth_headers):
    kb_id = create_kb(client, auth_headers)
    with patch("app.api.documents.asyncio.create_task"):
        res = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            data={"knowledge_base_id": str(kb_id), "tags": "[]"},
            files={"file": ("test.txt", io.BytesIO(b"content"), "text/plain")},
        )
    doc_id = res.json()["id"]

    with patch("app.services.document_service.vector_store.delete_by_document") as mock_del:
        res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
        assert res.status_code == 204
        mock_del.assert_called_once()


def test_get_processing_logs(client, auth_headers):
    kb_id = create_kb(client, auth_headers)
    with patch("app.api.documents.asyncio.create_task"):
        res = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            data={"knowledge_base_id": str(kb_id), "tags": "[]"},
            files={"file": ("test.txt", io.BytesIO(b"content"), "text/plain")},
        )
    doc_id = res.json()["id"]
    res = client.get(f"/api/documents/{doc_id}/logs", headers=auth_headers)
    assert res.status_code == 200
    assert "logs" in res.json()
    assert "status" in res.json()