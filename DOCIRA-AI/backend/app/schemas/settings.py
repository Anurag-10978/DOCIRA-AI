from pydantic import BaseModel
from typing import Optional, List


class AISettings(BaseModel):
    llm_model: str = "llama3.2"
    embedding_model: str = "nomic-embed-text"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    temperature: float = 0.1
    max_context_chunks: int = 6


class AISettingsUpdate(BaseModel):
    llm_model: Optional[str] = None
    embedding_model: Optional[str] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    temperature: Optional[float] = None
    max_context_chunks: Optional[int] = None


class ModelPullRequest(BaseModel):
    model_name: str


class AvailableModels(BaseModel):
    models: List[str]