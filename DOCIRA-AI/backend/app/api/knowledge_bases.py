from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseUpdate, KnowledgeBaseOut
from app.services.knowledge_base_service import (
    create_kb, list_kbs, get_kb, update_kb, delete_kb
)

router = APIRouter(prefix="/api/knowledge-bases", tags=["Knowledge Bases"])


@router.post("/", response_model=KnowledgeBaseOut, status_code=201)
def create(
    payload: KnowledgeBaseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return create_kb(db, payload, user.id)


@router.get("/", response_model=list[KnowledgeBaseOut])
def list_all(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return list_kbs(db, user.id)


@router.get("/{kb_id}", response_model=KnowledgeBaseOut)
def get_one(
    kb_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_kb(db, kb_id, user.id)


@router.put("/{kb_id}", response_model=KnowledgeBaseOut)
def update(
    kb_id: int,
    payload: KnowledgeBaseUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return update_kb(db, kb_id, user.id, payload)


@router.delete("/{kb_id}", status_code=204)
def delete(
    kb_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    delete_kb(db, kb_id, user.id)