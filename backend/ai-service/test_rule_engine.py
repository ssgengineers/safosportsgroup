#!/usr/bin/env python3
"""
Test script for the Rule Engine.

This tests the rule-based filtering and scoring WITHOUT needing:
- Claude API key
- Spring Boot backend running
- Database connection

Run with: python test_rule_engine.py
"""

import sys
import os

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.rule_engine import (
    RuleEngine, 
    BrandCriteria, 
    AthleteProfile,
    ScoringWeights
)


# ============= Mock Data =============

MOCK_BRAND = {
    "id": "brand-fitfuel-001",
    "company": "FitFuel Nutrition",
    "industry": "Sports & Fitness",
    "budget": "$50,000 - $100,000",
    "targetAudience": "College athletes, fitness enthusiasts, 18-35",
    "athletePreferences": "Looking for basketball or football athletes with strong social presence",
    "goals": "Promote our new protein bar line to Gen Z athletes",
    "timeline": "Immediate (within 1 month)",
    "description": "Premium sports nutrition brand focused on clean, effective supplements",
}

MOCK_ATHLETES = [
    {
        "id": "athlete-001",
        "firstName": "James",
        "lastName": "Wilson",
        "sport": "Basketball",
        "position": "Shooting Guard",
        "school": "Duke University",
        "conference": "ACC",
        "location": "Durham, NC",
        "dateOfBirth": "2003-05-12",
        "gender": "Male",
        "bio": "4-year starter at Duke, team captain. Passionate about fitness and helping young athletes.",
        "goals": "Build my personal brand while inspiring the next generation",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@jwilson_duke", "followers": "125K"},
            {"platform": "TikTok", "handle": "@jameswilson", "followers": "89K"},
            {"platform": "Twitter/X", "handle": "@jwilson2", "followers": "45K"},
        ],
        "interestTags": ["Fitness", "Fashion", "Sneakers", "Music"],
        "engagementRate": 4.8,
    },
    {
        "id": "athlete-002",
        "firstName": "Aaliyah",
        "lastName": "Williams",
        "sport": "Basketball",
        "position": "Point Guard",
        "school": "University of Georgia",
        "conference": "SEC",
        "location": "Athens, GA",
        "dateOfBirth": "2004-02-18",
        "gender": "Female",
        "bio": "Dedicated to health, wellness, and peak performance. Inspiring female athletes.",
        "goals": "Partner with brands that align with my values of health and empowerment",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@aaliyah_hoops", "followers": "156K"},
            {"platform": "TikTok", "handle": "@aaliyahw", "followers": "78K"},
        ],
        "interestTags": ["Fitness", "Health", "Nutrition", "Wellness"],
        "engagementRate": 4.2,
    },
    {
        "id": "athlete-003",
        "firstName": "Marcus",
        "lastName": "Thompson",
        "sport": "Football",
        "position": "Wide Receiver",
        "school": "Ohio State University",
        "conference": "Big Ten",
        "location": "Columbus, OH",
        "dateOfBirth": "2002-09-03",
        "gender": "Male",
        "bio": "On and off the field, I give 100%. Love gaming and connecting with fans.",
        "goals": "Build a brand around authentic content and gaming",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@marcus_osu", "followers": "95K"},
            {"platform": "Twitch", "handle": "MarcusT_Gaming", "followers": "32K"},
        ],
        "interestTags": ["Sports", "Gaming", "Music", "Technology"],
        "engagementRate": 3.9,
    },
    {
        "id": "athlete-004",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "sport": "Soccer",
        "position": "Midfielder",
        "school": "Stanford University",
        "conference": "Pac-12",
        "location": "Stanford, CA",
        "dateOfBirth": "2003-11-22",
        "gender": "Female",
        "bio": "Stanford Soccer. Passionate about education and empowering young women.",
        "goals": "Work with brands that support women in sports",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@sarahj_stanford", "followers": "180K"},
            {"platform": "YouTube", "handle": "Sarah Johnson Soccer", "followers": "45K"},
        ],
        "interestTags": ["Education", "Empowerment", "Travel", "Lifestyle"],
        "engagementRate": 5.2,
    },
    {
        "id": "athlete-005",
        "firstName": "DeShawn",
        "lastName": "Carter",
        "sport": "Basketball",
        "position": "Center",
        "school": "UCLA",
        "conference": "Pac-12",
        "location": "Los Angeles, CA",
        "dateOfBirth": "2005-01-15",
        "gender": "Male",
        "bio": "Rising star at UCLA. Just getting started on my journey.",
        "goals": "Learn and grow as an athlete and content creator",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@deshawn_ucla", "followers": "8K"},
        ],
        "interestTags": ["Basketball", "Music", "Fashion"],
        "engagementRate": 6.1,
    },
    {
        "id": "athlete-006",
        "firstName": "Tyler",
        "lastName": "Brooks",
        "sport": "Baseball",
        "position": "Pitcher",
        "school": "Clemson University",
        "conference": "ACC",
        "location": "Clemson, SC",
        "dateOfBirth": "2002-06-20",
        "gender": "Male",
        "bio": "Clemson Baseball pitcher. 95+ MPH fastball. Passionate about hunting and fishing.",
        "goals": "Partner with outdoor and sports brands",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@tylerbrooks_33", "followers": "67K"},
            {"platform": "YouTube", "handle": "Tyler Brooks Outdoors", "followers": "23K"},
        ],
        "interestTags": ["Outdoors", "Hunting", "Fishing", "Country Music"],
        "engagementRate": 5.8,
    },
]


def print_header(text: str):
    """Print a formatted header."""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)


def print_athlete_card(athlete: dict, score: float = None, reasons: list = None):
    """Print a formatted athlete card."""
    name = f"{athlete.get('firstName', '')} {athlete.get('lastName', '')}".strip()
    print(f"\n  🏆 {name}")
    print(f"     Sport: {athlete.get('sport')} | School: {athlete.get('school')}")
    print(f"     Conference: {athlete.get('conference')} | Gender: {athlete.get('gender')}")
    
    # Social stats
    accounts = athlete.get('socialAccounts', [])
    total = sum(
        int(a.get('followers', '0').replace('K', '000').replace('M', '000000').replace(',', ''))
        if isinstance(a.get('followers'), str) else a.get('followers', 0)
        for a in accounts
    )
    print(f"     Followers: {total:,} | Engagement: {athlete.get('engagementRate', 0)}%")
    print(f"     Interests: {', '.join(athlete.get('interestTags', []))}")
    
    if score is not None:
        print(f"     📊 SCORE: {score}/100")
    
    if reasons:
        print(f"     Reasons:")
        for r in reasons[:3]:
            print(f"        • {r}")


def test_criteria_extraction():
    """Test that brand criteria is properly extracted."""
    print_header("TEST 1: Brand Criteria Extraction")
    
    criteria = BrandCriteria.from_brand_data(MOCK_BRAND)
    
    print(f"\n  Brand: {criteria.company}")
    print(f"  Industry: {criteria.industry}")
    print(f"  Budget: {criteria.budget} → Tier: {criteria.budget_tier.value}")
    print(f"  Preferred Sports: {criteria.preferred_sports}")
    print(f"  Min Followers: {criteria.min_followers:,}")
    print(f"  Target Tags: {criteria.target_tags}")
    
    assert criteria.company == "FitFuel Nutrition"
    assert "Basketball" in criteria.preferred_sports or "Football" in criteria.preferred_sports
    print("\n  ✅ Criteria extraction PASSED")


def test_hard_filters():
    """Test hard filtering of athletes."""
    print_header("TEST 2: Hard Filters (Pass/Fail)")
    
    rule_engine = RuleEngine()
    criteria = BrandCriteria.from_brand_data(MOCK_BRAND)
    
    print(f"\n  Filter Criteria:")
    print(f"    Sports: {criteria.preferred_sports}")
    print(f"    Min Followers: {criteria.min_followers:,}")
    
    passing, stats = rule_engine.filter_candidates(MOCK_ATHLETES, criteria)
    
    print(f"\n  Results:")
    print(f"    Total Athletes: {stats['total_evaluated']}")
    print(f"    Passed: {stats['passed']}")
    print(f"    Failed (Sport): {stats['failed_sport']}")
    print(f"    Failed (Followers): {stats['failed_followers']}")
    
    print(f"\n  Passing Athletes:")
    for athlete in passing:
        print(f"    ✓ {athlete.name} ({athlete.sport}, {athlete.total_followers:,} followers)")
    
    # Verify Sarah (Soccer) was filtered out
    passing_names = [a.name for a in passing]
    assert "Sarah Johnson" not in passing_names, "Soccer player should be filtered out"
    
    # Verify DeShawn (low followers) was filtered out
    assert "DeShawn Carter" not in passing_names, "Low follower athlete should be filtered out"
    
    print("\n  ✅ Hard filters PASSED")


def test_soft_scoring():
    """Test soft scoring of athletes."""
    print_header("TEST 3: Soft Scoring")
    
    rule_engine = RuleEngine()
    criteria = BrandCriteria.from_brand_data(MOCK_BRAND)
    
    # Filter first
    passing, _ = rule_engine.filter_candidates(MOCK_ATHLETES, criteria)
    
    # Score
    results = rule_engine.score_athletes(passing, criteria)
    
    print(f"\n  Scoring Weights:")
    print(f"    Sport Match: {ScoringWeights.SPORT_MATCH} pts")
    print(f"    Follower Reach: {ScoringWeights.FOLLOWER_REACH} pts")
    print(f"    Engagement: {ScoringWeights.ENGAGEMENT_QUALITY} pts")
    print(f"    Interest Tags: {ScoringWeights.INTEREST_TAG_MATCH} pts")
    print(f"    Geographic: {ScoringWeights.GEOGRAPHIC_FIT} pts")
    
    print(f"\n  Scores:")
    for result in sorted(results, key=lambda x: x.total_score, reverse=True):
        print(f"\n    {result.athlete_name}: {result.total_score}/100")
        print(f"      Components: {result.component_scores}")
        for reason in result.score_reasons[:2]:
            print(f"        • {reason}")
    
    print("\n  ✅ Soft scoring PASSED")


def test_full_pipeline():
    """Test the complete matching pipeline."""
    print_header("TEST 4: Full Matching Pipeline")
    
    rule_engine = RuleEngine()
    
    print(f"\n  Input:")
    print(f"    Brand: {MOCK_BRAND['company']}")
    print(f"    Athletes: {len(MOCK_ATHLETES)} total")
    
    # Run full pipeline
    top_candidates, stats = rule_engine.process_matching_request(
        MOCK_ATHLETES,
        MOCK_BRAND,
        top_n=3  # Just get top 3 for demo
    )
    
    print(f"\n  Pipeline Stats:")
    print(f"    Total Evaluated: {stats['filter_stats']['total_evaluated']}")
    print(f"    Passed Filters: {stats['filter_stats']['passed']}")
    print(f"    Top N Selected: {stats['top_n_selected']}")
    print(f"    Score Range: {stats['score_range']['min']:.1f} - {stats['score_range']['max']:.1f}")
    
    print(f"\n  🏅 TOP MATCHES (Would be sent to Claude for AI analysis):")
    
    for i, result in enumerate(top_candidates, 1):
        # Find original athlete data
        original = next((a for a in MOCK_ATHLETES if a['id'] == result.athlete_id), {})
        print(f"\n  #{i} - {result.athlete_name}")
        print(f"      Score: {result.total_score}/100")
        print(f"      Sport: {original.get('sport')} | School: {original.get('school')}")
        print(f"      Why:")
        for reason in result.score_reasons[:3]:
            print(f"        • {reason}")
    
    print("\n  ✅ Full pipeline PASSED")


def test_edge_cases():
    """Test edge cases."""
    print_header("TEST 5: Edge Cases")
    
    rule_engine = RuleEngine()
    
    # Test with no athletes
    print("\n  Testing with empty athlete list...")
    results, stats = rule_engine.process_matching_request([], MOCK_BRAND, top_n=5)
    assert len(results) == 0
    print("    ✓ Empty list handled correctly")
    
    # Test with brand that has no sport preference
    print("\n  Testing with no sport preference...")
    brand_no_pref = {
        "id": "brand-generic",
        "company": "Generic Brand",
        "industry": "Retail & E-commerce",
        "budget": "Under $5,000",
    }
    results, stats = rule_engine.process_matching_request(MOCK_ATHLETES, brand_no_pref, top_n=5)
    assert len(results) > 0
    print(f"    ✓ No sport preference: {len(results)} athletes matched")
    
    print("\n  ✅ Edge cases PASSED")


def main():
    """Run all tests."""
    print("\n" + "🚀 " * 20)
    print("\n  RULE ENGINE TEST SUITE")
    print("  Testing the hybrid matching algorithm")
    print("\n" + "🚀 " * 20)
    
    try:
        test_criteria_extraction()
        test_hard_filters()
        test_soft_scoring()
        test_full_pipeline()
        test_edge_cases()
        
        print_header("ALL TESTS PASSED ✅")
        print("\n  The rule engine is working correctly!")
        print("  Next steps:")
        print("    1. Add ANTHROPIC_API_KEY to .env")
        print("    2. Start Spring Boot backend")
        print("    3. Start AI service: uvicorn app.main:app --reload --port 8000")
        print("    4. Test hybrid endpoint: POST /api/v1/matching/find-hybrid")
        print()
        
    except AssertionError as e:
        print(f"\n  ❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n  ❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

