from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class KnowledgeBaseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None   # HR | Legal | Finance | Engineering | Sales
    icon: Optional[str] = "folder"
    color: Optional[str] = "#6366f1"


class KnowledgeBaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class KnowledgeBaseOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    icon: str
    color: str
    owner_id: int
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    total_chunks: int = 0

    class Config:
        from_attributes = True