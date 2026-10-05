"""
RAG Engine using LangChain vectorstore interface.
Uses QdrantVectorStore.similarity_search_with_score() — no raw Qdrant client calls.
"""
import asyncio
from typing import List, Optional, Dict, Any
from langchain_qdrant import QdrantVectorStore
from langchain_ollama import OllamaEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.core.config import settings
from app.schemas.chat import CitationOut


class LangChainRAGEngine:

    def __init__(self):
        # LangChain OllamaEmbeddings — used for BOTH indexing and query embedding
        self.embeddings = OllamaEmbeddings(
        model=settings.EMBEDDING_MODEL,
     )
        
        self.qdrant_client = QdrantClient(url=settings.QDRANT_URL)

    def _get_vectorstore(self, collection_name: str) -> QdrantVectorStore:
        """
        Get LangChain QdrantVectorStore for a collection.
        This is the LangChain retriever interface — not raw Qdrant.
        """
        return QdrantVectorStore(
            client=self.qdrant_client,
            collection_name=collection_name,
            embedding=self.embeddings,
        )

    def _build_filter(self, document_ids: List[int]) -> Optional[Filter]:
        """Build Qdrant filter for specific document IDs."""
        if not document_ids:
            return None
        return Filter(
            should=[
                FieldCondition(
                    key="metadata.document_id",
                    match=MatchValue(value=doc_id),
                )
                for doc_id in document_ids
            ]
        )

    async def retrieve(
        self,
        query: str,
        knowledge_base_id: int,
        limit: int = 6,
        document_ids: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """
        LangChain-powered retrieval:
        1. OllamaEmbeddings.embed_query(query) — internally
        2. QdrantVectorStore.similarity_search_with_score()
        3. Returns chunks + citations + context_text
        """
        collection = f"kb_{knowledge_base_id}"
        vectorstore = self._get_vectorstore(collection)

        # Build search kwargs
        search_kwargs = {"k": limit}
        if document_ids:
            search_kwargs["filter"] = self._build_filter(document_ids)

        # LangChain handles embed_query + cosine search in ONE call
        results = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: vectorstore.similarity_search_with_score(
                query, **search_kwargs
            ),
        )
        # results = List of (LangChain Document, float score)

        if not results:
            return {"chunks": [], "citations": [], "context_text": ""}

        chunks = []
        for lc_doc, score in results:
            meta = lc_doc.metadata
            chunks.append({
                "text":             lc_doc.page_content,
                "document_id":      meta.get("document_id"),
                "document_title":   meta.get("title", "Unknown"),
                "filename":         meta.get("filename", ""),
                "page":             meta.get("page", 1),
                "chunk_index":      meta.get("chunk_index", 0),
                "similarity_score": round(float(score), 4),
            })

        # Build citations (deduplicated by doc+page)
        citations = []
        seen = set()
        for chunk in chunks:
            key = f"{chunk['document_id']}_{chunk['page']}"
            if key not in seen:
                seen.add(key)
                citations.append(CitationOut(
                    document_id=chunk["document_id"],
                    document_title=chunk["document_title"],
                    filename=chunk["filename"],
                    page=chunk["page"],
                    snippet=chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
                    similarity_score=chunk["similarity_score"],
                ))

        # Build numbered context string for LLM prompt injection
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            context_parts.append(
                f"[{i}] Source: {chunk['document_title']} (Page {chunk['page']})\n{chunk['text']}"
            )
        context_text = "\n\n---\n\n".join(context_parts)

        return {
            "chunks": chunks,
            "citations": citations,
            "context_text": context_text,
        }

    async def retrieve_for_compare(
        self,
        query: str,
        knowledge_base_id: int,
        doc_a_id: int,
        doc_b_id: int,
    ) -> Dict[str, Any]:
        """
        Retrieve chunks from two documents separately for comparison.
        Each gets 4 chunks — equal representation.
        """
        result_a, result_b = await asyncio.gather(
            self.retrieve(query, knowledge_base_id, limit=4, document_ids=[doc_a_id]),
            self.retrieve(query, knowledge_base_id, limit=4, document_ids=[doc_b_id]),
        )

        # Get document titles
        doc_a_title = result_a["chunks"][0]["document_title"] if result_a["chunks"] else "Document A"
        doc_b_title = result_b["chunks"][0]["document_title"] if result_b["chunks"] else "Document B"

        return {
            "chunks_a":    result_a["chunks"],
            "chunks_b":    result_b["chunks"],
            "context_a":   result_a["context_text"],
            "context_b":   result_b["context_text"],
            "doc_a_title": doc_a_title,
            "doc_b_title": doc_b_title,
            "citations":   result_a["citations"] + result_b["citations"],
        }

    async def semantic_search(
        self,
        query: str,
        knowledge_base_id: int,
        limit: int = 8,
        document_ids: Optional[List[int]] = None,
    ) -> List[tuple]:
        """
        Direct semantic search — used by the Search API.
        Returns raw (Document, score) tuples.
        """
        collection = f"kb_{knowledge_base_id}"
        vectorstore = self._get_vectorstore(collection)

        search_kwargs = {"k": limit}
        if document_ids:
            search_kwargs["filter"] = self._build_filter(document_ids)

        results = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: vectorstore.similarity_search_with_score(query, **search_kwargs),
        )
        return results


rag_engine = LangChainRAGEngine()
