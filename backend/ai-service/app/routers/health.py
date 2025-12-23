"""Health check endpoints for the AI Service."""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "ai-service",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check - verifies service is ready to accept traffic."""
    # TODO: Add checks for:
    # - Database connectivity
    # - Main API connectivity
    # - AI model loading status
    return {
        "ready": True,
        "checks": {
            "service": "ok",
            "database": "not_configured",
            "main_api": "not_configured",
        }
    }

