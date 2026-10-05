import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger("DOCIRA-AI")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response: Response = await call_next(request)
        duration_ms = int((time.time() - start) * 1000)

        logger.info(
            f"{request.method} {request.url.path} "
            f"→ {response.status_code} [{duration_ms}ms]"
        )
        response.headers["X-Response-Time"] = f"{duration_ms}ms"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiter.
    100 requests per minute per IP.
    AI endpoints: 20 per minute (they're expensive).
    """

    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.rpm = requests_per_minute
        self.ai_rpm = 20
        self._counts: dict = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        if request.client and request.client.host == "testclient":
            return await call_next(request)
        ip = request.client.host if request.client else "unknown"
        now = datetime.utcnow()
        window = now - timedelta(minutes=1)

        # Determine limit
        is_ai = any(
            p in request.url.path
            for p in ["/api/chat", "/api/ai/", "/api/search/semantic"]
        )
        limit = self.ai_rpm if is_ai else self.rpm

        # Clean old timestamps
        self._counts[ip] = [t for t in self._counts[ip] if t > window]

        if len(self._counts[ip]) >= limit:
            return Response(
                content='{"error":true,"message":"Rate limit exceeded. Please slow down."}',
                status_code=429,
                media_type="application/json",
                headers={"Retry-After": "60"},
            )

        self._counts[ip].append(now)
        return await call_next(request)