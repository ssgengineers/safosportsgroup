"""
Brand-Athlete Matching Endpoints

Handles intelligent matching between brands and athletes:
- Single match scoring: POST /matches/score
- Bulk matching: POST /matches/bulk
- Athlete recommendations for brands
- Brand recommendations for athletes

Supports two scoring methods:
- Phase 1: Rule-based (4 weighted scoring functions)
- Phase 2: LLM-enhanced (Claude/GPT integration)
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from datetime import datetime, timezone
import logging

from app.models.athlete import Sport, Conference, AthleteMatchData
from app.models.brand import BrandMatchData
from app.models.matching import (
    MatchRequest,
    MatchResult,
    BulkMatchRequest,
    BulkMatchResponse,
    MatchTier,
    ScoringMethod,
    AthleteRecommendation,
    AthleteRecommendationsResponse,
)
from app.services.rule_based import RuleBasedScorer
from app.services.llm_enhanced import LLMEnhancedScorer
from app.services.spring_client import SpringBootClient, get_spring_client, SpringBootClientError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/matches", tags=["Matching"])


# ============= Dependencies =============

def get_rule_scorer() -> RuleBasedScorer:
    """Dependency for rule-based scorer."""
    return RuleBasedScorer()


def get_llm_scorer() -> LLMEnhancedScorer:
    """Dependency for LLM scorer."""
    return LLMEnhancedScorer()


# ============= Single Match Endpoint =============

@router.post("/score", response_model=MatchResult)
async def score_match(
    request: MatchRequest,
    rule_scorer: RuleBasedScorer = Depends(get_rule_scorer),
    llm_scorer: LLMEnhancedScorer = Depends(get_llm_scorer),
    spring_client: SpringBootClient = Depends(get_spring_client),
):
    """
    Score a single athlete-brand match.

    This endpoint calculates how well an athlete matches with a brand
    using weighted scoring functions.

    **Scoring Components (Rule-Based):**
    - Audience Fit (35%): Demographics alignment
    - Content Fit (30%): Sport/category affinity
    - Engagement Quality (20%): Social media influence
    - Values Alignment (15%): Brand safety & preferences

    **Query Parameters:**
    - `use_llm`: Enable LLM-enhanced scoring (Phase 2)

    **Returns:**
    - Total score (0-100)
    - Score breakdown by component
    - Match tier (ELITE, STRONG, GOOD, MODERATE, WEAK)
    - Match reasons and concerns
    """
    try:
        # Get athlete data
        if request.athlete_data:
            # Use provided data
            athlete = AthleteMatchData(**request.athlete_data)
        else:
            # Fetch from Spring Boot API
            athlete = await spring_client.get_athlete_for_matching(request.athlete_id)
            if not athlete:
                raise HTTPException(
                    status_code=404,
                    detail=f"Athlete not found: {request.athlete_id}"
                )

        # Get brand data
        if request.brand_data:
            # Use provided data
            brand = BrandMatchData(**request.brand_data)
        else:
            # Fetch from Spring Boot API
            brand = await spring_client.get_brand_for_matching(request.brand_id)
            if not brand:
                raise HTTPException(
                    status_code=404,
                    detail=f"Brand not found: {request.brand_id}"
                )

        # Calculate score based on method
        if request.use_llm or request.scoring_method == ScoringMethod.LLM_ENHANCED:
            # Phase 2: LLM-enhanced scoring
            # First get rule-based score, then enhance with LLM
            rule_result = rule_scorer.calculate_match(athlete, brand, request.campaign_id)
            result = await llm_scorer.calculate_hybrid_score(
                athlete, brand, rule_result
            )
        elif request.scoring_method == ScoringMethod.HYBRID:
            # Hybrid: combine rule-based and LLM
            rule_result = rule_scorer.calculate_match(athlete, brand, request.campaign_id)
            result = await llm_scorer.calculate_hybrid_score(
                athlete, brand, rule_result
            )
        else:
            # Phase 1: Pure rule-based scoring
            result = rule_scorer.calculate_match(athlete, brand, request.campaign_id)

        return result

    except SpringBootClientError as e:
        logger.error(f"Spring Boot API error: {e.message}")
        raise HTTPException(
            status_code=e.status_code or 502,
            detail=f"Failed to fetch data from main API: {e.message}"
        )
    except Exception as e:
        logger.exception(f"Error scoring match: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating match score: {str(e)}"
        )


# ============= Bulk Matching Endpoint =============

@router.post("/bulk", response_model=BulkMatchResponse)
async def bulk_match(
    request: BulkMatchRequest,
    rule_scorer: RuleBasedScorer = Depends(get_rule_scorer),
    spring_client: SpringBootClient = Depends(get_spring_client),
):
    """
    Find matching athletes for a brand/campaign.

    This endpoint searches for athletes matching the criteria and
    scores each one against the brand.

    **Filters:**
    - `sports`: Filter by sport(s)
    - `conferences`: Filter by conference(s)
    - `min_followers`: Minimum follower count
    - `max_followers`: Maximum follower count
    - `min_engagement_rate`: Minimum engagement rate
    - `content_types`: Required content capabilities

    **Returns:**
    - List of matching athletes with scores
    - Score distribution across tiers
    - Excluded athletes (if requested)
    """
    start_time = datetime.now(timezone.utc)

    try:
        # Get brand data
        brand = await spring_client.get_brand_for_matching(request.brand_id)
        if not brand:
            raise HTTPException(
                status_code=404,
                detail=f"Brand not found: {request.brand_id}"
            )

        # Apply filters from request to brand data
        if request.min_followers:
            brand.min_followers = request.min_followers
        if request.min_engagement_rate:
            brand.min_engagement_rate = request.min_engagement_rate
        if request.sports:
            brand.preferred_sports = request.sports
        if request.conferences:
            brand.preferred_conferences = request.conferences

        # Search for candidate athletes
        # TODO: This should be optimized with server-side filtering
        athletes = await spring_client.search_athletes(
            sport=request.sports[0] if request.sports and len(request.sports) == 1 else None,
            conference=request.conferences[0] if request.conferences and len(request.conferences) == 1 else None,
            min_followers=request.min_followers,
            min_engagement=request.min_engagement_rate,
            limit=request.limit * 3,  # Fetch extra to account for filtering
        )

        total_candidates = len(athletes)
        matches: List[MatchResult] = []
        excluded: List[MatchResult] = []

        # Score each athlete
        for athlete_profile in athletes:
            athlete_data = AthleteMatchData.from_profile(athlete_profile)

            # Apply additional filters
            if request.sports and athlete_data.sport not in request.sports:
                continue
            if request.conferences and athlete_data.conference not in request.conferences:
                continue
            if request.max_followers and athlete_data.total_followers > request.max_followers:
                continue

            # Calculate match score
            result = rule_scorer.calculate_match(
                athlete_data, brand, request.campaign_id
            )

            if result.is_excluded:
                if request.include_excluded:
                    excluded.append(result)
                continue

            if result.total_score >= request.min_score:
                matches.append(result)

        # Sort results
        if request.sort_by == "followers":
            matches.sort(
                key=lambda x: x.athlete_followers or 0,
                reverse=(request.sort_order == "desc")
            )
        elif request.sort_by == "engagement":
            matches.sort(
                key=lambda x: x.athlete_engagement_rate or 0,
                reverse=(request.sort_order == "desc")
            )
        else:  # Default: sort by score
            matches.sort(
                key=lambda x: x.total_score,
                reverse=(request.sort_order == "desc")
            )

        # Limit results
        matches = matches[:request.limit]

        # Calculate score distribution
        score_distribution = {
            tier.value: sum(1 for m in matches if m.tier == tier)
            for tier in MatchTier
        }

        # Calculate average score
        avg_score = sum(m.total_score for m in matches) / len(matches) if matches else 0

        calc_time = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        return BulkMatchResponse(
            brand_id=request.brand_id,
            campaign_id=request.campaign_id,
            total_candidates=total_candidates,
            total_matches=len(matches),
            matches=matches,
            excluded=excluded if request.include_excluded else [],
            avg_score=round(avg_score, 1),
            score_distribution=score_distribution,
            filters_applied={
                "sports": [s.value for s in request.sports] if request.sports else None,
                "conferences": [c.value for c in request.conferences] if request.conferences else None,
                "min_followers": request.min_followers,
                "max_followers": request.max_followers,
                "min_engagement_rate": request.min_engagement_rate,
                "min_score": request.min_score,
            },
            scoring_method=request.scoring_method,
            generated_at=datetime.now(timezone.utc),
            calculation_time_ms=calc_time,
        )

    except SpringBootClientError as e:
        logger.error(f"Spring Boot API error: {e.message}")
        raise HTTPException(
            status_code=e.status_code or 502,
            detail=f"Failed to fetch data from main API: {e.message}"
        )
    except Exception as e:
        logger.exception(f"Error in bulk matching: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error performing bulk match: {str(e)}"
        )


# ============= Recommendation Endpoints =============

@router.get("/recommendations/athlete/{athlete_id}", response_model=AthleteRecommendationsResponse)
async def get_brand_recommendations_for_athlete(
    athlete_id: str,
    limit: int = Query(default=10, le=50),
    spring_client: SpringBootClient = Depends(get_spring_client),
):
    """
    Get brand/campaign recommendations for an athlete.

    Finds brands that would be a good match based on:
    - Athlete's sport and position
    - Social media metrics
    - Brand category preferences
    - Content creation capabilities

    **Returns:**
    - List of recommended brands/campaigns with fit scores
    """
    try:
        # Get athlete data
        athlete = await spring_client.get_athlete_for_matching(athlete_id)
        if not athlete:
            raise HTTPException(
                status_code=404,
                detail=f"Athlete not found: {athlete_id}"
            )

        # TODO: Implement actual brand recommendation logic
        # This would:
        # 1. Get list of active brands
        # 2. Score each brand against this athlete
        # 3. Return top matches

        # For now, return placeholder
        return AthleteRecommendationsResponse(
            athlete_id=athlete_id,
            recommendations=[
                AthleteRecommendation(
                    recommendation_type="brand",
                    brand_id="placeholder-brand-1",
                    brand_name="Example Sports Brand",
                    category=None,
                    fit_score=85.0,
                    tier=MatchTier.STRONG,
                    match_reasons=[
                        "Strong sport-brand affinity",
                        "Matching target demographics",
                    ],
                    estimated_value="$1,000 - $2,500",
                ),
            ],
            generated_at=datetime.now(timezone.utc),
        )

    except SpringBootClientError as e:
        logger.error(f"Spring Boot API error: {e.message}")
        raise HTTPException(
            status_code=e.status_code or 502,
            detail=f"Failed to fetch data: {e.message}"
        )


@router.get("/recommendations/brand/{brand_id}")
async def get_athlete_recommendations_for_brand(
    brand_id: str,
    sport: Optional[str] = None,
    conference: Optional[str] = None,
    limit: int = Query(default=10, le=50),
    spring_client: SpringBootClient = Depends(get_spring_client),
    rule_scorer: RuleBasedScorer = Depends(get_rule_scorer),
):
    """
    Get athlete recommendations for a brand.

    Finds athletes that would be good matches based on:
    - Brand's target demographics
    - Industry category
    - Campaign history
    - Budget constraints

    **Query Parameters:**
    - `sport`: Filter by sport
    - `conference`: Filter by conference
    - `limit`: Maximum recommendations

    **Returns:**
    - List of recommended athletes with fit scores
    """
    try:
        # Get brand data
        brand = await spring_client.get_brand_for_matching(brand_id)
        if not brand:
            raise HTTPException(
                status_code=404,
                detail=f"Brand not found: {brand_id}"
            )

        # Parse filter enums
        sport_filter = None
        if sport:
            try:
                sport_filter = Sport(sport.upper())
            except ValueError:
                pass

        conference_filter = None
        if conference:
            try:
                conference_filter = Conference(conference.upper())
            except ValueError:
                pass

        # Search for athletes
        athletes = await spring_client.search_athletes(
            sport=sport_filter,
            conference=conference_filter,
            limit=limit * 2,
        )

        # Score each athlete
        recommendations = []
        for athlete_profile in athletes:
            athlete_data = AthleteMatchData.from_profile(athlete_profile)
            result = rule_scorer.calculate_match(athlete_data, brand)

            if not result.is_excluded and result.total_score >= 50:
                recommendations.append({
                    "athlete_id": result.athlete_id,
                    "name": result.athlete_name,
                    "sport": result.athlete_sport.value if result.athlete_sport else None,
                    "school": result.athlete_school,
                    "fit_score": result.total_score,
                    "tier": result.tier.value,
                    "followers": result.athlete_followers,
                    "engagement_rate": result.athlete_engagement_rate,
                    "match_reasons": [r.reason for r in result.match_reasons[:3]],
                })

        # Sort by score and limit
        recommendations.sort(key=lambda x: x["fit_score"], reverse=True)
        recommendations = recommendations[:limit]

        return {
            "brand_id": brand_id,
            "filters": {
                "sport": sport,
                "conference": conference,
            },
            "total_recommendations": len(recommendations),
            "recommendations": recommendations,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    except SpringBootClientError as e:
        logger.error(f"Spring Boot API error: {e.message}")
        raise HTTPException(
            status_code=e.status_code or 502,
            detail=f"Failed to fetch data: {e.message}"
        )


# ============= Utility Endpoints =============

@router.get("/tiers")
async def get_match_tiers():
    """
    Get match tier definitions.

    Returns the scoring thresholds and descriptions for each tier.
    """
    return {
        "tiers": [
            {
                "name": MatchTier.ELITE.value,
                "min_score": 85,
                "max_score": 100,
                "description": "Exceptional match - highly recommended",
                "typical_outcome": "High likelihood of successful partnership",
            },
            {
                "name": MatchTier.STRONG.value,
                "min_score": 70,
                "max_score": 84,
                "description": "Strong match - recommended",
                "typical_outcome": "Good potential for successful partnership",
            },
            {
                "name": MatchTier.GOOD.value,
                "min_score": 55,
                "max_score": 69,
                "description": "Good match - worth considering",
                "typical_outcome": "Reasonable fit with some considerations",
            },
            {
                "name": MatchTier.MODERATE.value,
                "min_score": 40,
                "max_score": 54,
                "description": "Moderate match - proceed with caution",
                "typical_outcome": "May work with adjustments",
            },
            {
                "name": MatchTier.WEAK.value,
                "min_score": 0,
                "max_score": 39,
                "description": "Weak match - not recommended",
                "typical_outcome": "Significant misalignment",
            },
        ],
        "scoring_weights": {
            "audience_fit": {"weight": 35, "description": "Audience demographics alignment"},
            "content_fit": {"weight": 30, "description": "Sport and content type compatibility"},
            "engagement_quality": {"weight": 20, "description": "Social media influence and engagement"},
            "values_alignment": {"weight": 15, "description": "Brand safety and values match"},
        },
    }


@router.get("/sports")
async def get_supported_sports():
    """
    Get list of supported sports for filtering.
    """
    return {
        "sports": [
            {"value": sport.value, "label": sport.value.replace("_", " ").title()}
            for sport in Sport
        ]
    }


@router.get("/conferences")
async def get_supported_conferences():
    """
    Get list of supported conferences for filtering.
    """
    return {
        "conferences": [
            {"value": conf.value, "label": conf.value.replace("_", " ")}
            for conf in Conference
        ]
    }
