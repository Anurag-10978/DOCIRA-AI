from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentOut(BaseModel):
    id: int
    title: str
    filename: str
    file_size: int
    file_type: str
    num_pages: int
    tags: List[str]
    category: Optional[str]
    status: str
    knowledge_base_id: int
    uploaded_by: int
    created_at: datetime
    processed_at: Optional[datetime]
    chunk_count: int
    processing_logs: List[str]
    error_message: Optional[str]

    class Config:
        from_attributes = True


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None