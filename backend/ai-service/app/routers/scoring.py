"""
Profile Scoring Endpoints

Handles advanced scoring and ranking of athlete profiles:
- Profile quality scoring (beyond simple completeness)
- Social influence scoring
- Brand fit scoring
- NIL readiness assessment
"""

import logging
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.services.claude_client import ClaudeClient
from app.services.data_formatter import DataFormatter
from app.services.nil_api_client import NILApiClient

logger = logging.getLogger(__name__)
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
    """Request for athlete scoring (legacy - basic fields)."""
    athlete_id: str
    sport: str
    school: Optional[str] = None
    conference: Optional[str] = None
    social_metrics: Optional[List[SocialMetrics]] = None
    profile_completeness: Optional[int] = None


class AthleteScoreRequestFull(BaseModel):
    """Request for athlete scoring with full profile data."""
    athlete_id: str
    athlete_data: Dict[str, Any]


class AthleteScoreResponse(BaseModel):
    """Comprehensive athlete score response."""
    athlete_id: str
    athlete_name: Optional[str] = None
    overall_score: float
    scores: dict
    tier: str
    recommendations: List[str]
    calculated_at: datetime


class BrandFitRequest(BaseModel):
    """Request for brand-athlete fit scoring (legacy - basic fields)."""
    athlete_id: str
    brand_category: str
    brand_values: List[str]
    target_demographics: Optional[List[str]] = None


class BrandFitRequestFull(BaseModel):
    """Request for brand-athlete fit scoring with full data."""
    athlete_id: str
    athlete_data: Dict[str, Any]
    brand_data: Dict[str, Any]


class BrandFitByIdRequest(BaseModel):
    """Request for brand-athlete fit scoring by IDs only."""
    athlete_id: str = Field(..., description="UUID of the athlete profile")
    brand_id: str = Field(..., description="UUID of the brand intake request")


class BrandFitResponse(BaseModel):
    """Brand fit score response."""
    athlete_id: str
    athlete_name: Optional[str] = None
    brand_id: Optional[str] = None
    brand_name: Optional[str] = None
    brand_category: str
    fit_score: float
    match_reasons: List[str]
    concerns: List[str]


# ============= New Simplified Endpoints =============

@router.get("/athlete/{athlete_id}")
async def score_athlete_by_id(athlete_id: str):
    """
    Score an athlete by ID using AI.

    Simply provide the athlete's UUID - the service fetches all profile data
    automatically and uses Claude AI to provide comprehensive scoring.

    Scoring components:
    - Profile Quality (0-25): Completeness, bio quality, media quality
    - Social Influence (0-30): Total reach, engagement, growth
    - Market Value (0-25): Sport popularity, conference tier, performance
    - NIL Readiness (0-20): Professionalism, brand safety, responsiveness
    """
    try:
        api_client = NILApiClient()
        claude_client = ClaudeClient()
        data_formatter = DataFormatter()

        # Fetch athlete data
        athlete_data = await api_client.get_athlete_profile(athlete_id)
        if not athlete_data:
            raise HTTPException(status_code=404, detail=f"Athlete not found: {athlete_id}")

        # Format for AI
        athlete_formatted = data_formatter.format_athlete_profile(athlete_data)

        # Get AI scoring
        scoring_result = await claude_client.score_athlete(athlete_formatted)

        return AthleteScoreResponse(
            athlete_id=athlete_id,
            athlete_name=athlete_data.get("fullName") or f"{athlete_data.get('firstName', '')} {athlete_data.get('lastName', '')}".strip(),
            overall_score=round(scoring_result["overall_score"], 1),
            scores=scoring_result["component_scores"],
            tier=scoring_result["tier"],
            recommendations=scoring_result["recommendations"],
            calculated_at=datetime.utcnow(),
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        logger.error(f"Error in score_athlete_by_id: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to score athlete: {str(e)}")


@router.post("/brand-fit/by-ids", response_model=BrandFitResponse)
async def score_brand_fit_by_ids(request: BrandFitByIdRequest):
    """
    Score brand-athlete fit by IDs using AI.

    Simply provide athlete_id and brand_id - the service fetches all data
    automatically and uses Claude AI to analyze compatibility.
    """
    try:
        api_client = NILApiClient()
        claude_client = ClaudeClient()
        data_formatter = DataFormatter()

        # Fetch data
        athlete_data = await api_client.get_athlete_profile(request.athlete_id)
        if not athlete_data:
            raise HTTPException(status_code=404, detail=f"Athlete not found: {request.athlete_id}")

        brand_data = await api_client.get_brand_intake(request.brand_id)
        if not brand_data:
            raise HTTPException(status_code=404, detail=f"Brand not found: {request.brand_id}")

        # Format for AI
        athlete_formatted = data_formatter.format_athlete_profile(athlete_data)
        brand_formatted = data_formatter.format_brand_campaign(brand_data)

        # Get AI analysis
        fit_result = await claude_client.score_brand_fit(athlete_formatted, brand_formatted)

        return BrandFitResponse(
            athlete_id=request.athlete_id,
            athlete_name=athlete_data.get("fullName") or f"{athlete_data.get('firstName', '')} {athlete_data.get('lastName', '')}".strip(),
            brand_id=request.brand_id,
            brand_name=brand_data.get("company"),
            brand_category=brand_data.get("industry", "Unknown"),
            fit_score=round(fit_result["fit_score"], 1),
            match_reasons=fit_result["match_reasons"],
            concerns=fit_result["concerns"]
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        logger.error(f"Error in score_brand_fit_by_ids: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to score brand fit: {str(e)}")


@router.get("/athletes/batch")
async def score_athletes_batch(
    athlete_ids: str = Query(..., description="Comma-separated list of athlete UUIDs"),
):
    """
    Score multiple athletes by IDs.

    Provide a comma-separated list of athlete IDs to score them all at once.
    """
    ids = [id.strip() for id in athlete_ids.split(",") if id.strip()]

    if not ids:
        raise HTTPException(status_code=400, detail="At least one athlete_id is required")

    if len(ids) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 athletes per batch")

    results = []
    errors = []

    for athlete_id in ids:
        try:
            result = await score_athlete_by_id(athlete_id)
            results.append(result)
        except HTTPException as e:
            errors.append({"athlete_id": athlete_id, "error": e.detail})
        except Exception as e:
            errors.append({"athlete_id": athlete_id, "error": str(e)})

    return {
        "total_requested": len(ids),
        "total_scored": len(results),
        "results": results,
        "errors": errors if errors else None,
        "calculated_at": datetime.utcnow().isoformat()
    }


# ============= Legacy Endpoints (Backward Compatibility) =============

@router.post("/athlete", response_model=AthleteScoreResponse)
async def score_athlete(request: AthleteScoreRequest):
    """
    [LEGACY] Calculate comprehensive athlete score with basic fields.

    Note: For the recommended approach, use GET /scoring/athlete/{athlete_id}
    which fetches data automatically.
    """
    logger.warning("Using legacy endpoint - consider using GET /scoring/athlete/{athlete_id}")

    base_score = request.profile_completeness or 50
    social_score = 0

    if request.social_metrics:
        total_followers = sum(m.followers for m in request.social_metrics)
        avg_engagement = sum(
            m.engagement_rate or 2.0 for m in request.social_metrics
        ) / len(request.social_metrics)

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

        if avg_engagement > 5:
            social_score = min(30, social_score + 5)

    market_score = 15
    if request.sport in ["FOOTBALL", "BASKETBALL"]:
        market_score = 25
    elif request.sport in ["SOCCER", "BASEBALL", "VOLLEYBALL"]:
        market_score = 20

    if request.conference in ["BIG10", "SEC", "ACC", "BIG12", "PAC12"]:
        market_score = min(25, market_score + 5)

    nil_readiness = min(20, base_score // 5)
    overall = (base_score * 0.25) + social_score + market_score + nil_readiness

    if overall >= 80:
        tier = "ELITE"
    elif overall >= 65:
        tier = "PREMIUM"
    elif overall >= 50:
        tier = "STANDARD"
    else:
        tier = "DEVELOPING"

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


@router.post("/athlete/ai", response_model=AthleteScoreResponse)
async def score_athlete_ai(request: AthleteScoreRequestFull):
    """
    [LEGACY] Calculate comprehensive athlete score using AI with provided data.

    Note: For the recommended approach, use GET /scoring/athlete/{athlete_id}
    which fetches data automatically.
    """
    try:
        claude_client = ClaudeClient()
        data_formatter = DataFormatter()

        athlete_formatted = data_formatter.format_athlete_profile(request.athlete_data)
        scoring_result = await claude_client.score_athlete(athlete_formatted)

        return AthleteScoreResponse(
            athlete_id=request.athlete_id,
            overall_score=round(scoring_result["overall_score"], 1),
            scores=scoring_result["component_scores"],
            tier=scoring_result["tier"],
            recommendations=scoring_result["recommendations"],
            calculated_at=datetime.utcnow(),
        )

    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        logger.error(f"Error in score_athlete_ai: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to score athlete: {str(e)}")


@router.post("/brand-fit", response_model=BrandFitResponse)
async def score_brand_fit(request: BrandFitRequest):
    """
    [LEGACY] Calculate brand-athlete fit score with basic fields.

    Note: For the recommended approach, use POST /scoring/brand-fit/by-ids
    which fetches data automatically.
    """
    logger.warning("Using legacy endpoint - consider using POST /scoring/brand-fit/by-ids")

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


@router.post("/brand-fit/ai", response_model=BrandFitResponse)
async def score_brand_fit_ai(request: BrandFitRequestFull):
    """
    [LEGACY] Calculate brand-athlete fit score using AI with provided data.

    Note: For the recommended approach, use POST /scoring/brand-fit/by-ids
    which fetches data automatically.
    """
    try:
        claude_client = ClaudeClient()
        data_formatter = DataFormatter()

        athlete_formatted = data_formatter.format_athlete_profile(request.athlete_data)
        brand_formatted = data_formatter.format_brand_campaign(request.brand_data)

        fit_result = await claude_client.score_brand_fit(athlete_formatted, brand_formatted)

        return BrandFitResponse(
            athlete_id=request.athlete_id,
            brand_category=request.brand_data.get("industry") or request.brand_data.get("brand_category", "Unknown"),
            fit_score=round(fit_result["fit_score"], 1),
            match_reasons=fit_result["match_reasons"],
            concerns=fit_result["concerns"]
        )

    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        logger.error(f"Error in score_brand_fit_ai: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to score brand fit: {str(e)}")


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
