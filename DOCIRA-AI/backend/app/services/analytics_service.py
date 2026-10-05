from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, timedelta
from typing import List

from app.models.analytics import QueryLog
from app.models.document import Document
from app.models.knowledge_base import KnowledgeBase
from app.schemas.analytics import (
    AnalyticsOverview, DailyQueryCount, TaskTypeBreakdown,
    DocumentStatusStat, TopDocument, StorageUsage,
)
import os


def get_overview(db: Session, user_id: int) -> AnalyticsOverview:
    today = datetime.utcnow().date()
    week_ago = datetime.utcnow() - timedelta(days=7)

    # Knowledge bases
    total_kbs = db.query(func.count(KnowledgeBase.id)).filter(
        KnowledgeBase.owner_id == user_id
    ).scalar() or 0

    # Documents
    docs_query = db.query(Document).join(KnowledgeBase).filter(
        KnowledgeBase.owner_id == user_id
    )
    total_docs = docs_query.count()
    completed  = docs_query.filter(Document.status == "completed").count()
    failed     = docs_query.filter(Document.status == "failed").count()

    # Storage
    total_bytes = db.query(func.sum(Document.file_size)).join(KnowledgeBase).filter(
        KnowledgeBase.owner_id == user_id
    ).scalar() or 0
    storage_mb = round(total_bytes / (1024 * 1024), 2)

    # Queries
    total_queries = db.query(func.count(QueryLog.id)).filter(
        QueryLog.user_id == user_id
    ).scalar() or 0

    queries_today = db.query(func.count(QueryLog.id)).filter(
        QueryLog.user_id == user_id,
        func.date(QueryLog.created_at) == today,
    ).scalar() or 0

    queries_week = db.query(func.count(QueryLog.id)).filter(
        QueryLog.user_id == user_id,
        QueryLog.created_at >= week_ago,
    ).scalar() or 0

    total_tokens = db.query(func.sum(QueryLog.tokens_used)).filter(
        QueryLog.user_id == user_id
    ).scalar() or 0

    avg_response = db.query(func.avg(QueryLog.response_time_ms)).filter(
        QueryLog.user_id == user_id
    ).scalar() or 0

    return AnalyticsOverview(
        total_documents=total_docs,
        total_knowledge_bases=total_kbs,
        total_queries=total_queries,
        total_tokens_used=int(total_tokens),
        avg_response_time_ms=int(avg_response),
        storage_used_mb=storage_mb,
        completed_documents=completed,
        failed_documents=failed,
        queries_today=queries_today,
        queries_this_week=queries_week,
    )


def get_daily_queries(db: Session, user_id: int, days: int = 30) -> List[DailyQueryCount]:
    start = datetime.utcnow() - timedelta(days=days)

    rows = db.query(
        func.date(QueryLog.created_at).label("date"),
        QueryLog.task_type,
        func.count(QueryLog.id).label("count"),
    ).filter(
        QueryLog.user_id == user_id,
        QueryLog.created_at >= start,
    ).group_by(
        func.date(QueryLog.created_at),
        QueryLog.task_type,
    ).all()

    # Build date → task_type → count map
    date_map: dict = {}
    for row in rows:
        d = str(row.date)
        if d not in date_map:
            date_map[d] = {"date": d, "count": 0, "qa": 0, "summarize": 0,
                           "compare": 0, "extract": 0, "search": 0}
        date_map[d][row.task_type] = date_map[d].get(row.task_type, 0) + row.count
        date_map[d]["count"] += row.count

    # Fill missing dates with zeros
    result = []
    for i in range(days):
        d = str((datetime.utcnow() - timedelta(days=days - 1 - i)).date())
        result.append(DailyQueryCount(**date_map.get(d, {
            "date": d, "count": 0, "qa": 0, "summarize": 0,
            "compare": 0, "extract": 0, "search": 0,
        })))
    return result


def get_task_breakdown(db: Session, user_id: int) -> List[TaskTypeBreakdown]:
    rows = db.query(
        QueryLog.task_type,
        func.count(QueryLog.id).label("count"),
    ).filter(
        QueryLog.user_id == user_id
    ).group_by(QueryLog.task_type).all()

    total = sum(r.count for r in rows) or 1
    return [
        TaskTypeBreakdown(
            task_type=r.task_type,
            count=r.count,
            percentage=round(r.count / total * 100, 1),
        )
        for r in rows
    ]


def get_document_status_stats(db: Session, user_id: int) -> List[DocumentStatusStat]:
    kbs = db.query(KnowledgeBase).filter(KnowledgeBase.owner_id == user_id).all()
    result = []
    for kb in kbs:
        docs = db.query(Document).filter(Document.knowledge_base_id == kb.id)
        result.append(DocumentStatusStat(
            knowledge_base=kb.name,
            completed=docs.filter(Document.status == "completed").count(),
            processing=docs.filter(Document.status == "processing").count(),
            failed=docs.filter(Document.status == "failed").count(),
            pending=docs.filter(Document.status == "pending").count(),
        ))
    return result


def get_top_documents(db: Session, user_id: int, limit: int = 10) -> List[TopDocument]:
    rows = db.query(
        QueryLog.knowledge_base_id,
        func.count(QueryLog.id).label("query_count"),
    ).filter(
        QueryLog.user_id == user_id,
        QueryLog.knowledge_base_id.isnot(None),
    ).group_by(QueryLog.knowledge_base_id).order_by(
        func.count(QueryLog.id).desc()
    ).limit(limit).all()

    result = []
    for row in rows:
        kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == row.knowledge_base_id).first()
        if not kb:
            continue
        docs = db.query(Document).filter(
            Document.knowledge_base_id == row.knowledge_base_id,
            Document.status == "completed",
        ).first()
        if docs:
            result.append(TopDocument(
                document_id=docs.id,
                title=docs.title,
                filename=docs.filename,
                knowledge_base=kb.name,
                query_count=row.query_count,
                chunk_count=docs.chunk_count,
            ))
    return result


def get_storage_usage(db: Session, user_id: int) -> List[StorageUsage]:
    kbs = db.query(KnowledgeBase).filter(KnowledgeBase.owner_id == user_id).all()
    result = []
    for kb in kbs:
        docs = db.query(Document).filter(Document.knowledge_base_id == kb.id).all()
        total_bytes = sum(d.file_size for d in docs)
        total_chunks = sum(d.chunk_count for d in docs)
        result.append(StorageUsage(
            knowledge_base_id=kb.id,
            knowledge_base_name=kb.name,
            document_count=len(docs),
            total_size_mb=round(total_bytes / (1024 * 1024), 2),
            chunk_count=total_chunks,
        ))
    return result