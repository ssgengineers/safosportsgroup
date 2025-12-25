"""
Matching request/response models.

These models define the API contracts for the matching endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from .athlete import Sport, Conference, BrandCategory, ContentType


class MatchTier(str, Enum):
    """Match quality tiers based on total score."""
    ELITE = "ELITE"          # 85-100: Exceptional match
    STRONG = "STRONG"        # 70-84: Strong match
    GOOD = "GOOD"            # 55-69: Good match
    MODERATE = "MODERATE"    # 40-54: Moderate match
    WEAK = "WEAK"            # 0-39: Weak match


class ScoringMethod(str, Enum):
    """Available scoring methods."""
    RULE_BASED = "rule_based"      # Phase 1: Weighted scoring functions
    LLM_ENHANCED = "llm_enhanced"  # Phase 2: Claude/GPT enhanced scoring
    HYBRID = "hybrid"              # Combined approach


class ScoreBreakdown(BaseModel):
    """
    Detailed breakdown of match score components.
    """
    # Individual scores (out of their max weights)
    audience_fit: float = Field(
        default=0.0,
        ge=0,
        le=35,
        description="Audience demographics alignment (max 35 pts)"
    )
    content_fit: float = Field(
        default=0.0,
        ge=0,
        le=30,
        description="Sport/content type fit (max 30 pts)"
    )
    engagement_quality: float = Field(
        default=0.0,
        ge=0,
        le=20,
        description="Social media influence (max 20 pts)"
    )
    values_alignment: float = Field(
        default=0.0,
        ge=0,
        le=15,
        description="Brand safety & values match (max 15 pts)"
    )

    # LLM-enhanced scores (Phase 2)
    llm_score: Optional[float] = Field(
        default=None,
        ge=0,
        le=100,
        description="LLM-assessed compatibility score (Phase 2)"
    )
    llm_confidence: Optional[float] = Field(
        default=None,
        ge=0,
        le=1,
        description="LLM confidence in its assessment"
    )

    @property
    def rule_based_total(self) -> float:
        """Sum of rule-based scores."""
        return self.audience_fit + self.content_fit + self.engagement_quality + self.values_alignment


class MatchReason(BaseModel):
    """A specific reason for match quality."""
    category: str = Field(..., description="Score category this reason relates to")
    reason: str = Field(..., description="Human-readable explanation")
    impact: str = Field(
        default="positive",
        description="'positive', 'negative', or 'neutral'"
    )
    score_contribution: Optional[float] = Field(
        default=None,
        description="How much this factor contributed to the score"
    )


class MatchResult(BaseModel):
    """
    Complete result of a brand-athlete match scoring.
    """
    # Identifiers
    athlete_id: str
    brand_id: str
    campaign_id: Optional[str] = None

    # Athlete summary (for display)
    athlete_name: Optional[str] = None
    athlete_sport: Optional[Sport] = None
    athlete_school: Optional[str] = None
    athlete_followers: Optional[int] = None
    athlete_engagement_rate: Optional[float] = None

    # Scores
    total_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Overall match score (0-100)"
    )
    tier: MatchTier
    breakdown: ScoreBreakdown

    # Scoring method used
    scoring_method: ScoringMethod = ScoringMethod.RULE_BASED

    # Explanations
    match_reasons: List[MatchReason] = Field(
        default_factory=list,
        description="Positive factors contributing to match"
    )
    concerns: List[MatchReason] = Field(
        default_factory=list,
        description="Potential issues or concerns"
    )

    # Exclusion handling
    is_excluded: bool = Field(
        default=False,
        description="True if athlete excluded by hard rules"
    )
    exclusion_reason: Optional[str] = None

    # LLM insights (Phase 2)
    llm_summary: Optional[str] = Field(
        default=None,
        description="LLM-generated match summary (Phase 2)"
    )
    llm_recommendation: Optional[str] = Field(
        default=None,
        description="LLM recommendation (Phase 2)"
    )

    # Metadata
    calculated_at: datetime = Field(default_factory=datetime.utcnow)
    calculation_time_ms: Optional[int] = None

    @property
    def is_strong_match(self) -> bool:
        """Check if this is considered a strong match."""
        return self.tier in [MatchTier.ELITE, MatchTier.STRONG]


class MatchRequest(BaseModel):
    """
    Request to score a single athlete-brand match.
    """
    athlete_id: str
    brand_id: str
    campaign_id: Optional[str] = None

    # Scoring options
    use_llm: bool = Field(
        default=False,
        description="Enable LLM-enhanced scoring (Phase 2)"
    )
    scoring_method: ScoringMethod = Field(
        default=ScoringMethod.RULE_BASED,
        description="Scoring method to use"
    )

    # Optional: provide data directly instead of fetching
    athlete_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional: athlete data if already available"
    )
    brand_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional: brand data if already available"
    )


class BulkMatchRequest(BaseModel):
    """
    Request to find matching athletes for a brand/campaign.
    """
    brand_id: str
    campaign_id: Optional[str] = None

    # Filters
    sports: Optional[List[Sport]] = None
    conferences: Optional[List[Conference]] = None
    min_followers: Optional[int] = None
    max_followers: Optional[int] = None
    min_engagement_rate: Optional[float] = None
    content_types: Optional[List[ContentType]] = None

    # Scoring options
    use_llm: bool = False
    scoring_method: ScoringMethod = ScoringMethod.RULE_BASED

    # Results options
    limit: int = Field(default=20, ge=1, le=100)
    min_score: float = Field(
        default=0.0,
        ge=0,
        le=100,
        description="Minimum score threshold to include in results"
    )
    include_excluded: bool = Field(
        default=False,
        description="Include excluded athletes with reasons"
    )

    # Sorting
    sort_by: str = Field(
        default="score",
        description="'score', 'followers', 'engagement'"
    )
    sort_order: str = Field(default="desc", description="'asc' or 'desc'")


class BulkMatchResponse(BaseModel):
    """
    Response containing multiple match results.
    """
    brand_id: str
    campaign_id: Optional[str] = None

    # Results
    total_candidates: int = Field(
        ...,
        description="Total athletes considered before filtering"
    )
    total_matches: int = Field(
        ...,
        description="Athletes returned after filtering"
    )
    matches: List[MatchResult]

    # Excluded athletes (if requested)
    excluded: List[MatchResult] = Field(default_factory=list)

    # Aggregated stats
    avg_score: Optional[float] = None
    score_distribution: Optional[Dict[str, int]] = Field(
        default=None,
        description="Count per tier, e.g., {'ELITE': 5, 'STRONG': 12}"
    )

    # Filters applied
    filters_applied: Dict[str, Any] = Field(default_factory=dict)
    scoring_method: ScoringMethod = ScoringMethod.RULE_BASED

    # Metadata
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    calculation_time_ms: Optional[int] = None


class AthleteRecommendation(BaseModel):
    """
    Brand/campaign recommendation for an athlete.
    """
    recommendation_type: str = Field(..., description="'brand' or 'campaign'")
    brand_id: Optional[str] = None
    campaign_id: Optional[str] = None
    brand_name: str
    category: Optional[BrandCategory] = None

    fit_score: float
    tier: MatchTier
    match_reasons: List[str]

    # Opportunity details
    estimated_value: Optional[str] = None
    deadline: Optional[datetime] = None


class AthleteRecommendationsResponse(BaseModel):
    """
    Recommendations for an athlete seeking brand opportunities.
    """
    athlete_id: str
    recommendations: List[AthleteRecommendation]
    generated_at: datetime = Field(default_factory=datetime.utcnow)
