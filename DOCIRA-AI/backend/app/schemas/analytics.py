from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class DailyQueryCount(BaseModel):
    date: str
    count: int
    qa: int = 0
    summarize: int = 0
    compare: int = 0
    extract: int = 0
    search: int = 0


class TaskTypeBreakdown(BaseModel):
    task_type: str
    count: int
    percentage: float


class DocumentStatusStat(BaseModel):
    knowledge_base: str
    completed: int
    processing: int
    failed: int
    pending: int


class TopDocument(BaseModel):
    document_id: int
    title: str
    filename: str
    knowledge_base: str
    query_count: int
    chunk_count: int


class StorageUsage(BaseModel):
    knowledge_base_id: int
    knowledge_base_name: str
    document_count: int
    total_size_mb: float
    chunk_count: int


class AnalyticsOverview(BaseModel):
    total_documents: int
    total_knowledge_bases: int
    total_queries: int
    total_tokens_used: int
    avg_response_time_ms: int
    storage_used_mb: float
    completed_documents: int
    failed_documents: int
    queries_today: int
    queries_this_week: int