from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.knowledge_base import KnowledgeBase
from app.models.document import Document
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseUpdate, KnowledgeBaseOut
from app.ai.vector_store import vector_store


def create_kb(db: Session, payload: KnowledgeBaseCreate, user_id: int) -> KnowledgeBaseOut:
    # Check name uniqueness per user
    exists = db.query(KnowledgeBase).filter(
        KnowledgeBase.owner_id == user_id,
        KnowledgeBase.name == payload.name,
    ).first()
    if exists:
        raise HTTPException(400, "A knowledge base with this name already exists")

    kb = KnowledgeBase(**payload.model_dump(), owner_id=user_id)
    db.add(kb)
    db.commit()
    db.refresh(kb)
    return _to_out(db, kb)


def list_kbs(db: Session, user_id: int) -> list[KnowledgeBaseOut]:
    kbs = db.query(KnowledgeBase).filter(KnowledgeBase.owner_id == user_id).all()
    return [_to_out(db, kb) for kb in kbs]


def get_kb(db: Session, kb_id: int, user_id: int) -> KnowledgeBaseOut:
    kb = _get_or_404(db, kb_id, user_id)
    return _to_out(db, kb)


def update_kb(db: Session, kb_id: int, user_id: int, payload: KnowledgeBaseUpdate) -> KnowledgeBaseOut:
    kb = _get_or_404(db, kb_id, user_id)
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(kb, k, v)
    db.commit()
    db.refresh(kb)
    return _to_out(db, kb)


def delete_kb(db: Session, kb_id: int, user_id: int):
    kb = _get_or_404(db, kb_id, user_id)
    # Delete Qdrant collection
    vector_store.delete_collection(f"kb_{kb_id}")
    db.delete(kb)
    db.commit()


def _get_or_404(db: Session, kb_id: int, user_id: int) -> KnowledgeBase:
    kb = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == kb_id,
        KnowledgeBase.owner_id == user_id,
    ).first()
    if not kb:
        raise HTTPException(404, "Knowledge base not found")
    return kb


def _to_out(db: Session, kb: KnowledgeBase) -> KnowledgeBaseOut:
    doc_count = db.query(func.count(Document.id)).filter(
        Document.knowledge_base_id == kb.id
    ).scalar() or 0

    chunk_total = db.query(func.sum(Document.chunk_count)).filter(
        Document.knowledge_base_id == kb.id,
        Document.status == "completed",
    ).scalar() or 0

    out = KnowledgeBaseOut.model_validate(kb)
    out.document_count = doc_count
    out.total_chunks = chunk_total
    return out