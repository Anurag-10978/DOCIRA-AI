# from langchain_qdrant import QdrantVectorStore
from langchain_qdrant import Qdrant
from langchain_core.documents import Document
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, Filter, FieldCondition, MatchValue, FilterSelector
from app.core.config import settings
from app.ai.embedder import ollama_embedder
from typing import List, Optional


class LangChainVectorStore:
    """
    LangChain Qdrant wrapper.
    Benefits:
    - add_documents() handles embedding + upsert in one call
    - similarity_search_with_score() returns (Document, score) tuples
    - Metadata filtering via LangChain filter syntax
    - Can swap Qdrant → Chroma/Pinecone/Weaviate with 1 line
    """

    def __init__(self):
        self.client = QdrantClient(url=settings.QDRANT_URL)

    def _ensure_collection(self, collection_name: str):
        existing = [c.name for c in self.client.get_collections().collections]
        if collection_name not in existing:
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=settings.VECTOR_DIM,
                    distance=Distance.COSINE,
                ),
            )

    def get_store(self, collection_name: str) -> Qdrant:
        """Get a LangChain QdrantVectorStore for a collection."""
        self._ensure_collection(collection_name)
        return Qdrant(
        client=self.client,
        collection_name=collection_name,
        embeddings=ollama_embedder.raw,
    )

    async def add_chunks(self, collection: str, chunks: List[dict]) -> List[str]:
        """
        Convert chunk dicts → LangChain Documents → embed → upsert to Qdrant.
        This is ONE CALL instead of our old 3-step manual process.
        """
        self._ensure_collection(collection)

        # Convert to LangChain Documents (metadata = Qdrant payload)
        lc_docs = [
            Document(
                page_content=chunk["text"],
                metadata={
                    "document_id":      chunk["document_id"],
                    "knowledge_base_id":chunk["knowledge_base_id"],
                    "title":            chunk["title"],
                    "filename":         chunk["filename"],
                    "file_type":        chunk["file_type"],
                    "page":             chunk["page"],
                    "chunk_index":      chunk["chunk_index"],
                    "category":         chunk.get("category", ""),
                    "tags":             chunk.get("tags", []),
                },
            )
            for chunk in chunks
        ]

        store = self.get_store(collection)

        # add_documents embeds + upserts in one call
        import asyncio
        print("Using embedding object:")
        print(store.embeddings)
        ids = await asyncio.get_event_loop().run_in_executor(
            None, store.add_documents, lc_docs
        )
        return ids

    async def similarity_search(
        self,
        collection: str,
        query: str,
        limit: int = 6,
        document_ids: Optional[List[int]] = None,
    ) -> List[tuple]:
        """
        Returns List of (Document, score) tuples.
        LangChain handles embed_query + search in one call.
        """
        store = self.get_store(collection)

        # Build filter if specific docs requested
        search_kwargs = {"k": limit}
        if document_ids:
            search_kwargs["filter"] = Filter(
                must=[
                    FieldCondition(
                        key="metadata.document_id",
                        match=MatchValue(value=doc_id),
                    )
                    for doc_id in document_ids
                ]
            )

        import asyncio
        results = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: store.similarity_search_with_score(query, **search_kwargs),
        )
        return results   # [(Document, float), ...]

    def delete_by_document(self, collection: str, document_id: int):
        try:
            self.client.delete(
                collection_name=collection,
                points_selector=FilterSelector(
                    filter=Filter(
                        must=[FieldCondition(
                            key="metadata.document_id",
                            match=MatchValue(value=document_id),
                        )]
                    )
                ),
                wait=True,
            )
        except Exception:
            pass

    def delete_collection(self, collection: str):
        try:
            self.client.delete_collection(collection_name=collection)
        except Exception:
            pass

    def count_points(self, collection: str) -> int:
        try:
            return self.client.count(collection_name=collection, exact=True).count
        except Exception:
            return 0


vector_store = LangChainVectorStore()