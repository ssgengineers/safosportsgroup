"""Configuration settings for the AI Service."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App settings
    app_name: str = "NIL Platform AI Service"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # API settings
    api_prefix: str = "/api/v1"
    
    # Database (connects to same RDS as Spring Boot)
    database_url: str = ""
    
    # Main API connection (Spring Boot backend)
    main_api_url: str = "http://localhost:8080"
    
    # OpenAI (for future AI features)
    openai_api_key: str = ""
    
    # Clerk (for JWT validation if needed)
    clerk_issuer: str = ""
    clerk_jwks_url: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

