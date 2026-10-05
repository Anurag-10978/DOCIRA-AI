from langchain_ollama import OllamaEmbeddings
from langchain_core.embeddings import Embeddings
from app.core.config import settings
from typing import List


class LangChainEmbedder:
    """
    Uses LangChain's OllamaEmbeddings wrapper.
    Benefits over raw httpx:
    - Built-in retry logic
    - Consistent interface (swap to OpenAI/HuggingFace with 1 line)
    - embed_documents() for batch, embed_query() for single query
    """

    def __init__(self):
        print("=" * 60)
        print("OLLAMA URL :", settings.OLLAMA_URL)
        print("MODEL       :", settings.EMBEDDING_MODEL)
        print("=" * 60)

        
        self.embeddings = OllamaEmbeddings(
        model=settings.EMBEDDING_MODEL,
        )

    async def embed(self, text: str) -> List[float]:
        """Single text embedding — for query embedding at search time."""
        # OllamaEmbeddings is sync; run in thread pool to not block async loop
        import asyncio
        return await asyncio.get_event_loop().run_in_executor(
            None, self.embeddings.embed_query, text
        )

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Batch embedding — for document chunks at indexing time."""
        import asyncio
        return await asyncio.get_event_loop().run_in_executor(
            None, self.embeddings.embed_documents, texts
        )

    @property
    def raw(self) -> Embeddings:
        """Expose raw LangChain embeddings object for vectorstore integration."""
        return self.embeddings


ollama_embedder = LangChainEmbedder() 
