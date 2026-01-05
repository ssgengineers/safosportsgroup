#!/usr/bin/env python3
"""
Full Hybrid Matching Test with Claude API

This tests the COMPLETE flow:
1. Rule-based filtering (instant)
2. Rule-based scoring (instant)
3. Claude AI analysis (real API call)

Requirements:
- ANTHROPIC_API_KEY in .env file

Run with: python test_full_hybrid.py
"""

import sys
import os
import asyncio

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services.rule_engine import RuleEngine
from app.services.data_formatter import DataFormatter


# ============= Mock Data =============

MOCK_BRAND = {
    "id": "brand-fitfuel-001",
    "company": "FitFuel Nutrition",
    "industry": "Sports & Fitness",
    "budget": "$50,000 - $100,000",
    "targetAudience": "College athletes, fitness enthusiasts, health-conscious individuals aged 18-35",
    "athletePreferences": "Looking for basketball or football athletes with strong social presence who align with health and fitness values",
    "goals": "Promote our new clean protein bar line to Gen Z athletes. We want authentic partnerships with athletes who genuinely care about nutrition and performance.",
    "description": "FitFuel is a premium sports nutrition brand focused on clean, effective supplements for athletes. We believe in transparency, quality ingredients, and supporting athlete performance naturally.",
    "timeline": "Immediate (within 1 month)",
    "brandValues": ["Health", "Performance", "Authenticity", "Clean Ingredients"],
}

MOCK_ATHLETES = [
    {
        "id": "athlete-001",
        "firstName": "James",
        "lastName": "Wilson",
        "fullName": "James Wilson",
        "sport": "Basketball",
        "position": "Shooting Guard",
        "school": "Duke University",
        "schoolName": "Duke University",
        "conference": "ACC",
        "location": "Durham, NC",
        "hometown": "Durham, NC",
        "dateOfBirth": "2003-05-12",
        "gender": "Male",
        "bio": "4-year starter at Duke, team captain for 2 seasons. Passionate about helping young athletes reach their potential through mentorship and creating authentic content that inspires. Currently pursuing a degree in Business Administration while maintaining a 3.6 GPA. I believe in working hard on and off the court.",
        "goals": "Build my personal brand while inspiring the next generation of athletes",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@jwilson_duke", "followers": 125000, "engagementRate": 4.8},
            {"platform": "TikTok", "handle": "@jameswilson", "followers": 89000, "engagementRate": 5.2},
            {"platform": "Twitter/X", "handle": "@jwilson2", "followers": 45000, "engagementRate": 3.1},
        ],
        "interestTags": ["Fitness", "Fashion", "Sneakers", "Music", "Mentorship"],
        "engagementRate": 4.8,
        "awards": ["2024 ACC All-Conference First Team", "2023 ACC Tournament MVP"],
    },
    {
        "id": "athlete-002",
        "firstName": "Aaliyah",
        "lastName": "Williams",
        "fullName": "Aaliyah Williams",
        "sport": "Basketball",
        "position": "Point Guard",
        "school": "University of Georgia",
        "schoolName": "University of Georgia",
        "conference": "SEC",
        "location": "Athens, GA",
        "hometown": "Atlanta, GA",
        "dateOfBirth": "2004-02-18",
        "gender": "Female",
        "bio": "Dedicated to inspiring the next generation of female athletes. I focus on health, wellness, and peak performance both on and off the court. Nutrition is a huge part of my training - I believe what you put in your body directly affects your performance. Proud to represent UGA and the SEC!",
        "goals": "Partner with brands that align with my values of health, wellness, and female empowerment",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@aaliyah_hoops", "followers": 156000, "engagementRate": 4.2},
            {"platform": "TikTok", "handle": "@aaliyahw", "followers": 78000, "engagementRate": 5.8},
        ],
        "interestTags": ["Fitness", "Health", "Nutrition", "Wellness", "Women in Sports"],
        "engagementRate": 4.2,
        "awards": ["2024 SEC Freshman of the Year", "McDonald's All-American"],
    },
    {
        "id": "athlete-003",
        "firstName": "Marcus",
        "lastName": "Thompson",
        "fullName": "Marcus Thompson",
        "sport": "Football",
        "position": "Wide Receiver",
        "school": "Ohio State University",
        "schoolName": "Ohio State University",
        "conference": "Big Ten",
        "location": "Columbus, OH",
        "hometown": "Detroit, MI",
        "dateOfBirth": "2002-09-03",
        "gender": "Male",
        "bio": "On and off the field, I give 100%. When I'm not training, you'll find me streaming on Twitch or creating content with my gaming setup. Love connecting with fans through authentic content and showing the real side of being a D1 athlete.",
        "goals": "Build a brand around authentic content, gaming, and athlete lifestyle",
        "socialAccounts": [
            {"platform": "Instagram", "handle": "@marcus_osu", "followers": 95000, "engagementRate": 3.9},
            {"platform": "Twitch", "handle": "MarcusT_Gaming", "followers": 32000, "engagementRate": 8.2},
        ],
        "interestTags": ["Sports", "Gaming", "Music", "Technology", "Streaming"],
        "engagementRate": 3.9,
        "awards": ["2024 Big Ten Offensive Player of the Week (x3)"],
    },
]


def print_header(text: str):
    """Print a formatted header."""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)


async def test_full_hybrid_flow():
    """Test the complete hybrid matching flow with Claude."""
    
    print("\n" + "🚀 " * 25)
    print("\n  FULL HYBRID MATCHING TEST")
    print("  Rule-Based Filtering + Claude AI Analysis")
    print("\n" + "🚀 " * 25)
    
    # Check for API key
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        print("\n  ⚠️  WARNING: No ANTHROPIC_API_KEY found in .env")
        print("  The test will run rule-based matching only.")
        print("  To test Claude integration, add your API key to .env")
        use_claude = False
    else:
        print(f"\n  ✓ Claude API key found (ends with ...{api_key[-4:]})")
        use_claude = True
    
    # Initialize services
    rule_engine = RuleEngine()
    data_formatter = DataFormatter()
    
    # ============= STEP 1: Rule-Based Filtering & Scoring =============
    print_header("STEP 1: Rule-Based Filtering & Scoring (Instant)")
    
    print(f"\n  Brand: {MOCK_BRAND['company']}")
    print(f"  Industry: {MOCK_BRAND['industry']}")
    print(f"  Looking for: {MOCK_BRAND['athletePreferences'][:60]}...")
    print(f"\n  Athletes to evaluate: {len(MOCK_ATHLETES)}")
    
    # Run rule engine
    top_candidates, stats = rule_engine.process_matching_request(
        MOCK_ATHLETES,
        MOCK_BRAND,
        top_n=10
    )
    
    print(f"\n  Filter Results:")
    print(f"    Total Evaluated: {stats['filter_stats']['total_evaluated']}")
    print(f"    Passed Filters: {stats['filter_stats']['passed']}")
    print(f"    Failed (Sport): {stats['filter_stats']['failed_sport']}")
    print(f"    Failed (Followers): {stats['filter_stats']['failed_followers']}")
    
    print(f"\n  Top Candidates (Rule-Based Scores):")
    for i, candidate in enumerate(top_candidates, 1):
        print(f"    {i}. {candidate.athlete_name}: {candidate.total_score}/100")
        print(f"       Components: {candidate.component_scores}")
    
    if not use_claude:
        print_header("STEP 2: Claude AI Analysis (SKIPPED - No API Key)")
        print("\n  To enable Claude analysis:")
        print("  1. Get your API key from Eman's doc")
        print("  2. Add to .env: ANTHROPIC_API_KEY=sk-ant-...")
        print("  3. Re-run this test")
        return
    
    # ============= STEP 2: Claude AI Analysis =============
    print_header("STEP 2: Claude AI Analysis (2-3 seconds)")
    
    from app.services.claude_client import ClaudeClient
    
    try:
        claude_client = ClaudeClient()
        print("  ✓ Claude client initialized")
    except ValueError as e:
        print(f"  ✗ Claude client error: {e}")
        return
    
    # Format data for Claude
    brand_formatted = data_formatter.format_brand_campaign(MOCK_BRAND)
    
    # Get original athlete data for top candidates
    top_athlete_ids = {c.athlete_id for c in top_candidates}
    top_athletes_raw = [a for a in MOCK_ATHLETES if a["id"] in top_athlete_ids]
    
    athletes_formatted = []
    for athlete in top_athletes_raw:
        formatted = data_formatter.format_athlete_profile(athlete)
        formatted["athlete_id"] = athlete["id"]
        
        # Add rule score for context
        rule_result = next((c for c in top_candidates if c.athlete_id == athlete["id"]), None)
        if rule_result:
            formatted["rule_score"] = rule_result.total_score
            formatted["rule_reasons"] = rule_result.score_reasons
        
        athletes_formatted.append(formatted)
    
    print(f"\n  Sending {len(athletes_formatted)} candidates to Claude for analysis...")
    print("  (This may take 5-10 seconds)")
    
    # Call Claude
    all_results = []
    
    try:
        batch_results = await claude_client.analyze_batch_matches(
            athletes_formatted,
            brand_formatted,
            {"goals": MOCK_BRAND["goals"]}
        )
        
        for j, result in enumerate(batch_results):
            if j < len(athletes_formatted):
                athlete_id = athletes_formatted[j]["athlete_id"]
                original = next((a for a in MOCK_ATHLETES if a["id"] == athlete_id), {})
                rule_result = next((c for c in top_candidates if c.athlete_id == athlete_id), None)
                
                # Combine scores
                rule_score = rule_result.total_score if rule_result else 50
                ai_score = result.get("match_score", 50)
                final_score = round(rule_score * 0.4 + ai_score * 0.6, 1)
                
                all_results.append({
                    "athlete_id": athlete_id,
                    "name": original.get("fullName", "Unknown"),
                    "sport": original.get("sport"),
                    "school": original.get("school"),
                    "rule_score": rule_score,
                    "ai_score": ai_score,
                    "final_score": final_score,
                    "match_reasons": (rule_result.score_reasons if rule_result else []) + result.get("match_reasons", []),
                    "concerns": result.get("concerns", []),
                    "ai_analysis": result,
                })
        
        print("  ✓ Claude analysis complete!")
        
    except Exception as e:
        print(f"  ✗ Claude API error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # ============= STEP 3: Final Results =============
    print_header("STEP 3: Final Ranked Results")
    
    # Sort by final score
    all_results.sort(key=lambda x: x["final_score"], reverse=True)
    
    print(f"\n  🏆 TOP MATCHES FOR {MOCK_BRAND['company'].upper()}")
    print(f"  " + "-" * 60)
    
    for i, result in enumerate(all_results, 1):
        print(f"\n  #{i} {result['name']}")
        print(f"      Sport: {result['sport']} | School: {result['school']}")
        print(f"      ")
        print(f"      📊 SCORES:")
        print(f"         Rule-Based: {result['rule_score']}/100 (40% weight)")
        print(f"         AI Analysis: {result['ai_score']}/100 (60% weight)")
        print(f"         ─────────────────────────")
        print(f"         FINAL: {result['final_score']}/100")
        print(f"      ")
        print(f"      ✅ WHY THEY MATCH:")
        for reason in result['match_reasons'][:4]:
            print(f"         • {reason}")
        
        if result['concerns']:
            print(f"      ")
            print(f"      ⚠️  CONCERNS:")
            for concern in result['concerns'][:2]:
                print(f"         • {concern}")
    
    print_header("TEST COMPLETE ✅")
    print(f"\n  The hybrid matching algorithm successfully:")
    print(f"    1. Filtered athletes by sport, followers, etc. (instant)")
    print(f"    2. Scored on quantitative factors (instant)")
    print(f"    3. Analyzed with Claude AI for qualitative fit (2-3 sec)")
    print(f"    4. Combined scores (40% rule + 60% AI) for final ranking")
    print()


def main():
    """Run the async test."""
    asyncio.run(test_full_hybrid_flow())


if __name__ == "__main__":
    main()

