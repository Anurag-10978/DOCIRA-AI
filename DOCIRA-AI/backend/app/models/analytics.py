from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    knowledge_base_id = Column(Integer, nullable=True)
    query_text = Column(String, nullable=False)
    task_type = Column(String, default="qa")       # search|qa|summarize|compare|extract
    response_time_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="query_logs")