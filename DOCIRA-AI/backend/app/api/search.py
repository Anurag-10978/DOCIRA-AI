import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.analytics import QueryLog
from app.ai.rag_engine import rag_engine   # uses LangChain vectorstore internally
from app.schemas.search import (
    SemanticSearchRequest, SemanticSearchResponse,
    SearchResultOut, SearchHistoryOut,
)

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("/semantic", response_model=SemanticSearchResponse)
async def semantic_search(
    payload: SemanticSearchRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    start = time.time()

    # LangChain vectorstore handles embed_query + cosine search
    results = await rag_engine.semantic_search(
        query=payload.query,
        knowledge_base_id=payload.knowledge_base_id,
        limit=payload.limit,
        document_ids=payload.document_ids,
    )
    # results = List of (LangChain Document, float score)

    latency_ms = int((time.time() - start) * 1000)

    search_results = []
    for lc_doc, score in results:
        meta = lc_doc.metadata
        search_results.append(SearchResultOut(
            document_id=meta.get("document_id", 0),
            document_title=meta.get("title", "Unknown"),
            filename=meta.get("filename", ""),
            file_type=meta.get("file_type", ""),
            page=meta.get("page", 1),
            snippet=lc_doc.page_content[:300] + "..." if len(lc_doc.page_content) > 300 else lc_doc.page_content,
            similarity_score=round(float(score), 4),
        ))

    # Log search
    log = QueryLog(
        user_id=user.id,
        knowledge_base_id=payload.knowledge_base_id,
        query_text=payload.query[:500],
        task_type="search",
        response_time_ms=latency_ms,
        tokens_used=0,
    )
    db.add(log)
    db.commit()

    return SemanticSearchResponse(
        query=payload.query,
        results=search_results,
        total=len(search_results),
        latency_ms=latency_ms,
    )


@router.get("/history", response_model=List[SearchHistoryOut])
def search_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    logs = (
        db.query(QueryLog)
        .filter(QueryLog.user_id == user.id)
        .order_by(QueryLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [SearchHistoryOut.model_validate(l) for l in logs]


@router.get("/frequent")
def frequent_searches(
    limit: int = 10,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    results = (
        db.query(QueryLog.query_text, func.count(QueryLog.id).label("count"))
        .filter(QueryLog.user_id == user.id)
        .group_by(QueryLog.query_text)
        .order_by(func.count(QueryLog.id).desc())
        .limit(limit)
        .all()
    )
    return [{"query": r.query_text, "count": r.count} for r in results]