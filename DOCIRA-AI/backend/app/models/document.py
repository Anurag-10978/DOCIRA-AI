from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, default=0)          # bytes
    file_type = Column(String, nullable=False)      # pdf, docx, txt, md
    num_pages = Column(Integer, default=0)
    tags = Column(JSON, default=[])
    category = Column(String, nullable=True)
    status = Column(String, default="pending")      # pending|processing|completed|failed
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_bases.id", ondelete="CASCADE"))
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)
    vector_ids = Column(JSON, default=[])
    chunk_count = Column(Integer, default=0)
    processing_logs = Column(JSON, default=[])
    error_message = Column(Text, nullable=True)

    # Relationships
    knowledge_base = relationship("KnowledgeBase", back_populates="documents")
    uploader = relationship("User")