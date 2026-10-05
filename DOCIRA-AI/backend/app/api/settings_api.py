import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.settings import AISettings, AISettingsUpdate, ModelPullRequest, AvailableModels

router = APIRouter(prefix="/api/settings", tags=["Settings"])

# In-memory settings store (replace with DB table on Day 5 if needed)
_ai_settings = {
    "llm_model": settings.LLM_MODEL,
    "embedding_model": settings.EMBEDDING_MODEL,
    "chunk_size": settings.CHUNK_SIZE,
    "chunk_overlap": settings.CHUNK_OVERLAP,
    "temperature": 0.1,
    "max_context_chunks": settings.MAX_CONTEXT_CHUNKS,
}


@router.get("/ai", response_model=AISettings)
def get_ai_settings(user: User = Depends(get_current_user)):
    return AISettings(**_ai_settings)


@router.put("/ai", response_model=AISettings)
def update_ai_settings(
    payload: AISettingsUpdate,
    user: User = Depends(get_current_user),
):
    for k, v in payload.model_dump(exclude_none=True).items():
        _ai_settings[k] = v
    return AISettings(**_ai_settings)


@router.get("/models", response_model=AvailableModels)
async def list_models(user: User = Depends(get_current_user)):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            models = [m["name"] for m in resp.json().get("models", [])]
    except Exception:
        models = [settings.LLM_MODEL, settings.EMBEDDING_MODEL]
    return AvailableModels(models=models)


@router.post("/pull-model")
async def pull_model(
    payload: ModelPullRequest,
    user: User = Depends(get_current_user),
):
    """Trigger Ollama to pull a new model."""
    try:
        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(
                f"{settings.OLLAMA_URL}/api/pull",
                json={"name": payload.model_name, "stream": False},
            )
            return {"status": "pulled", "model": payload.model_name}
    except Exception as e:
        return {"status": "error", "error": str(e)}