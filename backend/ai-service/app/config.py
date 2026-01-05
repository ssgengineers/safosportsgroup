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
    
    # Anthropic Claude API
    anthropic_api_key: str = ""
    claude_model: str = "claude-3-5-sonnet-20241022"
    claude_max_tokens: int = 2000
    
    # College Football Data API
    cfbd_api_key: str = ""
    
    # Rule Engine Settings (weights for scoring - must sum to 100)
    rule_weight_sport_match: int = 25       # Points for sport alignment
    rule_weight_follower_reach: int = 25    # Points for social media reach
    rule_weight_engagement: int = 20        # Points for engagement quality
    rule_weight_interest_tags: int = 15     # Points for interest/industry match
    rule_weight_geographic: int = 15        # Points for location/conference fit
    
    # Hybrid matching settings
    rule_engine_top_n: int = 20             # Number of candidates to send to Claude
    rule_score_weight: float = 0.4          # Weight for rule-based score in final
    ai_score_weight: float = 0.6            # Weight for AI score in final
    
    # Default filter thresholds
    default_min_followers: int = 1000       # Minimum followers if not specified
    default_min_engagement: float = 0.0     # Minimum engagement % if not specified
    
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



