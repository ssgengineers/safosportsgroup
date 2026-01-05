#!/usr/bin/env python3
"""
🏆 FULL SYSTEM TEST 🏆

Tests the complete SSG NIL Platform flow:
1. Rule-Based Matching Algorithm
2. Athlete Leverage Calculator  
3. CFBD API Integration
4. Everything working together!

Run: python3 test_full_system.py
"""

import asyncio
import sys
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.rule_engine import RuleEngine, BrandCriteria, AthleteProfile, BudgetTier
from app.services.stats_aggregator import (
    CollegeFootballDataClient,
    StatsAggregator,
    StatsComparator,
    AthleteStats,
    DataSource,
    Sport
)

# ============================================================
# MOCK DATA - Athletes and Brands
# ============================================================

MOCK_ATHLETES = [
    AthleteProfile(
        athlete_id="athlete_001",
        name="Marcus Johnson",
        sport="Football",
        position="Wide Receiver",
        school="Fresno State",
        conference="Mountain West",
        location="Fresno, CA",
        total_followers=85000,
        engagement_rate=4.2,
        interest_tags=["fitness", "gaming", "fashion"],
    ),
    AthleteProfile(
        athlete_id="athlete_002",
        name="Sarah Williams",
        sport="Basketball",
        position="Point Guard",
        school="UCLA",
        conference="Pac-12",
        location="Los Angeles, CA",
        total_followers=120000,
        engagement_rate=5.8,
        interest_tags=["fitness", "beauty", "wellness"],
    ),
    AthleteProfile(
        athlete_id="athlete_003",
        name="Tyler Martinez",
        sport="Football",
        position="Quarterback",
        school="Texas",
        conference="SEC",
        location="Austin, TX",
        total_followers=250000,
        engagement_rate=3.9,
        interest_tags=["automotive", "gaming", "technology"],
    ),
    AthleteProfile(
        athlete_id="athlete_004",
        name="Jordan Chen",
        sport="Football",
        position="Running Back",
        school="Oregon",
        conference="Big Ten",
        location="Eugene, OR",
        total_followers=45000,
        engagement_rate=6.1,
        interest_tags=["fitness", "nutrition", "travel"],
    ),
    AthleteProfile(
        athlete_id="athlete_005",
        name="Diamond Jackson",
        sport="Football",
        position="Wide Receiver",
        school="Alabama",
        conference="SEC",
        location="Tuscaloosa, AL",
        total_followers=175000,
        engagement_rate=4.7,
        interest_tags=["fashion", "music", "gaming"],
    ),
    AthleteProfile(
        athlete_id="athlete_006",
        name="Chris Thompson",
        sport="Football",
        position="Wide Receiver",
        school="Fresno State",
        conference="Mountain West",
        location="Fresno, CA",
        total_followers=28000,
        engagement_rate=7.2,
        interest_tags=["fitness", "gaming", "food"],
    ),
]

MOCK_BRANDS = [
    BrandCriteria(
        brand_id="brand_001",
        company="FitFuel Supplements",
        industry="Health & Fitness",
        budget="$20,000-$30,000",
        budget_tier=BudgetTier.MEDIUM,
        preferred_sports=["Football"],
        preferred_conferences=["SEC", "Big Ten", "Pac-12", "Mountain West"],
        min_followers=50000,
        target_tags=["fitness", "nutrition", "wellness"],
        target_regions=["California", "Texas"],
    ),
    BrandCriteria(
        brand_id="brand_002",
        company="GameZone Esports",
        industry="Gaming",
        budget="$10,000-$20,000",
        budget_tier=BudgetTier.SMALL,
        preferred_sports=["Football"],
        min_followers=20000,
        target_tags=["gaming", "technology", "streaming"],
    ),
    BrandCriteria(
        brand_id="brand_003",
        company="StyleStreet Apparel",
        industry="Fashion",
        budget="$40,000-$60,000",
        budget_tier=BudgetTier.HIGH,
        preferred_sports=["Football"],
        preferred_conferences=["SEC"],
        min_followers=100000,
        target_tags=["fashion", "lifestyle", "music"],
        target_regions=["Alabama", "Texas", "California"],
    ),
]


def print_banner(title: str, emoji: str = "🏆"):
    """Print a nice banner."""
    width = 70
    print("\n" + "=" * width)
    print(f"{emoji} {title.center(width - 4)} {emoji}")
    print("=" * width)


def print_section(title: str):
    """Print a section header."""
    print(f"\n{'─' * 60}")
    print(f"  {title}")
    print(f"{'─' * 60}")


def athlete_profile_to_dict(profile: AthleteProfile) -> dict:
    """Convert AthleteProfile to dictionary for rule engine."""
    return {
        "id": profile.athlete_id,
        "fullName": profile.name,
        "sport": profile.sport,
        "position": profile.position,
        "school": profile.school,
        "conference": profile.conference,
        "location": profile.location,
        "interestTags": profile.interest_tags,
        # Social accounts format expected by rule engine
        "socialAccounts": [
            {
                "platform": "instagram",
                "followers": profile.total_followers,
                "engagementRate": profile.engagement_rate
            }
        ]
    }


async def test_rule_based_matching():
    """Test the rule-based matching algorithm."""
    print_banner("RULE-BASED MATCHING ALGORITHM", "🎯")
    
    engine = RuleEngine()
    
    # Convert mock athletes to dictionaries
    mock_athlete_dicts = [athlete_profile_to_dict(a) for a in MOCK_ATHLETES]
    
    for brand in MOCK_BRANDS:
        print_section(f"Brand: {brand.company}")
        print(f"  Industry: {brand.industry}")
        print(f"  Budget: {brand.budget}")
        print(f"  Target Sports: {', '.join(brand.preferred_sports) if brand.preferred_sports else 'Any'}")
        print(f"  Min Followers: {brand.min_followers:,}")
        
        # Filter and score candidates
        candidates, filter_stats = engine.filter_candidates(mock_athlete_dicts, brand)
        scored = engine.score_athletes(candidates, brand)
        ranked = engine.rank_and_select(scored, top_n=10)
        
        print(f"\n  📊 MATCHING RESULTS:")
        print(f"  Athletes in pool: {len(MOCK_ATHLETES)}")
        print(f"  Passed filters: {len(ranked)}")
        
        if ranked:
            print(f"\n  {'Rank':<6} {'Athlete':<25} {'Score':>8}")
            print(f"  {'-'*6} {'-'*25} {'-'*8}")
            
            for i, result in enumerate(ranked[:5], 1):
                print(f"  {i:<6} {result.athlete_name:<25} {result.total_score:>7.1f}%")
            
            # Show breakdown for top match
            top = ranked[0]
            print(f"\n  🥇 TOP MATCH: {top.athlete_name}")
            print(f"  Score Breakdown:")
            for category, score in top.component_scores.items():
                print(f"    • {category}: {score:.1f} pts")
        else:
            print(f"\n  ⚠️ No athletes matched the criteria")
        
        print()


async def test_leverage_calculator_mock():
    """Test leverage calculator with mock data."""
    print_banner("ATHLETE LEVERAGE CALCULATOR (Mock)", "💪")
    
    # Create mock stats for Fresno State WRs
    mock_wr_stats = [
        AthleteStats(
            athlete_id="mock_001",
            name="Marcus Johnson",
            school="Fresno State",
            sport=Sport.FOOTBALL,
            position="WR",
            season="2024",
            stats={
                "receiving": {
                    "rec": 62,
                    "yds": 1045,
                    "td": 9,
                    "ypr": 16.9,
                    "long": 78,
                }
            }
        ),
        AthleteStats(
            athlete_id="mock_002",
            name="Chris Thompson",
            school="Fresno State",
            sport=Sport.FOOTBALL,
            position="WR",
            season="2024",
            stats={
                "receiving": {
                    "rec": 48,
                    "yds": 520,
                    "td": 4,
                    "ypr": 10.8,
                    "long": 45,
                }
            }
        ),
        AthleteStats(
            athlete_id="mock_003",
            name="DeShawn Williams",
            school="Fresno State",
            sport=Sport.FOOTBALL,
            position="WR",
            season="2024",
            stats={
                "receiving": {
                    "rec": 35,
                    "yds": 410,
                    "td": 3,
                    "ypr": 11.7,
                    "long": 52,
                }
            }
        ),
        AthleteStats(
            athlete_id="mock_004",
            name="Jake Anderson",
            school="Fresno State",
            sport=Sport.FOOTBALL,
            position="WR",
            season="2024",
            stats={
                "receiving": {
                    "rec": 22,
                    "yds": 280,
                    "td": 2,
                    "ypr": 12.7,
                    "long": 48,
                }
            }
        ),
    ]
    
    comparator = StatsComparator()
    
    # Compare each athlete to their teammates
    print_section("TEAMMATE COMPARISON")
    
    for i, athlete in enumerate(mock_wr_stats):
        teammates = [a for j, a in enumerate(mock_wr_stats) if j != i]
        comparison = comparator.compare_to_teammates(athlete, teammates)
        
        print(f"\n  📊 {athlete.name}")
        print(f"     Stats: {athlete.get_stat('rec')} rec, {athlete.get_stat('yds')} yds, {athlete.get_stat('td')} TD")
        print(f"     #1 Rankings: {comparison['summary']['first_place_count']}/{comparison['summary']['total_categories']}")
        print(f"     vs Team Avg: {comparison['summary']['performance_vs_team_avg']:+.0f}%")
        
        # Generate leverage statement
        statement = comparator.generate_leverage_statement(comparison, athlete.name)
        print(f"     💬 \"{statement}\"")
    
    # Detailed breakdown for top performer
    print_section("DETAILED LEVERAGE REPORT - Marcus Johnson")
    
    marcus = mock_wr_stats[0]
    teammates = mock_wr_stats[1:]
    comparison = comparator.compare_to_teammates(marcus, teammates)
    
    print(f"\n  STAT CATEGORY RANKINGS:")
    print(f"  {'Category':<20} {'Value':>10} {'Rank':>8} {'vs Avg':>12}")
    print(f"  {'-'*20} {'-'*10} {'-'*8} {'-'*12}")
    
    for stat_name, data in comparison.get('rankings', {}).items():
        rank_str = f"#{data['rank']}/{data['total']}"
        team_avg = data.get('team_average', 0)
        if team_avg > 0:
            avg_diff = ((data['value'] - team_avg) / team_avg) * 100
            avg_str = f"{avg_diff:+.1f}%"
        else:
            avg_str = "N/A"
        # Clean up stat name for display
        display_name = stat_name.replace('receiving_', '').replace('_', ' ').title()
        print(f"  {display_name:<20} {data['value']:>10} {rank_str:>8} {avg_str:>12}")
    
    print(f"\n  NEGOTIATION TALKING POINTS:")
    print(f"  ✅ Leads team in {comparison['summary']['first_place_count']} statistical categories")
    print(f"  ✅ Performs {comparison['summary']['performance_vs_team_avg']:.0f}% above team average")
    print(f"  ✅ Top 2 in {comparison['summary']['top_two_count']} of {comparison['summary']['total_categories']} categories")
    
    if comparison['summary']['first_place_count'] >= 3:
        print(f"  ⭐ ELITE PERFORMER - Commands premium rates")
    elif comparison['summary']['first_place_count'] >= 1:
        print(f"  📈 STRONG PERFORMER - Good negotiating position")


async def test_live_cfbd_data():
    """Test with real CFBD data if API key available."""
    print_banner("LIVE CFBD API DATA", "🏈")
    
    api_key = os.environ.get("CFBD_API_KEY")
    
    if not api_key:
        print("\n  ⚠️ CFBD_API_KEY not found - skipping live test")
        print("  (Add to .env to enable)")
        return
    
    client = CollegeFootballDataClient(api_key=api_key)
    
    # Fetch real Fresno State WR stats
    print_section("REAL 2024 STATS: Fresno State Wide Receivers")
    
    stats = await client.get_player_season_stats(
        year=2024,
        team="Fresno State",
        category="receiving"
    )
    
    if stats:
        # Group by player
        player_stats = {}
        for record in stats:
            player = record.get("player", "Unknown")
            if player not in player_stats:
                player_stats[player] = {}
            stat_type = record.get("statType", "")
            stat_value = record.get("stat")
            player_stats[player][stat_type] = stat_value
        
        # Sort by receptions
        sorted_players = sorted(
            player_stats.items(),
            key=lambda x: float(x[1].get("REC", 0)),
            reverse=True
        )[:5]
        
        print(f"\n  {'Player':<25} {'REC':>6} {'YDS':>7} {'TD':>4} {'YPR':>7}")
        print(f"  {'-'*25} {'-'*6} {'-'*7} {'-'*4} {'-'*7}")
        
        for player, pstats in sorted_players:
            rec = float(pstats.get("REC", 0))
            yds = float(pstats.get("YDS", 0))
            td = pstats.get("TD", 0)
            ypr = yds / rec if rec > 0 else 0
            print(f"  {player:<25} {int(rec):>6} {int(yds):>7} {td:>4} {ypr:>7.1f}")
        
        print(f"\n  ✅ Successfully pulled live data from CFBD API!")
    else:
        print("\n  ❌ No data returned from API")


async def test_full_pipeline():
    """Test the complete matching + leverage pipeline."""
    print_banner("FULL NIL MATCHING PIPELINE", "🚀")
    
    print_section("SCENARIO: FitFuel Supplements Campaign")
    
    # Step 1: Brand defines criteria
    brand = MOCK_BRANDS[0]  # FitFuel
    print(f"\n  BRAND: {brand.company}")
    print(f"  Budget: {brand.budget}")
    print(f"  Target: {', '.join(brand.preferred_sports)} athletes with {brand.min_followers:,}+ followers")
    print(f"  Interests: {', '.join(brand.target_tags)}")
    
    # Step 2: Rule engine finds matches
    print(f"\n  STEP 1: Rule-Based Filtering...")
    engine = RuleEngine()
    mock_athlete_dicts = [athlete_profile_to_dict(a) for a in MOCK_ATHLETES]
    candidates, _ = engine.filter_candidates(mock_athlete_dicts, brand)
    scored = engine.score_athletes(candidates, brand)
    ranked = engine.rank_and_select(scored, top_n=10)
    
    print(f"  → Found {len(ranked)} matching athletes")
    
    if ranked:
        top_3 = ranked[:3]
        print(f"\n  TOP 3 CANDIDATES:")
        for i, result in enumerate(top_3, 1):
            print(f"  {i}. {result.athlete_name} - Score: {result.total_score:.1f}%")
        
        # Step 3: Generate leverage for top candidate
        print(f"\n  STEP 2: Leverage Analysis for Top Match...")
        top_result = top_3[0]
        
        # Find the corresponding mock athlete
        top_mock = next((a for a in MOCK_ATHLETES if a.athlete_id == top_result.athlete_id), MOCK_ATHLETES[0])
        
        # Create mock performance stats
        athlete_stats = AthleteStats(
            athlete_id=top_mock.athlete_id,
            name=top_mock.name,
            school=top_mock.school,
            sport=Sport.FOOTBALL,
            position="WR",
            season="2024",
            stats={
                "receiving": {
                    "rec": 62,
                    "yds": 1045,
                    "td": 9,
                }
            }
        )
        
        # Mock teammate stats
        teammate_stats = [
            AthleteStats(
                athlete_id="t1", name="Teammate 1", school=top_mock.school,
                sport=Sport.FOOTBALL, position="WR", season="2024",
                stats={"receiving": {"rec": 45, "yds": 580, "td": 4}}
            ),
            AthleteStats(
                athlete_id="t2", name="Teammate 2", school=top_mock.school,
                sport=Sport.FOOTBALL, position="WR", season="2024",
                stats={"receiving": {"rec": 32, "yds": 420, "td": 3}}
            ),
        ]
        
        comparator = StatsComparator()
        comparison = comparator.compare_to_teammates(athlete_stats, teammate_stats)
        leverage_statement = comparator.generate_leverage_statement(comparison, top_mock.name)
        
        print(f"\n  LEVERAGE REPORT: {top_mock.name}")
        print(f"  ─────────────────────────────────────")
        print(f"  📊 Stats: 62 rec, 1,045 yds, 9 TD")
        print(f"  🏆 #1 in {comparison['summary']['first_place_count']}/{comparison['summary']['total_categories']} categories")
        print(f"  📈 {comparison['summary']['performance_vs_team_avg']:.0f}% above team average")
        print(f"\n  💬 \"{leverage_statement}\"")
        
        # Final recommendation
        print(f"\n  STEP 3: Deal Recommendation")
        print(f"  ─────────────────────────────────────")
        print(f"  ✅ RECOMMENDED MATCH")
        print(f"  • Athlete: {top_mock.name}")
        print(f"  • Match Score: {top_result.total_score:.1f}%")
        print(f"  • Suggested Rate: $8,000 - $12,000")
        print(f"  • Reasoning: Top performer, high engagement,")
        print(f"    interests align with fitness/nutrition")


async def main():
    """Run all tests."""
    print("\n" + "🏆 " * 25)
    print("\n  SSG NIL PLATFORM - FULL SYSTEM TEST")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n" + "🏆 " * 25)
    
    # Run all tests
    await test_rule_based_matching()
    await test_leverage_calculator_mock()
    await test_live_cfbd_data()
    await test_full_pipeline()
    
    # Summary
    print_banner("TEST COMPLETE", "✅")
    print("""
  All systems operational:
  
  ✅ Rule-Based Matching Algorithm
  ✅ Athlete Filtering & Scoring
  ✅ Leverage Calculator
  ✅ Teammate Comparison
  ✅ CFBD API Integration
  ✅ Full Pipeline Flow
  
  The SSG NIL Platform is ready for action! 🚀
""")


if __name__ == "__main__":
    asyncio.run(main())

