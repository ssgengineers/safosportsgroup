#!/usr/bin/env python3
"""
Test script for the Athlete Leverage Calculator.

This demonstrates the full flow using mock data based on the
real example: Fresno State WR negotiating from $60K to $80-100K.

Run with: python test_leverage_calculator.py
"""

import sys
import os
import asyncio

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.stats_aggregator import (
    StatsAggregator, 
    StatsComparator,
    AthleteStats,
    Sport
)


# ============= Mock Data: Fresno State Wide Receivers =============

# The athlete negotiating (has highest 3rd down conversion rate)
ATHLETE = {
    "id": "athlete-fresno-wr-1",
    "name": "John Smith",
    "school": "Fresno State",
    "sport": Sport.FOOTBALL,
    "position": "Wide Receiver",
    "season": "2024",
    "stats": {
        "receiving": {
            "receptions": 78,
            "targets": 108,
            "yards": 1245,
            "touchdowns": 8,
            "yards_per_reception": 15.96,
            "catch_rate": 72.2,
            "third_down_conversion_rate": 87.5,  # His key stat!
            "contested_catches": 12,
            "yards_after_catch": 423,
        }
    },
    "current_rate": 60000,  # Currently getting $60K
}

# His teammates (other WRs at Fresno State)
TEAMMATES = [
    {
        "id": "teammate-wr-2",
        "name": "Marcus Johnson",
        "position": "Wide Receiver",
        "stats": {
            "receiving": {
                "receptions": 52,
                "targets": 78,
                "yards": 720,
                "touchdowns": 5,
                "yards_per_reception": 13.85,
                "catch_rate": 66.7,
                "third_down_conversion_rate": 62.0,
                "contested_catches": 6,
                "yards_after_catch": 280,
            }
        }
    },
    {
        "id": "teammate-wr-3",
        "name": "DeShawn Williams",
        "position": "Wide Receiver",
        "stats": {
            "receiving": {
                "receptions": 45,
                "targets": 72,
                "yards": 580,
                "touchdowns": 4,
                "yards_per_reception": 12.89,
                "catch_rate": 62.5,
                "third_down_conversion_rate": 58.0,
                "contested_catches": 4,
                "yards_after_catch": 195,
            }
        }
    },
    {
        "id": "teammate-wr-4",
        "name": "Tyler Brooks",
        "position": "Wide Receiver",
        "stats": {
            "receiving": {
                "receptions": 38,
                "targets": 58,
                "yards": 510,
                "touchdowns": 3,
                "yards_per_reception": 13.42,
                "catch_rate": 65.5,
                "third_down_conversion_rate": 55.0,
                "contested_catches": 5,
                "yards_after_catch": 165,
            }
        }
    },
    {
        "id": "teammate-wr-5",
        "name": "Chris Martinez",
        "position": "Wide Receiver",
        "stats": {
            "receiving": {
                "receptions": 28,
                "targets": 45,
                "yards": 385,
                "touchdowns": 2,
                "yards_per_reception": 13.75,
                "catch_rate": 62.2,
                "third_down_conversion_rate": 48.0,
                "contested_catches": 3,
                "yards_after_catch": 120,
            }
        }
    },
    {
        "id": "teammate-wr-6",
        "name": "Antonio Davis",
        "position": "Wide Receiver",
        "stats": {
            "receiving": {
                "receptions": 22,
                "targets": 38,
                "yards": 295,
                "touchdowns": 1,
                "yards_per_reception": 13.41,
                "catch_rate": 57.9,
                "third_down_conversion_rate": 42.0,
                "contested_catches": 2,
                "yards_after_catch": 85,
            }
        }
    },
]


def print_header(text: str):
    """Print a formatted header."""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)


def print_report(report: dict):
    """Print the leverage report in a nice format."""
    print("\n" + "━" * 70)
    print(f"  LEVERAGE REPORT: {report['athlete_name']} - {report['position']}, {report['school']}")
    print("━" * 70)
    
    # Rankings
    print(f"\n  STAT RANKINGS (vs. {report['comparison_count']} {report['school']} Wide Receivers)")
    print("  " + "─" * 60)
    
    for stat_name, ranking in report['rankings'].items():
        # Clean up stat name for display
        display_name = stat_name.replace('receiving_', '').replace('_', ' ').title()
        
        # Add trophy emoji for #1
        rank_display = f"#{ranking['rank']}"
        if ranking['is_top']:
            rank_display = f"#{ranking['rank']} 🏆"
        
        # Format value
        if 'rate' in stat_name.lower() or 'percentage' in stat_name.lower():
            value_display = f"{ranking['value']:.1f}%"
            avg_display = f"{ranking['team_avg']:.1f}%"
        else:
            value_display = f"{ranking['value']:.1f}" if isinstance(ranking['value'], float) else str(ranking['value'])
            avg_display = f"{ranking['team_avg']:.1f}" if isinstance(ranking['team_avg'], float) else str(ranking['team_avg'])
        
        print(f"  {display_name:30s} {rank_display:10s} {value_display:10s} (Team avg: {avg_display})")
    
    # Summary
    print(f"\n  SUMMARY")
    print("  " + "─" * 60)
    summary = report['summary']
    print(f"  ✅ Ranks #1 in {summary['first_place_count']} of {summary['total_categories']} categories")
    print(f"  ✅ Top 2 in {summary['top_two_count']} categories")
    print(f"  ✅ {summary['performance_vs_avg']:.0f}% above team average overall")
    
    # Leverage Statement
    print(f"\n  LEVERAGE STATEMENT")
    print("  " + "─" * 60)
    # Word wrap the statement
    words = report['leverage_statement'].split()
    lines = []
    current_line = "  "
    for word in words:
        if len(current_line) + len(word) + 1 > 68:
            lines.append(current_line)
            current_line = "  " + word
        else:
            current_line += " " + word if current_line != "  " else word
    lines.append(current_line)
    for line in lines:
        print(f"  {line}")
    
    # Suggested Rate
    if report.get('suggested_range'):
        print(f"\n  SUGGESTED NEGOTIATION RANGE")
        print("  " + "─" * 60)
        sr = report['suggested_range']
        print(f"  Current Rate:  ${sr['current']:,.0f}")
        print(f"  Suggested:     ${sr['low']:,.0f} - ${sr['high']:,.0f}")
    
    print("\n" + "━" * 70)


async def test_leverage_calculator():
    """Test the complete leverage calculator flow."""
    
    print("\n" + "🏈 " * 20)
    print("\n  ATHLETE LEVERAGE CALCULATOR TEST")
    print("  Fresno State WR Negotiation Example")
    print("\n" + "🏈 " * 20)
    
    print_header("SCENARIO")
    print(f"""
  Athlete: {ATHLETE['name']}
  School: {ATHLETE['school']}
  Position: {ATHLETE['position']}
  Current Rate: ${ATHLETE['current_rate']:,}
  Desired Rate: $80,000 - $100,000
  
  Key Argument: "I have the highest 3rd down conversion rate 
                 on the team - how do I prove my worth?"
""")
    
    # Create AthleteStats objects
    athlete_stats = AthleteStats(
        athlete_id=ATHLETE["id"],
        name=ATHLETE["name"],
        school=ATHLETE["school"],
        sport=ATHLETE["sport"],
        position=ATHLETE["position"],
        season=ATHLETE["season"],
        stats=ATHLETE["stats"]
    )
    
    teammate_stats = []
    for t in TEAMMATES:
        ts = AthleteStats(
            athlete_id=t["id"],
            name=t["name"],
            school=ATHLETE["school"],
            sport=ATHLETE["sport"],
            position=t["position"],
            season=ATHLETE["season"],
            stats=t["stats"]
        )
        teammate_stats.append(ts)
    
    print_header("STEP 1: Load Stats")
    print(f"\n  Athlete stats loaded: {len(ATHLETE['stats']['receiving'])} receiving stats")
    print(f"  Teammates loaded: {len(TEAMMATES)} other Wide Receivers")
    
    # Run comparison
    print_header("STEP 2: Compare Against Teammates")
    
    comparator = StatsComparator()
    comparison = comparator.compare_to_teammates(athlete_stats, teammate_stats)
    
    print(f"\n  Comparison complete!")
    print(f"  Categories analyzed: {comparison['summary']['total_categories']}")
    print(f"  #1 rankings: {comparison['summary']['first_place_count']}")
    
    # Generate leverage statement
    print_header("STEP 3: Generate Leverage Statement")
    
    leverage_statement = comparator.generate_leverage_statement(
        comparison, 
        ATHLETE["name"]
    )
    
    print(f"\n  {leverage_statement}")
    
    # Calculate suggested rate
    print_header("STEP 4: Calculate Suggested Rate Range")
    
    current_rate = ATHLETE["current_rate"]
    first_count = comparison["summary"]["first_place_count"]
    perf_diff = comparison["summary"]["performance_vs_team_avg"]
    
    # Base multiplier on performance
    if first_count >= 5:
        multiplier_low, multiplier_high = 1.4, 1.7
    elif first_count >= 3:
        multiplier_low, multiplier_high = 1.3, 1.5
    elif first_count >= 2:
        multiplier_low, multiplier_high = 1.2, 1.4
    else:
        multiplier_low, multiplier_high = 1.1, 1.25
    
    # Adjust for performance vs average
    if perf_diff > 40:
        multiplier_low += 0.1
        multiplier_high += 0.15
    elif perf_diff > 25:
        multiplier_low += 0.05
        multiplier_high += 0.1
    
    suggested_low = round(current_rate * multiplier_low, -3)
    suggested_high = round(current_rate * multiplier_high, -3)
    
    print(f"\n  Current Rate: ${current_rate:,}")
    print(f"  First Place Rankings: {first_count}")
    print(f"  Performance vs Avg: +{perf_diff:.0f}%")
    print(f"  Multiplier Range: {multiplier_low:.2f}x - {multiplier_high:.2f}x")
    print(f"  Suggested Range: ${suggested_low:,} - ${suggested_high:,}")
    
    # Build full report
    print_header("STEP 5: Full Leverage Report")
    
    report = {
        "athlete_id": ATHLETE["id"],
        "athlete_name": ATHLETE["name"],
        "school": ATHLETE["school"],
        "position": ATHLETE["position"],
        "comparison_count": len(TEAMMATES) + 1,
        "rankings": {
            stat: {
                "rank": data["rank"],
                "value": data["value"],
                "team_avg": data["team_average"],
                "is_top": data["is_top"]
            }
            for stat, data in comparison["rankings"].items()
        },
        "summary": {
            "total_categories": comparison["summary"]["total_categories"],
            "first_place_count": comparison["summary"]["first_place_count"],
            "top_two_count": comparison["summary"]["top_two_count"],
            "performance_vs_avg": comparison["summary"]["performance_vs_team_avg"],
        },
        "leverage_statement": leverage_statement,
        "suggested_range": {
            "current": current_rate,
            "low": suggested_low,
            "high": suggested_high
        }
    }
    
    print_report(report)
    
    print_header("TEST COMPLETE ✅")
    print(f"""
  The Athlete Leverage Calculator successfully:
  
  1. Loaded athlete and teammate stats
  2. Compared across {comparison['summary']['total_categories']} statistical categories
  3. Identified {comparison['summary']['first_place_count']} categories where athlete ranks #1
  4. Calculated {comparison['summary']['performance_vs_team_avg']:.0f}% above team average
  5. Generated leverage statement for negotiations
  6. Suggested rate range: ${suggested_low:,} - ${suggested_high:,}
  
  This gives the athlete DATA-BACKED justification for their ask!
""")


def main():
    """Run the async test."""
    asyncio.run(test_leverage_calculator())


if __name__ == "__main__":
    main()

