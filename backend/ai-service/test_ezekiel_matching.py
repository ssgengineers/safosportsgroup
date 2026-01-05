#!/usr/bin/env python3
"""
Test the matching algorithm with real athlete data: Ezekiel Avit
Wide Receiver - Fresno State Bulldogs
"""

import asyncio
import json
from datetime import date

# Test data based on ESPN profile
EZEKIEL_AVIT = {
    "id": "athlete_ezekiel_avit",
    "first_name": "Ezekiel",
    "last_name": "Avit",
    "email": "ezekiel.avit@test.com",
    "date_of_birth": "2004-05-15",  # Estimated - Sophomore
    "location": "Potomac, MD",
    
    # Athletic Background
    "school": "Fresno State",
    "sport": "Football",
    "position": "Wide Receiver",
    "jersey_number": "84",
    "class_year": "Sophomore",
    "height": "6'2\"",
    "weight": "194 lbs",
    
    # 2025 Season Stats
    "stats": {
        "receptions": 28,
        "receiving_yards": 255,
        "touchdowns": 0,
        "yards_per_reception": 9.1,
        "games_played": 13
    },
    
    # Social Media (mock data for testing)
    "social_accounts": [
        {
            "platform": "Instagram",
            "handle": "@ezekiel_avit",
            "followers": 5200,
            "engagement_rate": 4.5
        },
        {
            "platform": "Twitter",
            "handle": "@EzekielAvit",
            "followers": 1800,
            "engagement_rate": 3.2
        },
        {
            "platform": "TikTok",
            "handle": "@ezekiel.avit",
            "followers": 8500,
            "engagement_rate": 6.8
        }
    ],
    
    # Total social reach
    "total_followers": 15500,
    "average_engagement": 4.8,
    
    # Profile details
    "bio": "Wide Receiver at Fresno State | From Potomac, MD | Building my brand one catch at a time 🏈",
    "interests": ["Football", "Fitness", "Fashion", "Gaming", "Music"],
    "content_style": ["Athletic lifestyle", "Training content", "Game highlights"],
    
    # NIL Preferences
    "deal_preferences": {
        "min_compensation": 500,
        "preferred_categories": ["Sports Apparel", "Fitness", "Food & Beverage", "Gaming"],
        "available_for": ["Social Media Posts", "Appearances", "Product Reviews"]
    }
}

# Mock brands that might match with Ezekiel
MOCK_BRANDS = [
    {
        "id": "brand_nike_local",
        "name": "Nike Campus",
        "industry": "Sports Apparel",
        "budget_range": "MEDIUM",  # $1,000 - $5,000
        "target_sports": ["Football", "Basketball", "Track"],
        "target_locations": ["California", "Maryland", "Nationwide"],
        "min_followers": 5000,
        "preferred_engagement": 3.0,
        "campaign_type": "Social Media Posts",
        "brand_voice": "Athletic, motivational, youth-focused",
        "description": "Nike's college campus ambassador program for rising athletes"
    },
    {
        "id": "brand_gatorade",
        "name": "Gatorade",
        "industry": "Food & Beverage",
        "budget_range": "HIGH",  # $5,000 - $15,000
        "target_sports": ["Football", "Basketball", "Soccer"],
        "target_locations": ["Nationwide"],
        "min_followers": 10000,
        "preferred_engagement": 4.0,
        "campaign_type": "Product Reviews",
        "brand_voice": "Performance-driven, scientific, energetic",
        "description": "Fuel your performance with Gatorade"
    },
    {
        "id": "brand_local_gym",
        "name": "Fresno Fitness Club",
        "industry": "Fitness",
        "budget_range": "SMALL",  # $200 - $1,000
        "target_sports": ["Football", "All Sports"],
        "target_locations": ["California", "Fresno"],
        "min_followers": 1000,
        "preferred_engagement": 2.0,
        "campaign_type": "Social Media Posts",
        "brand_voice": "Community-focused, motivational, local",
        "description": "Fresno's premier fitness destination"
    },
    {
        "id": "brand_gaming",
        "name": "Razer Gaming",
        "industry": "Gaming",
        "budget_range": "MEDIUM",
        "target_sports": ["All Sports"],
        "target_locations": ["Nationwide"],
        "min_followers": 8000,
        "preferred_engagement": 5.0,
        "campaign_type": "Social Media Posts",
        "brand_voice": "Edgy, tech-savvy, youth-focused",
        "description": "Gaming gear for athletes who game"
    },
    {
        "id": "brand_chipotle",
        "name": "Chipotle",
        "industry": "Food & Beverage",
        "budget_range": "MEDIUM",
        "target_sports": ["Football", "Basketball"],
        "target_locations": ["Nationwide"],
        "min_followers": 5000,
        "preferred_engagement": 3.5,
        "campaign_type": "Social Media Posts",
        "brand_voice": "Fresh, authentic, athlete-friendly",
        "description": "Real food for real athletes"
    }
]


def calculate_match_score(athlete: dict, brand: dict) -> dict:
    """
    Calculate a match score between athlete and brand.
    Returns score breakdown and total.
    """
    scores = {}
    
    # 1. Sport Match (25 points)
    if athlete["sport"] in brand["target_sports"] or "All Sports" in brand["target_sports"]:
        scores["sport_match"] = 25
    else:
        scores["sport_match"] = 0
    
    # 2. Follower Reach (25 points)
    if athlete["total_followers"] >= brand["min_followers"]:
        # Scale based on how much they exceed minimum
        ratio = min(athlete["total_followers"] / brand["min_followers"], 3)
        scores["follower_reach"] = int(25 * (ratio / 3))
    else:
        scores["follower_reach"] = int(25 * (athlete["total_followers"] / brand["min_followers"]))
    
    # 3. Engagement Rate (20 points)
    if athlete["average_engagement"] >= brand["preferred_engagement"]:
        scores["engagement"] = 20
    else:
        scores["engagement"] = int(20 * (athlete["average_engagement"] / brand["preferred_engagement"]))
    
    # 4. Location Match (15 points)
    athlete_state = athlete["location"].split(",")[-1].strip()
    if "Nationwide" in brand["target_locations"]:
        scores["location"] = 15
    elif any(loc in athlete["location"] or loc == athlete_state for loc in brand["target_locations"]):
        scores["location"] = 15
    elif "California" in brand["target_locations"] and "Fresno" in athlete["school"]:
        scores["location"] = 12
    else:
        scores["location"] = 5
    
    # 5. Interest/Category Match (15 points)
    brand_category = brand["industry"]
    if brand_category in athlete["deal_preferences"]["preferred_categories"]:
        scores["category_match"] = 15
    elif any(interest.lower() in brand_category.lower() for interest in athlete["interests"]):
        scores["category_match"] = 10
    else:
        scores["category_match"] = 5
    
    # Calculate total
    total = sum(scores.values())
    
    return {
        "brand_id": brand["id"],
        "brand_name": brand["name"],
        "scores": scores,
        "total_score": total,
        "match_quality": "Excellent" if total >= 80 else "Good" if total >= 60 else "Fair" if total >= 40 else "Low"
    }


def generate_match_explanation(athlete: dict, brand: dict, match: dict) -> str:
    """Generate a human-readable explanation of why this match works."""
    explanations = []
    
    if match["scores"]["sport_match"] == 25:
        explanations.append(f"✅ {athlete['sport']} is a target sport for {brand['name']}")
    
    if match["scores"]["follower_reach"] >= 20:
        explanations.append(f"✅ Strong social reach ({athlete['total_followers']:,} followers)")
    
    if match["scores"]["engagement"] >= 15:
        explanations.append(f"✅ Great engagement rate ({athlete['average_engagement']}%)")
    
    if match["scores"]["location"] >= 12:
        explanations.append(f"✅ Location match for {brand['name']}'s target market")
    
    if match["scores"]["category_match"] >= 12:
        explanations.append(f"✅ {brand['industry']} aligns with athlete's interests")
    
    return "\n".join(explanations)


def run_matching_test():
    """Run the matching algorithm test."""
    print("=" * 70)
    print("🏈 NIL MATCHING ALGORITHM TEST")
    print("=" * 70)
    print(f"\n📋 ATHLETE PROFILE: {EZEKIEL_AVIT['first_name']} {EZEKIEL_AVIT['last_name']}")
    print(f"   School: {EZEKIEL_AVIT['school']}")
    print(f"   Position: {EZEKIEL_AVIT['position']} #{EZEKIEL_AVIT['jersey_number']}")
    print(f"   Class: {EZEKIEL_AVIT['class_year']}")
    print(f"   From: {EZEKIEL_AVIT['location']}")
    print(f"\n   📊 2025 Season Stats:")
    print(f"      Receptions: {EZEKIEL_AVIT['stats']['receptions']}")
    print(f"      Receiving Yards: {EZEKIEL_AVIT['stats']['receiving_yards']}")
    print(f"      YPR: {EZEKIEL_AVIT['stats']['yards_per_reception']}")
    print(f"\n   📱 Social Media:")
    print(f"      Total Followers: {EZEKIEL_AVIT['total_followers']:,}")
    print(f"      Avg Engagement: {EZEKIEL_AVIT['average_engagement']}%")
    
    print("\n" + "=" * 70)
    print("🎯 BRAND MATCHING RESULTS")
    print("=" * 70)
    
    # Calculate matches for all brands
    matches = []
    for brand in MOCK_BRANDS:
        match = calculate_match_score(EZEKIEL_AVIT, brand)
        match["explanation"] = generate_match_explanation(EZEKIEL_AVIT, brand, match)
        matches.append(match)
    
    # Sort by score
    matches.sort(key=lambda x: x["total_score"], reverse=True)
    
    # Display results
    for i, match in enumerate(matches, 1):
        brand = next(b for b in MOCK_BRANDS if b["id"] == match["brand_id"])
        print(f"\n#{i} {match['brand_name']} - Score: {match['total_score']}/100 ({match['match_quality']})")
        print(f"   Industry: {brand['industry']}")
        print(f"   Budget: {brand['budget_range']}")
        print(f"\n   Score Breakdown:")
        for category, score in match["scores"].items():
            print(f"      {category.replace('_', ' ').title()}: {score}")
        print(f"\n   Why it's a match:")
        for line in match["explanation"].split("\n"):
            print(f"   {line}")
    
    print("\n" + "=" * 70)
    print("✅ TOP RECOMMENDATION")
    print("=" * 70)
    top_match = matches[0]
    top_brand = next(b for b in MOCK_BRANDS if b["id"] == top_match["brand_id"])
    print(f"\n🏆 Best Match: {top_match['brand_name']}")
    print(f"   Match Score: {top_match['total_score']}/100")
    print(f"   Campaign Type: {top_brand['campaign_type']}")
    print(f"   Description: {top_brand['description']}")
    
    return matches


if __name__ == "__main__":
    run_matching_test()

