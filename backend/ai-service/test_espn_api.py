#!/usr/bin/env python3
"""
Test script for ESPN API integration.

This tests the real ESPN API endpoints to see what data we can fetch.
Run with: python test_espn_api.py
"""

import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.stats_aggregator import ESPNClient


def print_json(data, title=""):
    """Pretty print JSON data."""
    if title:
        print(f"\n{'='*60}")
        print(f"  {title}")
        print('='*60)
    print(json.dumps(data, indent=2, default=str))


async def test_search(client: ESPNClient, name: str, school: str = None):
    """Test athlete search."""
    print(f"\n🔍 Searching for: {name}" + (f" at {school}" if school else ""))
    
    results = await client.search_athlete(name, school=school)
    
    if results:
        print(f"   Found {len(results)} results:")
        for r in results[:5]:  # Show first 5
            print(f"   - {r['name']} ({r['position']}) - {r['school']} [ID: {r['id']}]")
        return results
    else:
        print("   No results found")
        return []


async def test_team_roster(client: ESPNClient, school: str, sport: str = "football"):
    """Test team roster fetch."""
    print(f"\n📋 Fetching roster for: {school} ({sport})")
    
    roster = await client.get_team_roster(school, sport)
    
    if roster:
        print(f"   Found {len(roster)} players:")
        
        # Group by position
        positions = {}
        for player in roster:
            pos = player.get('position', 'Unknown')
            if pos not in positions:
                positions[pos] = []
            positions[pos].append(player)
        
        # Show WRs if football
        if 'WR' in positions:
            print(f"\n   Wide Receivers ({len(positions['WR'])}):")
            for p in positions['WR'][:8]:
                print(f"   - #{p.get('jersey', '?')} {p['name']} ({p.get('year', '')})")
        
        # Show position summary
        print(f"\n   Position breakdown:")
        for pos, players in sorted(positions.items()):
            print(f"   - {pos}: {len(players)} players")
        
        return roster
    else:
        print("   Could not fetch roster")
        return []


async def test_athlete_stats(client: ESPNClient, athlete_id: str, sport: str = "football"):
    """Test athlete stats fetch."""
    print(f"\n📊 Fetching stats for athlete ID: {athlete_id}")
    
    data = await client.get_athlete_stats(athlete_id, sport)
    
    if data:
        info = data.get('athlete_info', {})
        stats = data.get('stats', {})
        
        print(f"   Name: {info.get('name')}")
        print(f"   Team: {info.get('team')}")
        print(f"   Position: {info.get('position')}")
        print(f"   Jersey: #{info.get('jersey', 'N/A')}")
        
        if stats:
            print(f"\n   Stats categories: {list(stats.keys())}")
            for cat, cat_stats in stats.items():
                print(f"\n   {cat.upper()}:")
                for stat_name, value in list(cat_stats.items())[:10]:
                    print(f"   - {stat_name}: {value}")
        else:
            print("   No stats available in response")
        
        return data
    else:
        print("   Could not fetch athlete stats")
        return None


async def test_team_stats(client: ESPNClient, school: str, sport: str = "football"):
    """Test team statistics."""
    print(f"\n📈 Fetching team stats for: {school}")
    
    data = await client.get_team_statistics(school, sport)
    
    if data:
        print(f"   Got team statistics!")
        # Show structure
        if isinstance(data, dict):
            print(f"   Keys: {list(data.keys())}")
            
            # Look for player stats
            if 'results' in data:
                for result in data.get('results', {}).get('stats', {}).get('categories', []):
                    print(f"\n   Category: {result.get('name')}")
                    for stat in result.get('stats', [])[:5]:
                        print(f"   - {stat.get('name')}: {stat.get('displayValue')}")
        
        return data
    else:
        print("   Could not fetch team statistics")
        return None


async def main():
    """Run all ESPN API tests."""
    print("\n" + "🏈 " * 20)
    print("\n  ESPN API INTEGRATION TEST")
    print("\n" + "🏈 " * 20)
    
    client = ESPNClient()
    
    # Test 1: Search for athletes
    print("\n" + "="*60)
    print("  TEST 1: ATHLETE SEARCH")
    print("="*60)
    
    # Search for some known players
    searches = [
        ("Travis Hunter", "Colorado"),
        ("Jalen Milroe", "Alabama"),
        ("Fresno State", None),  # General search
    ]
    
    for name, school in searches:
        await test_search(client, name, school)
    
    # Test 2: Team roster
    print("\n" + "="*60)
    print("  TEST 2: TEAM ROSTER")
    print("="*60)
    
    teams = ["Fresno State", "Alabama", "Ohio State"]
    
    rosters = {}
    for team in teams:
        roster = await test_team_roster(client, team)
        if roster:
            rosters[team] = roster
    
    # Test 3: Athlete stats (if we found any)
    print("\n" + "="*60)
    print("  TEST 3: ATHLETE STATS")
    print("="*60)
    
    # Try some known athlete IDs
    test_ids = [
        "4567048",  # Example - may need to find real ones from search
        "4429013",  # Another example
    ]
    
    # Also try IDs from roster if we got any
    if rosters.get("Fresno State"):
        wr_ids = [p['id'] for p in rosters["Fresno State"] if p.get('position') == 'WR'][:2]
        test_ids.extend(wr_ids)
    
    for athlete_id in test_ids:
        if athlete_id:
            await test_athlete_stats(client, athlete_id)
    
    # Test 4: Team statistics
    print("\n" + "="*60)
    print("  TEST 4: TEAM STATISTICS")
    print("="*60)
    
    await test_team_stats(client, "Fresno State")
    
    print("\n" + "="*60)
    print("  TESTS COMPLETE")
    print("="*60)
    print("""
  Summary:
  - If search works, we can find athletes by name
  - If roster works, we can get all teammates for comparison
  - If athlete stats work, we have the core data we need
  - If team stats work, we have additional aggregated data
  
  Next steps based on what works:
  1. If ESPN has gaps, try College Football Data API (free)
  2. Add Hudl for advanced film stats
  3. Manual input for anything missing
""")


if __name__ == "__main__":
    asyncio.run(main())

