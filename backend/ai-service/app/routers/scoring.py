"""
Profile Scoring Endpoints

Handles advanced scoring and ranking of athlete profiles:
- Profile quality scoring (beyond simple completeness)
- Social influence scoring
- Brand fit scoring
- NIL readiness assessment
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/scoring")


# ============= DTOs =============

class SocialMetrics(BaseModel):
    """Social media metrics for scoring."""
    platform: str
    followers: int
    engagement_rate: Optional[float] = None
    avg_likes: Optional[int] = None
    avg_comments: Optional[int] = None


class AthleteScoreRequest(BaseModel):
    """Request for athlete scoring."""
    athlete_id: str
    sport: str
    school: Optional[str] = None
    conference: Optional[str] = None
    social_metrics: Optional[List[SocialMetrics]] = None
    profile_completeness: Optional[int] = None


class AthleteScoreResponse(BaseModel):
    """Comprehensive athlete score response."""
    athlete_id: str
    overall_score: float
    scores: dict
    tier: str
    recommendations: List[str]
    calculated_at: datetime


class BrandFitRequest(BaseModel):
    """Request for brand-athlete fit scoring."""
    athlete_id: str
    brand_category: str
    brand_values: List[str]
    target_demographics: Optional[List[str]] = None


class BrandFitResponse(BaseModel):
    """Brand fit score response."""
    athlete_id: str
    brand_category: str
    fit_score: float
    match_reasons: List[str]
    concerns: List[str]


# ============= Endpoints =============

@router.post("/athlete", response_model=AthleteScoreResponse)
async def score_athlete(request: AthleteScoreRequest):
    """
    Calculate comprehensive athlete score.
    
    Scoring components:
    - Profile Quality (0-25): Completeness, bio quality, media quality
    - Social Influence (0-30): Total reach, engagement, growth
    - Market Value (0-25): Sport popularity, conference tier, performance
    - NIL Readiness (0-20): Professionalism, brand safety, responsiveness
    """
    # TODO: Implement actual scoring algorithm
    # For now, return mock scores based on input
    
    base_score = request.profile_completeness or 50
    social_score = 0
    
    if request.social_metrics:
        total_followers = sum(m.followers for m in request.social_metrics)
        avg_engagement = sum(
            m.engagement_rate or 2.0 for m in request.social_metrics
        ) / len(request.social_metrics)
        
        # Simple scoring logic
        if total_followers > 100000:
            social_score = 30
        elif total_followers > 50000:
            social_score = 25
        elif total_followers > 10000:
            social_score = 20
        elif total_followers > 1000:
            social_score = 10
        else:
            social_score = 5
        
        # Engagement bonus
        if avg_engagement > 5:
            social_score = min(30, social_score + 5)
    
    # Market value based on sport/conference
    market_score = 15
    if request.sport in ["FOOTBALL", "BASKETBALL"]:
        market_score = 25
    elif request.sport in ["SOCCER", "BASEBALL", "VOLLEYBALL"]:
        market_score = 20
    
    # Conference bonus
    if request.conference in ["BIG10", "SEC", "ACC", "BIG12", "PAC12"]:
        market_score = min(25, market_score + 5)
    
    # NIL readiness (placeholder)
    nil_readiness = min(20, base_score // 5)
    
    overall = (base_score * 0.25) + social_score + market_score + nil_readiness
    
    # Determine tier
    if overall >= 80:
        tier = "ELITE"
    elif overall >= 65:
        tier = "PREMIUM"
    elif overall >= 50:
        tier = "STANDARD"
    else:
        tier = "DEVELOPING"
    
    # Generate recommendations
    recommendations = []
    if base_score < 70:
        recommendations.append("Complete more profile fields to improve visibility")
    if not request.social_metrics or len(request.social_metrics) < 2:
        recommendations.append("Connect more social media accounts")
    if social_score < 15:
        recommendations.append("Focus on growing social media following")
    
    return AthleteScoreResponse(
        athlete_id=request.athlete_id,
        overall_score=round(overall, 1),
        scores={
            "profile_quality": round(base_score * 0.25, 1),
            "social_influence": social_score,
            "market_value": market_score,
            "nil_readiness": nil_readiness,
        },
        tier=tier,
        recommendations=recommendations,
        calculated_at=datetime.utcnow(),
    )


@router.post("/brand-fit", response_model=BrandFitResponse)
async def score_brand_fit(request: BrandFitRequest):
    """
    Calculate brand-athlete fit score.
    
    Considers:
    - Brand category alignment
    - Value matching
    - Audience overlap
    - Risk assessment
    """
    # TODO: Implement actual brand fit algorithm
    # For now, return placeholder response
    
    return BrandFitResponse(
        athlete_id=request.athlete_id,
        brand_category=request.brand_category,
        fit_score=75.0,
        match_reasons=[
            "Sport aligns with brand category",
            "Active social media presence",
            "Positive brand image"
        ],
        concerns=[
            "Limited engagement data available"
        ]
    )


@router.get("/tiers")
async def get_score_tiers():
    """Get scoring tier definitions."""
    return {
        "tiers": [
            {
                "name": "ELITE",
                "min_score": 80,
                "description": "Top-tier athletes with strong brand potential",
                "typical_deal_range": "$10,000+"
            },
            {
                "name": "PREMIUM", 
                "min_score": 65,
                "description": "Strong candidates for brand partnerships",
                "typical_deal_range": "$2,500 - $10,000"
            },
            {
                "name": "STANDARD",
                "min_score": 50,
                "description": "Solid athletes building their brand",
                "typical_deal_range": "$500 - $2,500"
            },
            {
                "name": "DEVELOPING",
                "min_score": 0,
                "description": "Emerging athletes with growth potential",
                "typical_deal_range": "$100 - $500"
            }
        ]
    }

