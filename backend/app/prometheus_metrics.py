"""Prometheus metrics setup for monitoring"""

from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

# Define metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

UPLOAD_COUNT = Counter(
    'file_uploads_total',
    'Total file uploads',
    ['file_type', 'status']
)

AI_GENERATION_DURATION = Histogram(
    'ai_generation_duration_seconds',
    'AI content generation duration'
)

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        duration = time.time() - start_time
        endpoint = request.url.path
        method = request.method
        status_code = response.status_code

        REQUEST_COUNT.labels(
            method=method,
            endpoint=endpoint,
            status_code=status_code
        ).inc()

        REQUEST_DURATION.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)

        return response

def setup_metrics(app):
    """Add metrics endpoint and middleware to FastAPI app"""

    app.add_middleware(MetricsMiddleware)

    @app.get("/metrics")
    async def metrics():
        return Response(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST
        )
