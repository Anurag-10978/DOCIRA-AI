import httpx
import psutil
from fastapi import APIRouter, Depends
from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User
from app.ai.vector_store import vector_store

router = APIRouter(prefix="/api/system", tags=["System"])


@router.get("/health")
async def health_check(user: User = Depends(get_current_user)):
    services = {}

    # Ollama
        # Groq
    try:
        async with httpx.AsyncClient(
            timeout=10,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}"
            },
        ) as client:

            r = await client.get("https://api.groq.com/openai/v1/models")

            if r.status_code == 200:
                models = [m["id"] for m in r.json().get("data", [])]

                services["groq"] = {
                    "status": "up",
                    "models": models,
                    "latency_ms": r.elapsed.microseconds // 1000,
                }
            else:
                services["groq"] = {
                    "status": "down",
                    "error": r.text,
                    "models": [],
                }

    except Exception as e:
        services["groq"] = {
            "status": "down",
            "error": str(e),
            "models": [],
        }

    # Qdrant
    try:
        collections = vector_store.qdrant_client.get_collections().collections
        col_stats = []
        for col in collections:
            count = vector_store.count_points(col.name)
            col_stats.append({"name": col.name, "vectors": count})
        services["qdrant"] = {"status": "up", "collections": col_stats}
    except Exception as e:
        services["qdrant"] = {"status": "down", "error": str(e), "collections": []}

    # System resources
    cpu = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    overall = "healthy" if all(s["status"] == "up" for s in services.values()) else "degraded"

    return {
        "status": overall,
        "services": services,
        "system": {
            "cpu_percent": cpu,
            "memory_used_gb": round(mem.used / (1024 ** 3), 2),
            "memory_total_gb": round(mem.total / (1024 ** 3), 2),
            "memory_percent": mem.percent,
            "disk_used_gb": round(disk.used / (1024 ** 3), 2),
            "disk_total_gb": round(disk.total / (1024 ** 3), 2),
            "disk_percent": disk.percent,
        },
    }