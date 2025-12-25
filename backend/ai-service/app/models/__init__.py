"""
Pydantic models for AI Service.

These models mirror the Spring Boot entities and provide
type-safe data transfer between services.
"""

from .athlete import (
    AthleteProfile,
    AthletePreferences,
    SocialAccount,
    SocialSnapshot,
    Sport,
    Conference,
    SocialPlatform,
    BrandCategory,
    ContentType,
)
from .brand import (
    BrandProfile,
    BrandTarget,
    CampaignBrief,
)
from .matching import (
    MatchRequest,
    MatchResult,
    BulkMatchRequest,
    BulkMatchResponse,
    ScoreBreakdown,
    MatchTier,
)

__all__ = [
    # Athlete models
    "AthleteProfile",
    "AthletePreferences",
    "SocialAccount",
    "SocialSnapshot",
    "Sport",
    "Conference",
    "SocialPlatform",
    "BrandCategory",
    "ContentType",
    # Brand models
    "BrandProfile",
    "BrandTarget",
    "CampaignBrief",
    # Matching models
    "MatchRequest",
    "MatchResult",
    "BulkMatchRequest",
    "BulkMatchResponse",
    "ScoreBreakdown",
    "MatchTier",
]
