import time
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.models.knowledge_base import KnowledgeBase
from app.models.analytics import QueryLog
from app.schemas.chat import (
    ConversationCreate, ConversationOut,
    MessageOut, SendMessageRequest,
    CitationOut, AIMetadataOut,
)
from app.ai.langgraph_agent import run_agent

router = APIRouter(prefix="/api/chat", tags=["Chat"])


# ── Conversations ──────────────────────────────────────────────────────────────

@router.post("/", response_model=ConversationOut, status_code=201)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    kb = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == payload.knowledge_base_id,
        KnowledgeBase.owner_id == user.id,
    ).first()
    if not kb:
        raise HTTPException(404, "Knowledge base not found")

    conv = Conversation(
        title=payload.title or "New Conversation",
        knowledge_base_id=payload.knowledge_base_id,
        user_id=user.id,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return _conv_to_out(db, conv)


@router.get("/", response_model=List[ConversationOut])
def list_conversations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [_conv_to_out(db, c) for c in convs]

@router.get("/{conv_id}", response_model=ConversationOut)
def get_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conv = _get_conv_or_404(db, conv_id, user.id)
    return _conv_to_out(db, conv)


@router.delete("/{conv_id}", status_code=204)
def delete_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conv = _get_conv_or_404(db, conv_id, user.id)
    db.delete(conv)
    db.commit()


@router.get("/{conv_id}/messages", response_model=List[MessageOut])
def get_messages(
    conv_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conv = _get_conv_or_404(db, conv_id, user.id)
    return [_msg_to_out(m) for m in conv.messages]


# ── Send Message (runs full LangGraph pipeline) ────────────────────────────────

@router.post("/{conv_id}/message", response_model=MessageOut)
async def send_message(
    conv_id: int,
    payload: SendMessageRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conv = _get_conv_or_404(db, conv_id, user.id)

    # Save user message
    user_msg = Message(
        conversation_id=conv_id,
        role="user",
        content=payload.content,
        citations=[],
        ai_metadata={},
    )
    db.add(user_msg)

    # Auto-title from first message (like ChatGPT)
    msg_count = db.query(func.count(Message.id)).filter(
        Message.conversation_id == conv_id
    ).scalar() or 0
    if msg_count == 0:
        conv.title = payload.content[:60] + ("..." if len(payload.content) > 60 else "")

    db.commit()

    # ── Run LangGraph agent ────────────────────────────────────────────────
    # Flow: classify → retrieve (LangChain vectorstore) → [qa|summarize|compare|extract]
    #       Each task node: LangChain ChatPromptTemplate | ChatOllama | StrOutputParser
    start = time.time()
    try:
        result = await run_agent(
            query=payload.content,
            knowledge_base_id=conv.knowledge_base_id,
            document_ids=payload.document_ids,
            forced_task_type=payload.task_type,
        )
    except Exception as e:
        result = {
            "response":  f"Processing error: {str(e)}",
            "task_type": "qa",
            "citations": [],
            "metadata": {
                "model": "llama3.2", "task_type": "qa",
                "chunks_retrieved": 0, "tokens_used": 0,
                "latency_ms": int((time.time() - start) * 1000),
                "embedding_model": "nomic-embed-text",
            },
        }

    # Save AI message
    ai_msg = Message(
        conversation_id=conv_id,
        role="assistant",
        content=result["response"],
        citations=[c.model_dump() for c in result["citations"]],
        ai_metadata=result["metadata"],
    )
    db.add(ai_msg)

    # Update conversation timestamp
    from datetime import datetime
    conv.updated_at = datetime.utcnow()

    # Log to analytics
    log = QueryLog(
        user_id=user.id,
        knowledge_base_id=conv.knowledge_base_id,
        query_text=payload.content[:500],
        task_type=result["metadata"]["task_type"],
        response_time_ms=result["metadata"]["latency_ms"],
        tokens_used=result["metadata"]["tokens_used"],
    )
    db.add(log)
    db.commit()
    db.refresh(ai_msg)

    return _msg_to_out(ai_msg)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_conv_or_404(db, conv_id, user_id):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user_id,
    ).first()
    if not conv:
        raise HTTPException(404, "Conversation not found")
    return conv


def _conv_to_out(db, conv) -> ConversationOut:
    msg_count = db.query(func.count(Message.id)).filter(
        Message.conversation_id == conv.id
    ).scalar() or 0
    last = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.desc())
        .first()
    )
    out = ConversationOut.model_validate(conv)
    out.message_count = msg_count
    out.last_message = (last.content[:80] + "...") if last and len(last.content) > 80 else (last.content if last else None)
    return out


def _msg_to_out(msg: Message) -> MessageOut:
    citations = [CitationOut(**c) for c in (msg.citations or [])]
    metadata = AIMetadataOut(**msg.ai_metadata) if msg.ai_metadata and msg.role == "assistant" and msg.ai_metadata.get("model") else None
    out = MessageOut.model_validate(msg)
    out.citations = citations
    out.ai_metadata = metadata
    return out