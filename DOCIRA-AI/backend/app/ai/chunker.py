from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List


class LangChainChunker:
    """
    Uses RecursiveCharacterTextSplitter — LangChain's best splitter.

    Why recursive?
    It tries to split on: paragraphs → sentences → words → characters.
    This means chunks NEVER cut mid-sentence. Much better for RAG quality
    than our old word-count loop which cut arbitrarily.
    """

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""],
        )

    def chunk(self, raw_docs: List[Document], document_meta: dict) -> List[dict]:
        """
        Split raw LangChain Documents into overlapping chunks.
        Injects document metadata (id, title, filename, kb_id) into each chunk.
        Returns list of dicts ready for embedding + Qdrant storage.
        """
        # Split
        split_docs = self.splitter.split_documents(raw_docs)

        chunks = []
        for i, doc in enumerate(split_docs):
            # Page number from metadata or default to 1
            page = doc.metadata.get("page", 1)
            if isinstance(page, int) and page == 0:
                page = 1

            chunk_text = doc.page_content.strip()
            if len(chunk_text) < 30:   # skip tiny fragments
                continue

            chunks.append({
                "text": chunk_text,
                "page": page,
                "chunk_index": i,
                "word_count": len(chunk_text.split()),
                # Inject document metadata for Qdrant payload
                "document_id": document_meta["document_id"],
                "knowledge_base_id": document_meta["knowledge_base_id"],
                "title": document_meta["title"],
                "filename": document_meta["filename"],
                "file_type": document_meta["file_type"],
                "category": document_meta.get("category", ""),
                "tags": document_meta.get("tags", []),
            })

        return chunks


document_chunker = LangChainChunker(chunk_size=1000, chunk_overlap=200)