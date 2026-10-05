import os
import asyncio
import uuid
from datetime import datetime
from fastapi import HTTPException, UploadFile

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.models.document import Document
from app.models.knowledge_base import KnowledgeBase
from app.schemas.document import DocumentOut
from app.ai.vector_store import vector_store
from app.ai.pipeline import process_document, reprocess_document

ALLOWED_TYPES = {"pdf", "docx", "txt", "md"}
MAX_FILE_SIZE = 200 * 1024 * 1024  # 200 MB


async def upload_document(
    db: Session,
    file: UploadFile,
    knowledge_base_id: int,
    user_id: int,
    title: str,
    tags: list[str],
    category: str | None,
) -> DocumentOut:
    # Validate KB ownership
    kb = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == knowledge_base_id,
        KnowledgeBase.owner_id == user_id,
    ).first()
    if not kb:
        raise HTTPException(404, "Knowledge base not found")

    # Validate file type
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_TYPES:
        raise HTTPException(400, f"File type '{ext}' not supported. Allowed: {', '.join(ALLOWED_TYPES)}")

    # Stream to disk while enforcing the 200 MB limit.
    # This avoids loading a large upload entirely into RAM.
    kb_dir = os.path.join(settings.UPLOAD_DIR, str(knowledge_base_id))
    os.makedirs(kb_dir, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
    safe_name = f"{timestamp}_{uuid.uuid4().hex[:8]}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(kb_dir, safe_name)

    total_size = 0
    try:
        with open(file_path, "wb") as f:
            while True:
                chunk = await file.read(1024 * 1024)  # 1 MB chunks
                if not chunk:
                    break
                total_size += len(chunk)
                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(400, "File too large. Maximum size is 200 MB.")
                f.write(chunk)
    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

    # Create DB record
    doc = Document(
        title=title or file.filename.rsplit(".", 1)[0],
        filename=file.filename,
        file_path=file_path,
        file_size=total_size,
        file_type=ext,
        tags=tags or [],
        category=category,
        status="pending",
        knowledge_base_id=knowledge_base_id,
        uploaded_by=user_id,
        processing_logs=[f"[{datetime.utcnow().strftime('%H:%M:%S')}] 📥 Document received, queued for processing..."],
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Kick off background pipeline (non-blocking)
    asyncio.create_task(process_document(doc.id))

    return DocumentOut.model_validate(doc)


def list_documents(db: Session, kb_id: int, user_id: int) -> list[DocumentOut]:
    # Verify KB ownership
    kb = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == kb_id,
        KnowledgeBase.owner_id == user_id,
    ).first()
    if not kb:
        raise HTTPException(404, "Knowledge base not found")

    docs = db.query(Document).filter(Document.knowledge_base_id == kb_id).all()
    return [DocumentOut.model_validate(d) for d in docs]


def get_document(db: Session, doc_id: int, user_id: int) -> DocumentOut:
    doc = _get_or_404(db, doc_id, user_id)
    return DocumentOut.model_validate(doc)


def update_document(db: Session, doc_id: int, user_id: int, title=None, tags=None, category=None) -> DocumentOut:
    doc = _get_or_404(db, doc_id, user_id)
    if title is not None:
        doc.title = title
    if tags is not None:
        doc.tags = tags
    if category is not None:
        doc.category = category
    db.commit()
    db.refresh(doc)
    return DocumentOut.model_validate(doc)


def delete_document(db: Session, doc_id: int, user_id: int):
    doc = _get_or_404(db, doc_id, user_id)

    # 1. Remove vectors from Qdrant
    vector_store.delete_by_document(f"kb_{doc.knowledge_base_id}", doc_id)

    # 2. Remove file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    # 3. Remove DB record
    db.delete(doc)
    db.commit()


async def trigger_reprocess(db: Session, doc_id: int, user_id: int) -> DocumentOut:
    doc = _get_or_404(db, doc_id, user_id)
    asyncio.create_task(reprocess_document(doc.id))
    db.refresh(doc)
    return DocumentOut.model_validate(doc)


def _get_or_404(db: Session, doc_id: int, user_id: int) -> Document:
    doc = db.query(Document).join(KnowledgeBase).filter(
        Document.id == doc_id,
        KnowledgeBase.owner_id == user_id,
    ).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc