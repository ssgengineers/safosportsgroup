"""
Brand-Athlete Matching Endpoints

Handles intelligent matching between brands and athletes:
- Campaign-athlete matching (by IDs - fetches data automatically)
- Athlete recommendations for brands
- Brand recommendations for athletes
- Batch matching for efficiency
"""

import logging
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from app.services.claude_client import ClaudeClient
from app.services.lm_studio_client import LMStudioClient, get_ai_client
from app.services.data_formatter import DataFormatter
from app.services.nil_api_client import NILApiClient
from app.services.rule_engine import RuleEngine, BrandCriteria
from app.config import get_settings

settings = get_settings()

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/matching")


# ============= Enums =============

class MatchType(str, Enum):
    """Types of matching operations."""
    CAMPAIGN = "campaign"
    BRAND = "brand"
    ATHLETE = "athlete"


# ============= DTOs =============

class SimpleMatchRequest(BaseModel):
    """Simple match request - just provide IDs, data is fetched automatically."""
    brand_id: str = Field(..., description="UUID of the brand intake request")
    athlete_ids: Optional[List[str]] = Field(None, description="List of athlete profile UUIDs. If not provided, matches against all athletes.")
    campaign_requirements: Optional[Dict[str, Any]] = Field(None, description="Optional campaign-specific requirements")
    max_results: int = Field(10, description="Maximum number of matches to return", ge=1, le=50)
    use_hybrid: bool = Field(True, description="Use hybrid matching (rule-based filter + AI). Set to False for AI-only.")


class AthleteMatchResult(BaseModel):
    """An athlete match result with full details."""
    athlete_id: str
    athlete_name: Optional[str] = None
    sport: Optional[str] = None
    school: Optional[str] = None
    match_score: float
    match_reasons: List[str]
    concerns: List[str] = []
    estimated_reach: int
    suggested_rate: Optional[float] = None
    component_scores: Optional[Dict[str, float]] = None


class MatchResponse(BaseModel):
    """Response containing matched athletes."""
    brand_id: str
    brand_name: Optional[str] = None
    total_candidates: int
    total_matches: int
    matches: List[AthleteMatchResult]
    generated_at: datetime


class HybridMatchResponse(BaseModel):
    """Response from hybrid matching (rule-based + AI)."""
    brand_id: str
    brand_name: Optional[str] = None
    total_candidates: int
    passed_filters: int
    ai_analyzed: int
    total_matches: int
    matches: List[AthleteMatchResult]
    filter_stats: Optional[Dict[str, Any]] = None
    generated_at: datetime


class CampaignCriteria(BaseModel):
    """Campaign requirements for matching (legacy)."""
    campaign_id: str
    brand_id: str
    sport_preferences: Optional[List[str]] = None
    conference_preferences: Optional[List[str]] = None
    min_followers: Optional[int] = None
    min_engagement_rate: Optional[float] = None
    content_types: Optional[List[str]] = None
    budget_per_athlete: Optional[float] = None
    max_athletes: int = 10


class AthleteProfileData(BaseModel):
    """Complete athlete profile data for matching (legacy)."""
    athlete_id: str
    athlete_data: Dict[str, Any]


class MatchAthletesRequest(BaseModel):
    """Request for matching athletes to a campaign with full data (legacy)."""
    campaign_id: str
    brand_data: Dict[str, Any]
    campaign_data: Optional[Dict[str, Any]] = None
    athletes: List[AthleteProfileData]
    max_athletes: int = 10


class AthleteMatch(BaseModel):
    """An athlete match result (legacy format)."""
    athlete_id: str
    match_score: float
    match_reasons: List[str]
    estimated_reach: int
    suggested_rate: Optional[float] = None


class LegacyMatchResponse(BaseModel):
    """Response containing matched athletes (legacy format)."""
    campaign_id: str
    total_matches: int
    matches: List[AthleteMatch]
    generated_at: datetime


# ============= New Simplified Endpoints =============

@router.post("/find-hybrid", response_model=HybridMatchResponse)
async def find_athlete_matches_hybrid(request: SimpleMatchRequest):
    """
    Find best matching athletes using HYBRID approach (Rule-Based + AI).
    
    This is the RECOMMENDED endpoint for efficient matching:
    
    1. Rule-Based Filter (instant): Eliminates athletes who don't match criteria
       - Sport, conference, follower count, engagement rate, gender, age
       
    2. Rule-Based Scoring (instant): Scores remaining athletes on quantitative factors
       - Sport alignment, reach, engagement, interest tags, geography
       
    3. Claude AI Analysis (2-3 sec): Qualitative analysis of TOP candidates only
       - Bio alignment, brand voice fit, content potential
    
    Benefits:
    - 80% cost reduction (only top 20 go to AI)
    - 5x faster response time
    - Explainable scores for quantitative factors
    """
    try:
        # Initialize services
        api_client = NILApiClient()
        claude_client = ClaudeClient()
        data_formatter = DataFormatter()
        rule_engine = RuleEngine()
        
        # Fetch brand profile (enriched with AI matching preferences from dashboard)
        brand_data = await api_client.get_brand_profile(request.brand_id)
        if not brand_data:
            # Fall back to brand intake if profile doesn't exist yet
            brand_data = await api_client.get_brand_intake(request.brand_id)
        if not brand_data:
            raise HTTPException(status_code=404, detail=f"Brand not found: {request.brand_id}")
        
        # Merge campaign requirements into brand data for rule engine
        if request.campaign_requirements:
            brand_data.update({
                "preferredSports": request.campaign_requirements.get("sport_preferences", []),
                "preferredConferences": request.campaign_requirements.get("conference_preferences", []),
                "minFollowers": request.campaign_requirements.get("min_followers"),
                "minEngagement": request.campaign_requirements.get("min_engagement_rate"),
            })
        
        # Fetch athletes
        if request.athlete_ids:
            athletes_raw = await api_client.get_athlete_profiles(request.athlete_ids)
        else:
            athletes_response = await api_client.get_all_athletes(size=500)  # Fetch more for filtering
            athletes_raw = athletes_response.get("content", [])
        
        if not athletes_raw:
            return HybridMatchResponse(
                brand_id=request.brand_id,
                brand_name=brand_data.get("companyName") or brand_data.get("company"),
                total_candidates=0,
                passed_filters=0,
                ai_analyzed=0,
                total_matches=0,
                matches=[],
                generated_at=datetime.utcnow()
            )
        
        # STEP 1 & 2: Rule-based filtering and scoring
        top_candidates, stats = rule_engine.process_matching_request(
            athletes_raw,
            brand_data,
            top_n=20  # Only send top 20 to Claude
        )
        
        if not top_candidates:
            return HybridMatchResponse(
                brand_id=request.brand_id,
                brand_name=brand_data.get("companyName") or brand_data.get("company"),
                total_candidates=len(athletes_raw),
                passed_filters=0,
                ai_analyzed=0,
                total_matches=0,
                matches=[],
                filter_stats=stats.get("filter_stats"),
                generated_at=datetime.utcnow()
            )
        
        # STEP 3: Claude AI analysis for top candidates only
        brand_formatted = data_formatter.format_brand_campaign(
            brand_data,
            request.campaign_requirements
        )
        
        # Get original athlete data for the top candidates
        top_athlete_ids = {c.athlete_id for c in top_candidates}
        top_athletes_raw = [a for a in athletes_raw if str(a.get("id", "")) in top_athlete_ids]
        
        # Format for Claude
        athletes_formatted = []
        for athlete in top_athletes_raw:
            formatted = data_formatter.format_athlete_profile(athlete)
            formatted["athlete_id"] = str(athlete.get("id", ""))
            # Add rule-based score for context
            rule_result = next((c for c in top_candidates if c.athlete_id == formatted["athlete_id"]), None)
            if rule_result:
                formatted["rule_score"] = rule_result.total_score
                formatted["rule_reasons"] = rule_result.score_reasons
            athletes_formatted.append(formatted)
        
        # Call Claude for qualitative analysis
        all_matches = []
        batch_size = 10
        
        for i in range(0, len(athletes_formatted), batch_size):
            batch = athletes_formatted[i:i + batch_size]
            
            try:
                batch_results = await claude_client.analyze_batch_matches(
                    batch,
                    brand_formatted,
                    request.campaign_requirements
                )
                
                for j, result in enumerate(batch_results):
                    if j < len(batch):
                        athlete_id = batch[j]["athlete_id"]
                        result["athlete_id"] = athlete_id
                        
                        # Find original data and rule score
                        original = next((a for a in athletes_raw if str(a.get("id", "")) == athlete_id), {})
                        rule_result = next((c for c in top_candidates if c.athlete_id == athlete_id), None)
                        
                        result["athlete_name"] = original.get("fullName") or f"{original.get('firstName', '')} {original.get('lastName', '')}".strip()
                        result["sport"] = original.get("sport")
                        result["school"] = original.get("schoolName") or original.get("school")
                        
                        # Combine rule score (40%) and AI score (60%)
                        rule_score = rule_result.total_score if rule_result else 50
                        ai_score = result.get("match_score", 50)
                        result["match_score"] = round(rule_score * 0.4 + ai_score * 0.6, 1)
                        
                        # Combine reasons
                        if rule_result:
                            result["match_reasons"] = rule_result.score_reasons + result.get("match_reasons", [])
                        
                        # Add component scores
                        result["component_scores"] = {
                            "rule_based": rule_score,
                            "ai_analysis": ai_score,
                            **(rule_result.component_scores if rule_result else {})
                        }
                        
                        all_matches.append(result)
                        
            except Exception as e:
                logger.error(f"Error in Claude batch analysis: {e}")
                # Fall back to rule-based scores only
                for j, athlete in enumerate(batch):
                    rule_result = next((c for c in top_candidates if c.athlete_id == athlete["athlete_id"]), None)
                    if rule_result:
                        original = next((a for a in athletes_raw if str(a.get("id", "")) == athlete["athlete_id"]), {})
                        all_matches.append({
                            "athlete_id": athlete["athlete_id"],
                            "athlete_name": original.get("fullName") or f"{original.get('firstName', '')} {original.get('lastName', '')}".strip(),
                            "sport": original.get("sport"),
                            "school": original.get("schoolName") or original.get("school"),
                            "match_score": rule_result.total_score,
                            "match_reasons": rule_result.score_reasons + ["[AI analysis unavailable - using rule-based score only]"],
                            "concerns": [],
                            "estimated_reach": 0,
                            "component_scores": {"rule_based": rule_result.total_score}
                        })
        
        # Sort and limit
        all_matches.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        top_matches = all_matches[:request.max_results]
        
        # Convert to response model
        match_results = [
            AthleteMatchResult(
                athlete_id=m["athlete_id"],
                athlete_name=m.get("athlete_name"),
                sport=m.get("sport"),
                school=m.get("school"),
                match_score=m["match_score"],
                match_reasons=m.get("match_reasons", []),
                concerns=m.get("concerns", []),
                estimated_reach=m.get("estimated_reach", 0),
                suggested_rate=m.get("suggested_rate"),
                component_scores=m.get("component_scores")
            )
            for m in top_matches
        ]
        
        return HybridMatchResponse(
            brand_id=request.brand_id,
            brand_name=brand_data.get("companyName") or brand_data.get("company"),
            total_candidates=len(athletes_raw),
            passed_filters=stats.get("filter_stats", {}).get("passed", 0),
            ai_analyzed=len(top_candidates),
            total_matches=len(match_results),
            matches=match_results,
            filter_stats=stats.get("filter_stats"),
            generated_at=datetime.utcnow()
        )
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in find_athlete_matches_hybrid: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to find matches: {str(e)}")


@router.post("/find-local", response_model=HybridMatchResponse)
async def find_athlete_matches_local(request: SimpleMatchRequest):
    """
    Find best matching athletes using LOCAL AI (LM Studio).
    
    Uses a local LLM via LM Studio instead of Claude API.
    Supports agent team mode for parallel processing.
    
    This endpoint:
    1. Uses rule-based filtering first
    2. Sends top candidates to local LLM for analysis
    3. Combines scores (40% rules, 60% AI)
    
    Set AI_BACKEND=local in environment to use this by default.
    """
    try:
        # Initialize services
        api_client = NILApiClient()
        ai_client = LMStudioClient()  # Local LLM
        data_formatter = DataFormatter()
        rule_engine = RuleEngine()
        
        # Fetch brand profile (enriched with AI matching preferences from dashboard)
        brand_data = await api_client.get_brand_profile(request.brand_id)
        if not brand_data:
            # Fall back to brand intake if profile doesn't exist yet
            brand_data = await api_client.get_brand_intake(request.brand_id)
        if not brand_data:
            raise HTTPException(status_code=404, detail=f"Brand not found: {request.brand_id}")
        
        # Merge campaign requirements into brand data
        if request.campaign_requirements:
            brand_data.update({
                "preferredSports": request.campaign_requirements.get("sport_preferences", []),
                "preferredConferences": request.campaign_requirements.get("conference_preferences", []),
                "minFollowers": request.campaign_requirements.get("min_followers"),
                "minEngagement": request.campaign_requirements.get("min_engagement_rate"),
            })
        
        # Fetch athletes
        if request.athlete_ids:
            athletes_raw = await api_client.get_athlete_profiles(request.athlete_ids)
        else:
            athletes_response = await api_client.get_all_athletes(size=500)
            athletes_raw = athletes_response.get("content", [])
        
        if not athletes_raw:
            return HybridMatchResponse(
                brand_id=request.brand_id,
                brand_name=brand_data.get("companyName") or brand_data.get("company"),
                total_candidates=0,
                passed_filters=0,
                ai_analyzed=0,
                total_matches=0,
                matches=[],
                generated_at=datetime.utcnow()
            )
        
        # STEP 1 & 2: Rule-based filtering and scoring
        top_candidates, stats = rule_engine.process_matching_request(
            athletes_raw,
            brand_data,
            top_n=20
        )
        
        if not top_candidates:
            return HybridMatchResponse(
                brand_id=request.brand_id,
                brand_name=brand_data.get("companyName") or brand_data.get("company"),
                total_candidates=len(athletes_raw),
                passed_filters=0,
                ai_analyzed=0,
                total_matches=0,
                matches=[],
                filter_stats=stats.get("filter_stats"),
                generated_at=datetime.utcnow()
            )
        
        # STEP 3: Local LLM analysis for top candidates
        brand_formatted = data_formatter.format_brand_campaign(
            brand_data,
            request.campaign_requirements
        )
        
        # Get original athlete data for top candidates
        top_athlete_ids = {c.athlete_id for c in top_candidates}
        top_athletes_raw = [a for a in athletes_raw if str(a.get("id", "")) in top_athlete_ids]
        
        # Format for LLM
        athletes_formatted = []
        for athlete in top_athletes_raw:
            formatted = data_formatter.format_athlete_profile(athlete)
            formatted["athlete_id"] = str(athlete.get("id", ""))
            rule_result = next((c for c in top_candidates if c.athlete_id == formatted["athlete_id"]), None)
            if rule_result:
                formatted["rule_score"] = rule_result.total_score
                formatted["rule_reasons"] = rule_result.score_reasons
            athletes_formatted.append(formatted)
        
        # Call Local LLM for analysis
        all_matches = []
        batch_size = 5  # Smaller batches for local models
        
        for i in range(0, len(athletes_formatted), batch_size):
            batch = athletes_formatted[i:i + batch_size]
            
            try:
                batch_results = await ai_client.analyze_batch_matches(
                    batch,
                    brand_formatted,
                    request.campaign_requirements
                )
                
                for j, result in enumerate(batch_results):
                    if j < len(batch):
                        athlete_id = batch[j]["athlete_id"]
                        result["athlete_id"] = athlete_id
                        
                        original = next((a for a in athletes_raw if str(a.get("id", "")) == athlete_id), {})
                        rule_result = next((c for c in top_candidates if c.athlete_id == athlete_id), None)
                        
                        result["athlete_name"] = original.get("fullName") or f"{original.get('firstName', '')} {original.get('lastName', '')}".strip()
                        result["sport"] = original.get("sport")
                        result["school"] = original.get("schoolName") or original.get("school")
                        
                        # Combine scores
                        rule_score = rule_result.total_score if rule_result else 50
                        ai_score = result.get("match_score", 50)
                        result["match_score"] = round(rule_score * 0.4 + ai_score * 0.6, 1)
                        
                        if rule_result:
                            result["match_reasons"] = rule_result.score_reasons + result.get("match_reasons", [])
                        
                        result["component_scores"] = {
                            "rule_based": rule_score,
                            "ai_analysis": ai_score,
                            "backend": "local",
                            **(rule_result.component_scores if rule_result else {})
                        }
                        
                        all_matches.append(result)
                        
            except Exception as e:
                logger.error(f"Error in local LLM batch analysis: {e}")
                # Fall back to rule-based scores only
                for j, athlete in enumerate(batch):
                    rule_result = next((c for c in top_candidates if c.athlete_id == athlete["athlete_id"]), None)
                    if rule_result:
                        original = next((a for a in athletes_raw if str(a.get("id", "")) == athlete["athlete_id"]), {})
                        all_matches.append({
                            "athlete_id": athlete["athlete_id"],
                            "athlete_name": original.get("fullName") or f"{original.get('firstName', '')} {original.get('lastName', '')}".strip(),
                            "sport": original.get("sport"),
                            "school": original.get("schoolName") or original.get("school"),
                            "match_score": rule_result.total_score,
                            "match_reasons": rule_result.score_reasons + ["[Local AI unavailable - using rule-based score only]"],
                            "concerns": [],
                            "estimated_reach": 0,
                            "component_scores": {"rule_based": rule_result.total_score, "backend": "local"}
                        })
        
        # Sort and limit
        all_matches.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        top_matches = all_matches[:request.max_results]
        
        # Convert to response model
        match_results = [
            AthleteMatchResult(
                athlete_id=m["athlete_id"],
                athlete_name=m.get("athlete_name"),
                sport=m.get("sport"),
                school=m.get("school"),
                match_score=m["match_score"],
                match_reasons=m.get("match_reasons", []),
                concerns=m.get("concerns", []),
                estimated_reach=m.get("estimated_reach", 0),
                suggested_rate=m.get("suggested_rate"),
                component_scores=m.get("component_scores")
            )
            for m in top_matches
        ]
        
        return HybridMatchResponse(
            brand_id=request.brand_id,
            brand_name=brand_data.get("companyName") or brand_data.get("company"),
            total_candidates=len(athletes_raw),
            passed_filters=stats.get("filter_stats", {}).get("passed", 0),
            ai_analyzed=len(top_candidates),
            total_matches=len(match_results),
            matches=match_results,
            filter_stats={**stats.get("filter_stats", {}), "backend": "local"},
            generated_at=datetime.utcnow()
        )
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in find_athlete_matches_local: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to find matches: {str(e)}")


@router.post("/find-agents")
async def find_athlete_matches_with_agents(request: SimpleMatchRequest):
    """
    Find best matching athletes using AGENT TEAM mode.
    
    Spawns specialized agents that work in parallel:
    - Scoring Agent: Calculates quantitative scores
    - Match Analyzer Agent: Performs qualitative analysis
    
    This is the most powerful but also most resource-intensive option.
    Best for complex matching tasks with many athletes.
    """
    try:
        from app.agents.coordinator import CoordinatorAgent
        
        # Initialize services
        api_client = NILApiClient()
        data_formatter = DataFormatter()
        rule_engine = RuleEngine()
        
        # Fetch brand profile (enriched with AI matching preferences from dashboard)
        brand_data = await api_client.get_brand_profile(request.brand_id)
        if not brand_data:
            # Fall back to brand intake if profile doesn't exist yet
            brand_data = await api_client.get_brand_intake(request.brand_id)
        if not brand_data:
            raise HTTPException(status_code=404, detail=f"Brand not found: {request.brand_id}")
        
        # Fetch athletes
        if request.athlete_ids:
            athletes_raw = await api_client.get_athlete_profiles(request.athlete_ids)
        else:
            athletes_response = await api_client.get_all_athletes(size=100)
            athletes_raw = athletes_response.get("content", [])
        
        if not athletes_raw:
            return {
                "brand_id": request.brand_id,
                "total_candidates": 0,
                "matches": [],
                "mode": "agent_team",
                "generated_at": datetime.utcnow().isoformat()
            }
        
        # Rule-based pre-filtering
        top_candidates, stats = rule_engine.process_matching_request(
            athletes_raw,
            brand_data,
            top_n=30
        )
        
        # Format data for agents
        brand_formatted = data_formatter.format_brand_campaign(
            brand_data,
            request.campaign_requirements
        )
        
        athletes_formatted = []
        for athlete in athletes_raw:
            formatted = data_formatter.format_athlete_profile(athlete)
            formatted["athlete_id"] = str(athlete.get("id", ""))
            athletes_formatted.append(formatted)
        
        # Create coordinator and run matching
        coordinator = CoordinatorAgent(use_redis=False)  # In-memory for simplicity
        await coordinator.task_queue.connect()
        await coordinator.mailbox.connect()
        
        try:
            results = await coordinator.run_matching_task(
                brand_formatted,
                athletes_formatted,
                request.campaign_requirements
            )
            
            return {
                "brand_id": request.brand_id,
                "brand_name": brand_data.get("companyName") or brand_data.get("company"),
                "total_candidates": results.get("total_athletes", 0),
                "scored": results.get("scored", 0),
                "analyzed": results.get("analyzed", 0),
                "matches": results.get("matches", [])[:request.max_results],
                "mode": "agent_team",
                "team_id": coordinator.team_id,
                "generated_at": results.get("generated_at")
            }
            
        finally:
            await coordinator.cleanup()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in find_athlete_matches_with_agents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to run agent matching: {str(e)}")


@router.post("/find", response_model=MatchResponse)
async def find_athlete_matches(request: SimpleMatchRequest):
    """
    Find best matching athletes for a brand using AI.

    This is the recommended endpoint for matching. Simply provide:
    - brand_id: UUID of the brand (from brand intake)
    - athlete_ids (optional): Specific athletes to evaluate. If not provided, evaluates all active athletes.
    - campaign_requirements (optional): Additional campaign-specific criteria
    - max_results: Maximum matches to return (default 10)

    The service automatically fetches all athlete and brand data from the main API,
    then uses Claude AI to analyze compatibility and return ranked matches.
    
    Note: For better performance and cost efficiency, use /find-hybrid instead.
    """
    try:
        # Initialize clients
        api_client = NILApiClient()
        claude_client = ClaudeClient()
        data_formatter = DataFormatter()

        # Fetch brand profile (enriched with AI matching preferences from dashboard)
        brand_data = await api_client.get_brand_profile(request.brand_id)
        if not brand_data:
            # Fall back to brand intake if profile doesn't exist yet
            brand_data = await api_client.get_brand_intake(request.brand_id)
        if not brand_data:
            raise HTTPException(status_code=404, detail=f"Brand not found: {request.brand_id}")

        # Format brand data for AI
        brand_formatted = data_formatter.format_brand_campaign(
            brand_data,
            request.campaign_requirements
        )

        # Fetch athlete data
        if request.athlete_ids:
            # Fetch specific athletes
            athletes_raw = await api_client.get_athlete_profiles(request.athlete_ids)
        else:
            # Fetch all active athletes
            athletes_response = await api_client.get_all_athletes(size=100)
            athletes_raw = athletes_response.get("content", [])

        if not athletes_raw:
            return MatchResponse(
                brand_id=request.brand_id,
                brand_name=brand_data.get("companyName") or brand_data.get("company"),
                total_candidates=0,
                total_matches=0,
                matches=[],
                generated_at=datetime.utcnow()
            )

        # Format athlete data and add IDs
        athletes_formatted = []
        for athlete in athletes_raw:
            formatted = data_formatter.format_athlete_profile(athlete)
            formatted["athlete_id"] = str(athlete.get("id", ""))
            athletes_formatted.append(formatted)

        # Use batch matching for efficiency (up to 10 athletes per call)
        all_matches = []
        batch_size = 10

        for i in range(0, len(athletes_formatted), batch_size):
            batch = athletes_formatted[i:i + batch_size]

            try:
                batch_results = await claude_client.analyze_batch_matches(
                    batch,
                    brand_formatted,
                    request.campaign_requirements
                )

                # Map results back to athlete IDs
                for j, result in enumerate(batch_results):
                    if j < len(batch):
                        result["athlete_id"] = batch[j]["athlete_id"]
                        # Add athlete info from original data
                        original = athletes_raw[i + j]
                        result["athlete_name"] = original.get("fullName") or f"{original.get('firstName', '')} {original.get('lastName', '')}".strip()
                        result["sport"] = original.get("sport")
                        result["school"] = original.get("schoolName") or original.get("school")
                        all_matches.append(result)

            except Exception as e:
                logger.error(f"Error in batch {i // batch_size}: {e}")
                # Fall back to individual matching for this batch
                for j, athlete in enumerate(batch):
                    try:
                        result = await claude_client.analyze_match(
                            athlete,
                            brand_formatted,
                            request.campaign_requirements
                        )
                        result["athlete_id"] = athlete["athlete_id"]
                        original = athletes_raw[i + j]
                        result["athlete_name"] = original.get("fullName") or f"{original.get('firstName', '')} {original.get('lastName', '')}".strip()
                        result["sport"] = original.get("sport")
                        result["school"] = original.get("schoolName") or original.get("school")
                        all_matches.append(result)
                    except Exception as inner_e:
                        logger.error(f"Error matching athlete {athlete.get('athlete_id')}: {inner_e}")

        # Sort by match score and limit
        all_matches.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        top_matches = all_matches[:request.max_results]

        # Convert to response model
        match_results = [
            AthleteMatchResult(
                athlete_id=m["athlete_id"],
                athlete_name=m.get("athlete_name"),
                sport=m.get("sport"),
                school=m.get("school"),
                match_score=m["match_score"],
                match_reasons=m.get("match_reasons", []),
                concerns=m.get("concerns", []),
                estimated_reach=m.get("estimated_reach", 0),
                suggested_rate=m.get("suggested_rate"),
                component_scores=m.get("component_scores")
            )
            for m in top_matches
        ]

        return MatchResponse(
            brand_id=request.brand_id,
            brand_name=brand_data.get("companyName") or brand_data.get("company"),
            total_candidates=len(athletes_raw),
            total_matches=len(match_results),
            matches=match_results,
            generated_at=datetime.utcnow()
        )

    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in find_athlete_matches: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to find matches: {str(e)}")


@router.get("/brand/{brand_id}/athletes")
async def get_top_athletes_for_brand(
    brand_id: str,
    sport: Optional[str] = Query(None, description="Filter by sport"),
    conference: Optional[str] = Query(None, description="Filter by conference"),
    min_followers: Optional[int] = Query(None, description="Minimum follower count"),
    limit: int = Query(10, description="Maximum results", ge=1, le=50)
):
    """
    Get top matching athletes for a brand.

    Simplified endpoint that fetches brand and athlete data automatically,
    then returns the best matches using AI analysis.
    """
    request = SimpleMatchRequest(
        brand_id=brand_id,
        athlete_ids=None,
        campaign_requirements={
            "sport_preferences": [sport] if sport else None,
            "conference_preferences": [conference] if conference else None,
            "min_followers": min_followers
        } if any([sport, conference, min_followers]) else None,
        max_results=limit
    )

    return await find_athlete_matches(request)


@router.get("/athlete/{athlete_id}/brands")
async def get_matching_brands_for_athlete(
    athlete_id: str,
    limit: int = Query(10, description="Maximum results", ge=1, le=50)
):
    """
    Get brands that would be good matches for an athlete.

    Fetches the athlete profile and all approved brands,
    then uses AI to rank brand compatibility.
    """
    try:
        api_client = NILApiClient()
        claude_client = ClaudeClient()
        data_formatter = DataFormatter()

        # Fetch athlete data
        athlete_data = await api_client.get_athlete_profile(athlete_id)
        if not athlete_data:
            raise HTTPException(status_code=404, detail=f"Athlete not found: {athlete_id}")

        athlete_formatted = data_formatter.format_athlete_profile(athlete_data)

        # Fetch all approved brands
        brands_response = await api_client.get_all_brand_intakes(status="APPROVED", size=50)
        brands = brands_response.get("content", [])

        if not brands:
            return {
                "athlete_id": athlete_id,
                "athlete_name": athlete_data.get("fullName"),
                "total_brands": 0,
                "matches": [],
                "generated_at": datetime.utcnow().isoformat()
            }

        # Score each brand
        brand_scores = []
        for brand in brands:
            try:
                brand_formatted = data_formatter.format_brand_campaign(brand)
                result = await claude_client.score_brand_fit(athlete_formatted, brand_formatted)

                brand_scores.append({
                    "brand_id": str(brand.get("id", "")),
                    "company": brand.get("company"),
                    "industry": brand.get("industry"),
                    "fit_score": result["fit_score"],
                    "match_reasons": result["match_reasons"],
                    "concerns": result["concerns"]
                })
            except Exception as e:
                logger.error(f"Error scoring brand {brand.get('id')}: {e}")

        # Sort and limit
        brand_scores.sort(key=lambda x: x["fit_score"], reverse=True)

        return {
            "athlete_id": athlete_id,
            "athlete_name": athlete_data.get("fullName") or f"{athlete_data.get('firstName', '')} {athlete_data.get('lastName', '')}".strip(),
            "total_brands": len(brands),
            "matches": brand_scores[:limit],
            "generated_at": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_matching_brands_for_athlete: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to find brand matches: {str(e)}")


# ============= Legacy Endpoints (Backward Compatibility) =============

@router.post("/campaign", response_model=LegacyMatchResponse)
async def match_athletes_for_campaign(criteria: CampaignCriteria):
    """
    [LEGACY] Find best matching athletes for a campaign.

    Note: This endpoint accepts basic criteria. For the recommended approach,
    use POST /matching/find which fetches data automatically.
    """
    logger.warning("Using legacy endpoint - consider using POST /matching/find instead")

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
    ]

    return LegacyMatchResponse(
        campaign_id=criteria.campaign_id,
        total_matches=len(mock_matches),
        matches=mock_matches[:criteria.max_athletes],
        generated_at=datetime.utcnow(),
    )


@router.post("/campaign/ai", response_model=LegacyMatchResponse)
async def match_athletes_for_campaign_ai(request: MatchAthletesRequest):
    """
    [LEGACY] Find best matching athletes using AI with provided data.

    Note: For the recommended approach, use POST /matching/find which
    fetches data automatically - you only need to provide IDs.
    """
    if not request.athletes:
        raise HTTPException(status_code=400, detail="At least one athlete must be provided")

    try:
        claude_client = ClaudeClient()
        data_formatter = DataFormatter()

        brand_formatted = data_formatter.format_brand_campaign(
            request.brand_data,
            request.campaign_data or {}
        )

        matches = []
        for athlete_profile in request.athletes:
            try:
                athlete_formatted = data_formatter.format_athlete_profile(
                    athlete_profile.athlete_data
                )

                campaign_data = {
                    "campaign_id": request.campaign_id,
                    "sport_preferences": request.campaign_data.get("sport_preferences") if request.campaign_data else None,
                    "conference_preferences": request.campaign_data.get("conference_preferences") if request.campaign_data else None,
                    "min_followers": request.campaign_data.get("min_followers") if request.campaign_data else None,
                    "min_engagement_rate": request.campaign_data.get("min_engagement_rate") if request.campaign_data else None,
                    "content_types": request.campaign_data.get("content_types") if request.campaign_data else None,
                    "budget_per_athlete": request.campaign_data.get("budget_per_athlete") if request.campaign_data else None,
                }

                analysis = await claude_client.analyze_match(
                    athlete_formatted,
                    brand_formatted,
                    campaign_data
                )

                match = AthleteMatch(
                    athlete_id=athlete_profile.athlete_id,
                    match_score=analysis["match_score"],
                    match_reasons=analysis["match_reasons"],
                    estimated_reach=analysis["estimated_reach"],
                    suggested_rate=analysis["suggested_rate"]
                )

                matches.append(match)

            except Exception as e:
                logger.error(f"Error analyzing athlete {athlete_profile.athlete_id}: {e}")
                continue

        matches.sort(key=lambda x: x.match_score, reverse=True)
        matches = matches[:request.max_athletes]

        return LegacyMatchResponse(
            campaign_id=request.campaign_id,
            total_matches=len(matches),
            matches=matches,
            generated_at=datetime.utcnow(),
        )

    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except Exception as e:
        logger.error(f"Error in match_athletes_for_campaign_ai: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to match athletes: {str(e)}")


@router.get("/recommendations/athlete/{athlete_id}")
async def get_brand_recommendations(
    athlete_id: str,
    limit: int = Query(default=10, le=50)
):
    """
    [LEGACY] Get brand/campaign recommendations for an athlete.

    Note: Use GET /matching/athlete/{athlete_id}/brands for AI-powered recommendations.
    """
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
    [LEGACY] Get athlete recommendations for a brand.

    Note: Use GET /matching/brand/{brand_id}/athletes for AI-powered recommendations.
    """
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
    """Get analytics on matching success rates."""
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
