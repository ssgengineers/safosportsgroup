"""
Brand-Athlete Matching Endpoints

Handles intelligent matching between brands and athletes:
- Campaign-athlete matching
- Athlete recommendations for brands
- Brand recommendations for athletes
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

router = APIRouter(prefix="/matching")


# ============= Enums =============

class MatchType(str, Enum):
    """Types of matching operations."""
    CAMPAIGN = "campaign"
    BRAND = "brand"
    ATHLETE = "athlete"


# ============= DTOs =============

class CampaignCriteria(BaseModel):
    """Campaign requirements for matching."""
    campaign_id: str
    brand_id: str
    sport_preferences: Optional[List[str]] = None
    conference_preferences: Optional[List[str]] = None
    min_followers: Optional[int] = None
    min_engagement_rate: Optional[float] = None
    content_types: Optional[List[str]] = None
    budget_per_athlete: Optional[float] = None
    max_athletes: int = 10


class AthleteMatch(BaseModel):
    """An athlete match result."""
    athlete_id: str
    match_score: float
    match_reasons: List[str]
    estimated_reach: int
    suggested_rate: Optional[float] = None


class MatchResponse(BaseModel):
    """Response containing matched athletes."""
    campaign_id: str
    total_matches: int
    matches: List[AthleteMatch]
    generated_at: datetime


class RecommendationRequest(BaseModel):
    """Request for recommendations."""
    entity_id: str
    entity_type: MatchType
    limit: int = 10


# ============= Endpoints =============

@router.post("/campaign", response_model=MatchResponse)
async def match_athletes_for_campaign(criteria: CampaignCriteria):
    """
    Find best matching athletes for a campaign.
    
    Algorithm considers:
    - Sport/conference alignment
    - Follower count requirements
    - Engagement rate thresholds
    - Content type capabilities
    - Budget constraints
    - Historical performance
    """
    # TODO: Implement actual matching algorithm
    # This would query the main API for athlete data
    # and run ML-based matching
    
    # For now, return mock matches
    mock_matches = [
        AthleteMatch(
            athlete_id="mock-athlete-1",
            match_score=92.5,
            match_reasons=[
                "Sport matches campaign target",
                "High engagement rate (5.2%)",
                "Previous similar campaign success"
            ],
            estimated_reach=45000,
            suggested_rate=500.0
        ),
        AthleteMatch(
            athlete_id="mock-athlete-2", 
            match_score=87.3,
            match_reasons=[
                "Strong local following",
                "Content style aligns with brand",
                "Available for campaign dates"
            ],
            estimated_reach=28000,
            suggested_rate=350.0
        ),
        AthleteMatch(
            athlete_id="mock-athlete-3",
            match_score=81.0,
            match_reasons=[
                "Growing audience",
                "Authentic engagement",
                "Budget-friendly option"
            ],
            estimated_reach=12000,
            suggested_rate=200.0
        ),
    ]
    
    return MatchResponse(
        campaign_id=criteria.campaign_id,
        total_matches=len(mock_matches),
        matches=mock_matches[:criteria.max_athletes],
        generated_at=datetime.utcnow(),
    )


@router.get("/recommendations/athlete/{athlete_id}")
async def get_brand_recommendations(
    athlete_id: str,
    limit: int = Query(default=10, le=50)
):
    """
    Get brand/campaign recommendations for an athlete.
    
    Considers:
    - Athlete's sport and position
    - Social media metrics
    - Past campaign performance
    - Brand category preferences
    - Market trends
    """
    # TODO: Implement actual recommendation engine
    
    return {
        "athlete_id": athlete_id,
        "recommendations": [
            {
                "type": "brand",
                "brand_id": "mock-brand-1",
                "brand_name": "Sports Nutrition Co",
                "fit_score": 88.5,
                "reason": "Strong alignment with athletic lifestyle content"
            },
            {
                "type": "campaign",
                "campaign_id": "mock-campaign-1",
                "campaign_name": "Spring Fitness Challenge",
                "fit_score": 82.0,
                "reason": "Your audience matches campaign demographics"
            }
        ],
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/recommendations/brand/{brand_id}")
async def get_athlete_recommendations(
    brand_id: str,
    sport: Optional[str] = None,
    limit: int = Query(default=10, le=50)
):
    """
    Get athlete recommendations for a brand.
    
    Considers:
    - Brand's target demographics
    - Campaign history
    - Budget constraints
    - Industry trends
    """
    # TODO: Implement actual recommendation engine
    
    return {
        "brand_id": brand_id,
        "filters": {
            "sport": sport
        },
        "recommendations": [
            {
                "athlete_id": "mock-athlete-1",
                "name": "John Doe",
                "sport": sport or "FOOTBALL",
                "school": "State University",
                "fit_score": 91.0,
                "followers": 45000,
                "engagement_rate": 5.2
            }
        ],
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/analytics/match-success")
async def get_match_success_analytics():
    """
    Get analytics on matching success rates.
    
    Useful for improving the matching algorithm.
    """
    # TODO: Implement actual analytics
    
    return {
        "period": "last_30_days",
        "total_matches_made": 156,
        "successful_campaigns": 142,
        "success_rate": 91.0,
        "avg_match_score_successful": 85.2,
        "avg_match_score_unsuccessful": 62.8,
        "top_performing_sports": ["FOOTBALL", "BASKETBALL", "SOCCER"],
        "insights": [
            "Higher engagement rates correlate with campaign success",
            "Local brand campaigns outperform national by 23%"
        ]
    }

