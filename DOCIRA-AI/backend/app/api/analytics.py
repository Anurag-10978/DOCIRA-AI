from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.analytics_service import (
    get_overview, get_daily_queries, get_task_breakdown,
    get_document_status_stats, get_top_documents, get_storage_usage,
)
from app.schemas.analytics import (
    AnalyticsOverview, DailyQueryCount, TaskTypeBreakdown,
    DocumentStatusStat, TopDocument, StorageUsage,
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def overview(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_overview(db, user.id)


@router.get("/daily-queries", response_model=List[DailyQueryCount])
def daily_queries(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_daily_queries(db, user.id, days)


@router.get("/task-breakdown", response_model=List[TaskTypeBreakdown])
def task_breakdown(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_task_breakdown(db, user.id)


@router.get("/document-status", response_model=List[DocumentStatusStat])
def document_status(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_document_status_stats(db, user.id)


@router.get("/top-documents", response_model=List[TopDocument])
def top_documents(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_top_documents(db, user.id, limit)


@router.get("/storage", response_model=List[StorageUsage])
def storage_usage(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_storage_usage(db, user.id)