from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.export_service import (
    export_chat_markdown, export_chat_txt,
    export_summary_markdown, export_extraction_json, export_extraction_csv,
)

router = APIRouter(prefix="/api/export", tags=["Export"])


class SummaryExportRequest(BaseModel):
    content: str
    doc_title: str
    format: str = "md"   # md | txt


class ExtractionExportRequest(BaseModel):
    content: str
    doc_title: str
    format: str = "json"  # json | csv


@router.get("/chat/{conv_id}")
def export_chat(
    conv_id: int,
    format: str = Query("md", regex="^(md|txt)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if format == "md":
        content = export_chat_markdown(db, conv_id, user.id)
        media_type = "text/markdown"
        filename = f"conversation_{conv_id}.md"
    else:
        content = export_chat_txt(db, conv_id, user.id)
        media_type = "text/plain"
        filename = f"conversation_{conv_id}.txt"

    if not content:
        raise HTTPException(404, "Conversation not found")

    return Response(
        content=content.encode("utf-8"),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/summary")
def export_summary(payload: SummaryExportRequest, user: User = Depends(get_current_user)):
    content = export_summary_markdown(
        title=f"Summary — {payload.doc_title}",
        content=payload.content,
        doc_title=payload.doc_title,
    )
    filename = f"summary_{payload.doc_title[:30].replace(' ', '_')}.md"
    return Response(
        content=content.encode("utf-8"),
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/extraction")
def export_extraction(payload: ExtractionExportRequest, user: User = Depends(get_current_user)):
    if payload.format == "csv":
        content = export_extraction_csv(payload.content)
        media_type = "text/csv"
        filename = f"extraction_{payload.doc_title[:30].replace(' ', '_')}.csv"
    else:
        content = export_extraction_json(payload.content, payload.doc_title)
        media_type = "application/json"
        filename = f"extraction_{payload.doc_title[:30].replace(' ', '_')}.json"

    return Response(
        content=content.encode("utf-8"),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )