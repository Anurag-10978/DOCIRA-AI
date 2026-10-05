import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    global_exception_handler,
)
from app.core.middleware import RequestLoggingMiddleware, RateLimitMiddleware
from app.api import (
    auth, knowledge_bases, documents, system,
    chat, search, analytics, ai_features,
    export_api, settings_api,
)

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("DOCIRA-A")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup + shutdown events."""
    logger.info("🛑 DOCIRA-AI shutting down...")

    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    logger.info("✅ Database tables ready")
    logger.info(f"✅ Upload directory: {settings.UPLOAD_DIR}")
    logger.info(f"✅ LLM: {settings.LLM_MODEL}")

    yield

    logger.info("👋 DOCIRA-AI shutting down...")

app = FastAPI(
    title="DOCIRA-AI",
    description="Enterprise Document Intelligence Platform — LangChain + LangGraph + Ollama",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware (order matters) ─────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)
app.add_middleware(RequestLoggingMiddleware)


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ── Exception handlers ─────────────────────────────────────────────────────────
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# ── Static files ───────────────────────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(knowledge_bases.router)
app.include_router(documents.router)
app.include_router(system.router)
app.include_router(chat.router)
app.include_router(search.router)
app.include_router(analytics.router)
app.include_router(ai_features.router)
app.include_router(export_api.router)
app.include_router(settings_api.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "name": "DOCIRA-AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Root"])
def health():
    return {"status": "healthy", "service": "DOCIRA-AI"}
