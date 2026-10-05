from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SemanticSearchRequest(BaseModel):
    query: str
    knowledge_base_id: int
    document_ids: Optional[List[int]] = None
    limit: int = 8


class SearchResultOut(BaseModel):
    document_id: int
    document_title: str
    filename: str
    file_type: str
    page: int
    snippet: str
    similarity_score: float


class SemanticSearchResponse(BaseModel):
    query: str
    results: List[SearchResultOut]
    total: int
    latency_ms: int


class SearchHistoryOut(BaseModel):
    id: int
    query_text: str
    task_type: str
    knowledge_base_id: Optional[int]
    response_time_ms: int
    created_at: datetime

    class Config:
        from_attributes = True