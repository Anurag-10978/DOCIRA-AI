from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.knowledge_base import KnowledgeBase
from app.ai.langgraph_agent import run_agent

router = APIRouter(prefix="/api/ai", tags=["AI Features"])


class SummarizeRequest(BaseModel):
    knowledge_base_id: int
    document_ids: List[int]
    summary_type: str = "detailed"   # short | detailed | executive | bullets


class CompareRequest(BaseModel):
    knowledge_base_id: int
    document_a_id: int
    document_b_id: int
    focus: Optional[str] = None      # optional comparison focus


class ExtractRequest(BaseModel):
    knowledge_base_id: int
    document_ids: List[int]
    extraction_type: str = "auto"    # contract | invoice | resume | auto


# ── Summarize ──────────────────────────────────────────────────────────────

@router.post("/summarize")
async def summarize(
    payload: SummarizeRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _verify_kb(db, payload.knowledge_base_id, user.id)

    type_prompts = {
        "short":     "Provide a SHORT 3-5 sentence summary of the key points.",
        "detailed":  "Provide a DETAILED structured summary with all important information.",
        "executive": "Provide an EXECUTIVE SUMMARY suitable for C-level presentation with key decisions and recommendations.",
        "bullets":   "Provide a BULLET POINT summary listing all key facts, dates, numbers, and conclusions.",
    }
    query = type_prompts.get(payload.summary_type, type_prompts["detailed"])

    result = await run_agent(
        query=query,
        knowledge_base_id=payload.knowledge_base_id,
        document_ids=payload.document_ids,
        forced_task_type="summarize",
    )

    # Get document titles for display
    doc_titles = []
    for doc_id in payload.document_ids:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc_titles.append(doc.title)

    return {
        "summary_type": payload.summary_type,
        "document_titles": doc_titles,
        "content": result["response"],
        "citations": [c.model_dump() for c in result["citations"]],
        "metadata": result["metadata"],
    }


# ── Compare ────────────────────────────────────────────────────────────────

@router.post("/compare")
async def compare(
    payload: CompareRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _verify_kb(db, payload.knowledge_base_id, user.id)

    doc_a = db.query(Document).filter(Document.id == payload.document_a_id).first()
    doc_b = db.query(Document).filter(Document.id == payload.document_b_id).first()
    if not doc_a or not doc_b:
        raise HTTPException(404, "One or both documents not found")

    query = payload.focus or f"Compare {doc_a.title} and {doc_b.title} in detail"

    result = await run_agent(
        query=query,
        knowledge_base_id=payload.knowledge_base_id,
        document_ids=[payload.document_a_id, payload.document_b_id],
        forced_task_type="compare",
    )

    return {
        "doc_a": {"id": doc_a.id, "title": doc_a.title, "filename": doc_a.filename},
        "doc_b": {"id": doc_b.id, "title": doc_b.title, "filename": doc_b.filename},
        "content": result["response"],
        "citations": [c.model_dump() for c in result["citations"]],
        "metadata": result["metadata"],
    }


# ── Extract ────────────────────────────────────────────────────────────────

@router.post("/extract")
async def extract(
    payload: ExtractRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _verify_kb(db, payload.knowledge_base_id, user.id)

    type_queries = {
        "contract": "Extract: parties involved, effective date, termination date, payment terms, penalty clauses, governing law, key obligations",
        "invoice":  "Extract: invoice number, vendor name, client name, invoice date, due date, line items, subtotal, tax, total amount",
        "resume":   "Extract: candidate name, email, phone, skills, work experience (company, role, duration), education, certifications",
        "auto":     "Extract all structured information: names, dates, amounts, terms, obligations, and any other key fields",
    }
    query = type_queries.get(payload.extraction_type, type_queries["auto"])

    result = await run_agent(
        query=query,
        knowledge_base_id=payload.knowledge_base_id,
        document_ids=payload.document_ids,
        forced_task_type="extract",
    )

    return {
        "extraction_type": payload.extraction_type,
        "content": result["response"],
        "citations": [c.model_dump() for c in result["citations"]],
        "metadata": result["metadata"],
    }


def _verify_kb(db, kb_id, user_id):
    kb = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == kb_id,
        KnowledgeBase.owner_id == user_id,
    ).first()
    if not kb:
        raise HTTPException(404, "Knowledge base not found")