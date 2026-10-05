from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    knowledge_base_id: int


class ConversationOut(BaseModel):
    id: int
    title: str
    knowledge_base_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True


class CitationOut(BaseModel):
    document_id: int
    document_title: str
    filename: str
    page: int
    snippet: str
    similarity_score: float


class AIMetadataOut(BaseModel):
    model: str
    task_type: str
    chunks_retrieved: int
    tokens_used: int
    latency_ms: int
    embedding_model: str


class MessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    citations: List[CitationOut] = []
    ai_metadata: Optional[AIMetadataOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SendMessageRequest(BaseModel):
    content: str
    document_ids: Optional[List[int]] = None
    task_type: Optional[str] = None