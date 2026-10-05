import os
import tempfile
from unittest.mock import patch, AsyncMock, MagicMock
from app.ai.text_extractor import text_extractor
from app.ai.chunker import document_chunker
from langchain_core.documents import Document as LCDoc


def test_text_extractor_txt():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write("This is a test document.\nIt has multiple lines.\nThird line here.")
        path = f.name
    try:
        result = text_extractor.extract(path, "txt")
        assert result["num_pages"] > 0
        assert "test document" in result["full_text"].lower()
    finally:
        os.unlink(path)


def test_chunker_splits_correctly():
    docs = [LCDoc(page_content=" ".join(["word"] * 300), metadata={"page": 1})]
    meta = {"document_id": 1, "knowledge_base_id": 1, "title": "Test", "filename": "test.txt", "file_type": "txt"}
    chunks = document_chunker.chunk(docs, meta)
    assert len(chunks) > 0
    for chunk in chunks:
        assert "text" in chunk
        assert "page" in chunk
        assert "document_id" in chunk
        assert chunk["document_id"] == 1


def test_chunker_injects_metadata():
    docs = [LCDoc(page_content="Contract between Party A and Party B. " * 20, metadata={"page": 1})]
    meta = {"document_id": 42, "knowledge_base_id": 7, "title": "Contract", "filename": "contract.pdf",
            "file_type": "pdf", "category": "Legal", "tags": ["contract"]}
    chunks = document_chunker.chunk(docs, meta)
    assert all(c["document_id"] == 42 for c in chunks)
    assert all(c["knowledge_base_id"] == 7 for c in chunks)
    assert all(c["title"] == "Contract" for c in chunks)


def test_unsupported_file_type():
    import pytest
    with pytest.raises(ValueError, match="Unsupported file type"):
        text_extractor.extract("/fake/path.xyz", "xyz")