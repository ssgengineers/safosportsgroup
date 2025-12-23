"""
NIL Platform AI Service

FastAPI service for AI/ML features:
- Profile scoring and ranking
- Brand-athlete matchmaking
- Content recommendations
- Social analytics insights

This service complements the main Spring Boot API and is designed
for compute-intensive AI/ML tasks.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.routers import health, scoring, matching


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    yield
    # Shutdown
    print("👋 Shutting down AI Service")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI/ML service for NIL Platform - handles scoring, matching, and recommendations",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",  # Spring Boot backend
        "https://safosportsgroup.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.api_prefix, tags=["Health"])
app.include_router(scoring.router, prefix=settings.api_prefix, tags=["Scoring"])
app.include_router(matching.router, prefix=settings.api_prefix, tags=["Matching"])


@app.get("/")
async def root():
    """Root endpoint - service information."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )

