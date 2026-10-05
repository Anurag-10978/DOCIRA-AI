import os
import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
import asyncio
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.document import DocumentOut, DocumentUpdate
from app.services.document_service import (
    upload_document, list_documents, get_document,
    update_document, delete_document, trigger_reprocess,
)

router = APIRouter(prefix="/api/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload(
    file: UploadFile = File(...),
    knowledge_base_id: int = Form(...),
    title: Optional[str] = Form(None),
    tags: Optional[str] = Form("[]"),        # JSON string from form
    category: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tags_list = json.loads(tags) if tags else []
    return await upload_document(db, file, knowledge_base_id, user.id, title, tags_list, category)


@router.get("/", response_model=list[DocumentOut])
def list_docs(
    kb_id: int = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return list_documents(db, kb_id, user.id)


@router.get("/{doc_id}", response_model=DocumentOut)
def get_one(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_document(db, doc_id, user.id)


@router.put("/{doc_id}", response_model=DocumentOut)
def update(
    doc_id: int,
    payload: DocumentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return update_document(db, doc_id, user.id, payload.title, payload.tags, payload.category)


@router.delete("/{doc_id}", status_code=204)
def delete(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    delete_document(db, doc_id, user.id)


@router.post("/{doc_id}/reprocess", response_model=DocumentOut)
async def reprocess(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await trigger_reprocess(db, doc_id, user.id)


@router.get("/{doc_id}/preview")
def preview(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Stream the raw file for in-browser preview."""
    from app.services.document_service import _get_or_404
    doc = _get_or_404(db, doc_id, user.id)

    if not os.path.exists(doc.file_path):
        from fastapi import HTTPException
        raise HTTPException(404, "File not found on disk")

    media_types = {
        "pdf": "application/pdf",
        "txt": "text/plain",
        "md":  "text/plain",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    media_type = media_types.get(doc.file_type, "application/octet-stream")

    return FileResponse(
        doc.file_path,
        media_type=media_type,
        filename=doc.filename,
    )


@router.get("/{doc_id}/logs")
def get_logs(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.services.document_service import _get_or_404
    doc = _get_or_404(db, doc_id, user.id)
    return {
        "doc_id": doc_id,
        "status": doc.status,
        "logs": doc.processing_logs,
        "chunk_count": doc.chunk_count,
        "processed_at": doc.processed_at,
        "error_message": doc.error_message,
    }