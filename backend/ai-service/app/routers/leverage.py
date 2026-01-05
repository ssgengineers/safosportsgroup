"""
Athlete Leverage Calculator API

Provides endpoints for:
- Searching for athletes
- Aggregating stats from multiple sources
- Comparing against teammates
- Generating leverage reports for NIL negotiations
"""

import logging
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from app.services.stats_aggregator import (
    StatsAggregator, 
    StatsComparator,
    AthleteStats,
    Sport,
    DataSource,
    SPORT_STATS
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/leverage")


# ============= Enums =============

class SportType(str, Enum):
    """Sport types for API."""
    FOOTBALL = "football"
    BASKETBALL = "basketball"
    BASEBALL = "baseball"
    SOCCER = "soccer"
    VOLLEYBALL = "volleyball"


# ============= Request/Response Models =============

class AthleteSearchRequest(BaseModel):
    """Request to search for an athlete."""
    name: str = Field(..., description="Athlete's name")
    school: Optional[str] = Field(None, description="School name")
    sport: Optional[SportType] = Field(None, description="Sport type")


class AthleteSearchResult(BaseModel):
    """Search result for an athlete."""
    athlete_id: str
    name: str
    school: str
    sport: str
    position: str
    image_url: Optional[str] = None


class FetchStatsRequest(BaseModel):
    """Request to fetch/aggregate stats for an athlete."""
    athlete_id: str = Field(..., description="Athlete ID")
    name: str = Field(..., description="Athlete's full name")
    school: str = Field(..., description="School name")
    sport: SportType = Field(..., description="Sport type")
    position: str = Field(..., description="Playing position")
    season: str = Field("2024", description="Season year")
    manual_stats: Optional[Dict[str, Any]] = Field(None, description="Manually provided stats")


class StatInfo(BaseModel):
    """Information about a stat."""
    name: str
    value: Any
    source: str
    category: str


class StatsResponse(BaseModel):
    """Response containing athlete stats."""
    athlete_id: str
    name: str
    school: str
    sport: str
    position: str
    season: str
    stats: Dict[str, Dict[str, Any]]
    sources: Dict[str, str]
    missing_stats: List[str]
    fetched_at: datetime


class MissingStatsResponse(BaseModel):
    """Response showing what stats are missing."""
    athlete_id: str
    sport: str
    position: str
    missing_stats: List[str]
    stat_definitions: Dict[str, List[str]]


class CompareRequest(BaseModel):
    """Request to compare athlete against teammates."""
    athlete_id: str = Field(..., description="Athlete ID to compare")
    athlete_stats: Dict[str, Any] = Field(..., description="Athlete's stats")
    teammate_stats: List[Dict[str, Any]] = Field(..., description="List of teammate stats")


class RankingInfo(BaseModel):
    """Ranking information for a stat."""
    rank: int
    total: int
    value: float
    team_average: float
    is_top: bool


class ComparisonSummary(BaseModel):
    """Summary of comparison results."""
    total_categories: int
    first_place_count: int
    top_two_count: int
    excel_categories: List[str]
    performance_vs_team_avg: float
    comparison_count: int


class ComparisonResponse(BaseModel):
    """Response containing comparison results."""
    athlete_id: str
    rankings: Dict[str, RankingInfo]
    percentiles: Dict[str, float]
    summary: ComparisonSummary
    generated_at: datetime


class LeverageReport(BaseModel):
    """Full leverage report for negotiations."""
    athlete_id: str
    athlete_name: str
    school: str
    sport: str
    position: str
    season: str
    
    # Stats summary
    stats_summary: Dict[str, Any]
    
    # Rankings
    rankings: Dict[str, RankingInfo]
    percentiles: Dict[str, float]
    comparison_summary: ComparisonSummary
    
    # Leverage content
    leverage_statement: str
    key_strengths: List[str]
    suggested_rate_range: Optional[Dict[str, float]] = None
    
    # Metadata
    generated_at: datetime
    data_sources: List[str]


class ManualStatsInput(BaseModel):
    """Request to add manual stats."""
    athlete_id: str
    stats: Dict[str, Any] = Field(..., description="Stats to add manually")


# ============= Endpoints =============

@router.get("/sports")
async def get_supported_sports():
    """
    Get list of supported sports and their stat categories.
    """
    return {
        "sports": [
            {
                "id": sport.value,
                "name": sport.name.title(),
                "stat_categories": list(stats.keys()),
                "stats_per_category": {cat: stat_list for cat, stat_list in stats.items()}
            }
            for sport, stats in SPORT_STATS.items()
        ]
    }


@router.post("/search", response_model=List[AthleteSearchResult])
async def search_athlete(request: AthleteSearchRequest):
    """
    Search for an athlete by name, school, and/or sport.
    
    Returns a list of potential matches from ESPN and other sources.
    """
    aggregator = StatsAggregator()
    
    results = await aggregator.search_athlete(
        name=request.name,
        school=request.school,
        sport=request.sport.value if request.sport else None
    )
    
    # For now, return mock data if no results
    if not results:
        # Return empty list - frontend should prompt for manual entry
        return []
    
    return [
        AthleteSearchResult(
            athlete_id=r.get("id", ""),
            name=r.get("name", ""),
            school=r.get("school", ""),
            sport=r.get("sport", ""),
            position=r.get("position", ""),
            image_url=r.get("image_url")
        )
        for r in results
    ]


@router.post("/fetch-stats", response_model=StatsResponse)
async def fetch_stats(request: FetchStatsRequest):
    """
    Fetch and aggregate stats for an athlete from all available sources.
    
    This endpoint:
    1. Fetches basic stats from ESPN
    2. Fetches advanced stats from Hudl (if available)
    3. Applies any manually provided stats
    4. Returns combined stats with source tracking
    """
    aggregator = StatsAggregator()
    
    # Convert sport type
    sport = Sport(request.sport.value)
    
    athlete_stats = await aggregator.aggregate_stats(
        athlete_id=request.athlete_id,
        name=request.name,
        school=request.school,
        sport=sport,
        position=request.position,
        season=request.season,
        manual_stats=request.manual_stats
    )
    
    return StatsResponse(
        athlete_id=athlete_stats.athlete_id,
        name=athlete_stats.name,
        school=athlete_stats.school,
        sport=athlete_stats.sport.value,
        position=athlete_stats.position,
        season=athlete_stats.season,
        stats=athlete_stats.stats,
        sources={k: v.value for k, v in athlete_stats.sources.items()},
        missing_stats=athlete_stats.missing_stats,
        fetched_at=datetime.utcnow()
    )


@router.get("/missing-stats/{athlete_id}")
async def get_missing_stats(
    athlete_id: str,
    sport: SportType,
    position: str
):
    """
    Get list of stats that are missing and need manual input.
    
    Returns the stat definitions for the athlete's sport and position.
    """
    sport_enum = Sport(sport.value)
    stat_definitions = SPORT_STATS.get(sport_enum, {})
    
    # Filter to position-relevant categories
    position_lower = position.lower()
    relevant_categories = []
    
    if sport_enum == Sport.FOOTBALL:
        if any(p in position_lower for p in ["qb", "quarterback"]):
            relevant_categories = ["passing", "rushing"]
        elif any(p in position_lower for p in ["rb", "running", "back"]):
            relevant_categories = ["rushing", "receiving"]
        elif any(p in position_lower for p in ["wr", "receiver", "wide"]):
            relevant_categories = ["receiving"]
        elif any(p in position_lower for p in ["te", "tight", "end"]):
            relevant_categories = ["receiving"]
        elif any(p in position_lower for p in ["db", "corner", "safety", "linebacker", "defensive"]):
            relevant_categories = ["defense"]
        else:
            relevant_categories = list(stat_definitions.keys())
    else:
        relevant_categories = list(stat_definitions.keys())
    
    filtered_definitions = {
        cat: stat_definitions[cat] 
        for cat in relevant_categories 
        if cat in stat_definitions
    }
    
    # All stats for this position are technically "missing" until provided
    missing = []
    for cat, stats in filtered_definitions.items():
        for stat in stats:
            missing.append(f"{cat}.{stat}")
    
    return MissingStatsResponse(
        athlete_id=athlete_id,
        sport=sport.value,
        position=position,
        missing_stats=missing,
        stat_definitions=filtered_definitions
    )


@router.post("/add-manual-stats")
async def add_manual_stats(request: ManualStatsInput):
    """
    Add manually entered stats for an athlete.
    
    These stats fill gaps not available from ESPN or Hudl.
    """
    # In a real implementation, this would save to database
    return {
        "athlete_id": request.athlete_id,
        "stats_added": list(request.stats.keys()),
        "message": "Stats added successfully"
    }


@router.get("/teammates/{athlete_id}")
async def get_teammates(
    athlete_id: str,
    school: str = Query(..., description="School name"),
    sport: SportType = Query(..., description="Sport type"),
    position: Optional[str] = Query(None, description="Filter by position"),
    season: str = Query("2024", description="Season year")
):
    """
    Get list of teammates for comparison.
    
    Optionally filter by position (e.g., only other WRs).
    """
    aggregator = StatsAggregator()
    sport_enum = Sport(sport.value)
    
    teammates = await aggregator.get_teammates(
        school=school,
        sport=sport_enum,
        position=position,
        season=season
    )
    
    return {
        "athlete_id": athlete_id,
        "school": school,
        "sport": sport.value,
        "position_filter": position,
        "teammates": teammates,
        "total_count": len(teammates)
    }


@router.post("/compare", response_model=ComparisonResponse)
async def compare_to_teammates(request: CompareRequest):
    """
    Compare athlete's stats against teammates.
    
    Returns rankings, percentiles, and summary insights.
    """
    comparator = StatsComparator()
    
    # Convert request data to AthleteStats objects
    # For now, create simple mock structures
    # In production, these would be fetched from database
    
    athlete_stats = AthleteStats(
        athlete_id=request.athlete_id,
        name="Athlete",
        school="School",
        sport=Sport.FOOTBALL,
        position="Position",
        season="2024",
        stats=request.athlete_stats
    )
    
    teammate_stats_list = []
    for i, ts in enumerate(request.teammate_stats):
        teammate = AthleteStats(
            athlete_id=f"teammate-{i}",
            name=f"Teammate {i+1}",
            school="School",
            sport=Sport.FOOTBALL,
            position="Position",
            season="2024",
            stats=ts
        )
        teammate_stats_list.append(teammate)
    
    result = comparator.compare_to_teammates(athlete_stats, teammate_stats_list)
    
    return ComparisonResponse(
        athlete_id=request.athlete_id,
        rankings={
            k: RankingInfo(**v) for k, v in result["rankings"].items()
        },
        percentiles=result["percentiles"],
        summary=ComparisonSummary(**result["summary"]),
        generated_at=datetime.utcnow()
    )


@router.get("/report/{athlete_id}", response_model=LeverageReport)
async def generate_leverage_report(
    athlete_id: str,
    include_pdf: bool = Query(False, description="Include PDF download link")
):
    """
    Generate a full leverage report for an athlete.
    
    This is the main output - combines all stats, comparisons,
    and generates leverage statements for negotiations.
    """
    # In production, fetch from database
    # For now, return a mock report structure
    
    return LeverageReport(
        athlete_id=athlete_id,
        athlete_name="[Athlete Name]",
        school="[School]",
        sport="football",
        position="[Position]",
        season="2024",
        stats_summary={
            "total_stats": 0,
            "from_espn": 0,
            "from_hudl": 0,
            "from_manual": 0
        },
        rankings={},
        percentiles={},
        comparison_summary=ComparisonSummary(
            total_categories=0,
            first_place_count=0,
            top_two_count=0,
            excel_categories=[],
            performance_vs_team_avg=0.0,
            comparison_count=0
        ),
        leverage_statement="Please fetch stats and run comparison first.",
        key_strengths=[],
        suggested_rate_range=None,
        generated_at=datetime.utcnow(),
        data_sources=[]
    )


@router.post("/report/generate")
async def generate_full_report(
    athlete_id: str,
    name: str,
    school: str,
    sport: SportType,
    position: str,
    stats: Dict[str, Any],
    teammate_stats: List[Dict[str, Any]],
    current_rate: Optional[float] = None
):
    """
    Generate a complete leverage report with all data provided.
    
    This endpoint takes all necessary data and generates:
    - Rankings comparison
    - Leverage statement
    - Suggested rate range (if current rate provided)
    """
    comparator = StatsComparator()
    
    # Create athlete stats object
    athlete = AthleteStats(
        athlete_id=athlete_id,
        name=name,
        school=school,
        sport=Sport(sport.value),
        position=position,
        season="2024",
        stats={"provided": stats}
    )
    
    # Create teammate stats objects
    teammates = []
    for i, ts in enumerate(teammate_stats):
        teammate = AthleteStats(
            athlete_id=f"teammate-{i}",
            name=f"Teammate {i+1}",
            school=school,
            sport=Sport(sport.value),
            position=position,
            season="2024",
            stats={"provided": ts}
        )
        teammates.append(teammate)
    
    # Run comparison
    comparison = comparator.compare_to_teammates(athlete, teammates)
    
    # Generate leverage statement
    leverage_statement = comparator.generate_leverage_statement(comparison, name)
    
    # Calculate suggested rate range if current rate provided
    suggested_range = None
    if current_rate:
        perf_diff = comparison["summary"].get("performance_vs_team_avg", 0)
        first_count = comparison["summary"].get("first_place_count", 0)
        
        # Base multiplier on performance
        if first_count >= 3:
            multiplier_low, multiplier_high = 1.3, 1.6
        elif first_count >= 2:
            multiplier_low, multiplier_high = 1.2, 1.4
        elif first_count >= 1:
            multiplier_low, multiplier_high = 1.1, 1.3
        else:
            multiplier_low, multiplier_high = 1.0, 1.15
        
        # Adjust for performance vs average
        if perf_diff > 30:
            multiplier_low += 0.1
            multiplier_high += 0.15
        elif perf_diff > 20:
            multiplier_low += 0.05
            multiplier_high += 0.1
        
        suggested_range = {
            "low": round(current_rate * multiplier_low, -3),  # Round to nearest 1000
            "high": round(current_rate * multiplier_high, -3),
            "current": current_rate
        }
    
    # Build key strengths list
    key_strengths = []
    for stat, data in comparison.get("rankings", {}).items():
        if data.get("is_top"):
            key_strengths.append(f"#1 in {stat.replace('_', ' ').title()}")
    
    return LeverageReport(
        athlete_id=athlete_id,
        athlete_name=name,
        school=school,
        sport=sport.value,
        position=position,
        season="2024",
        stats_summary={
            "total_stats": len(stats),
            "from_espn": 0,
            "from_hudl": 0,
            "from_manual": len(stats)
        },
        rankings={
            k: RankingInfo(**v) for k, v in comparison["rankings"].items()
        },
        percentiles=comparison["percentiles"],
        comparison_summary=ComparisonSummary(**comparison["summary"]),
        leverage_statement=leverage_statement,
        key_strengths=key_strengths,
        suggested_rate_range=suggested_range,
        generated_at=datetime.utcnow(),
        data_sources=["manual"]
    )

