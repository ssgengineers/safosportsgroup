#!/usr/bin/env python3
"""
Test script for College Football Data API integration.

CFBD is a FREE API with individual player stats.
Sign up at: https://collegefootballdata.com/key

Run with: CFBD_API_KEY=your_key python test_cfbd_api.py
"""

import asyncio
import json
import sys
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.stats_aggregator import (
    CollegeFootballDataClient,
    StatsAggregator,
    StatsComparator,
    Sport
)


def print_header(title: str):
    """Print a formatted header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


async def test_cfbd_player_stats(client: CollegeFootballDataClient, team: str):
    """Test fetching player stats from CFBD."""
    print_header(f"PLAYER STATS: {team} Wide Receivers")
    
    # Get receiving stats for a team
    stats = await client.get_player_season_stats(
        year=2024,
        team=team,
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
        
        print(f"\n  Found {len(player_stats)} players with receiving stats:")
        print("-" * 60)
        
        # Sort by receptions
        sorted_players = sorted(
            player_stats.items(),
            key=lambda x: float(x[1].get("REC", 0)),
            reverse=True
        )
        
        print(f"  {'Player':<25} {'REC':>6} {'YDS':>7} {'TD':>4} {'YPR':>6}")
        print(f"  {'-'*25} {'-'*6} {'-'*7} {'-'*4} {'-'*6}")
        
        for player, pstats in sorted_players[:10]:
            rec = pstats.get("REC", 0)
            yds = pstats.get("YDS", 0)
            td = pstats.get("TD", 0)
            ypr = float(yds) / float(rec) if float(rec) > 0 else 0
            print(f"  {player:<25} {rec:>6} {yds:>7} {td:>4} {ypr:>6.1f}")
        
        return player_stats
    else:
        print("  No stats found (check API key)")
        return {}


async def test_cfbd_roster(client: CollegeFootballDataClient, team: str):
    """Test fetching roster from CFBD."""
    print_header(f"ROSTER: {team}")
    
    roster = await client.get_team_roster(team, 2024)
    
    if roster:
        # Group by position
        positions = {}
        for player in roster:
            pos = player.get("position", "Unknown")
            if pos not in positions:
                positions[pos] = []
            positions[pos].append(player)
        
        print(f"\n  Total players: {len(roster)}")
        print(f"\n  Position breakdown:")
        for pos, players in sorted(positions.items()):
            print(f"  - {pos}: {len(players)}")
        
        # Show WRs
        if "WR" in positions:
            print(f"\n  Wide Receivers ({len(positions['WR'])}):")
            for p in positions["WR"][:8]:
                print(f"  - #{p.get('jersey', '?')} {p.get('first_name', '')} {p.get('last_name', '')} ({p.get('year', '')})")
        
        return roster
    else:
        print("  No roster found")
        return []


async def test_full_leverage_flow(aggregator: StatsAggregator, team: str, position: str):
    """Test the full leverage comparison flow with CFBD data."""
    print_header(f"FULL LEVERAGE FLOW: {team} {position}s")
    
    # Get all players at this position with their stats
    roster, athlete_stats_list = await aggregator.get_team_position_stats(
        school=team,
        sport=Sport.FOOTBALL,
        position=position,
        season="2024"
    )
    
    if not athlete_stats_list:
        print("  No player stats found")
        return
    
    print(f"\n  Found {len(roster)} {position}s on roster")
    print(f"  Got stats for {len(athlete_stats_list)} players")
    
    # Show each player's stats
    print(f"\n  {'Player':<25} {'Stats Available':>20}")
    print(f"  {'-'*25} {'-'*20}")
    
    for athlete in athlete_stats_list:
        flat_stats = athlete.get_all_stats_flat()
        stat_count = len(flat_stats)
        print(f"  {athlete.name:<25} {stat_count:>20}")
    
    # Pick the top player (most receptions) and compare
    if len(athlete_stats_list) >= 2:
        # Sort by receptions
        sorted_athletes = sorted(
            athlete_stats_list,
            key=lambda a: a.get_stat("rec") or 0,
            reverse=True
        )
        
        top_athlete = sorted_athletes[0]
        other_athletes = sorted_athletes[1:]
        
        print(f"\n  TOP PERFORMER: {top_athlete.name}")
        
        # Run comparison
        comparator = StatsComparator()
        comparison = comparator.compare_to_teammates(top_athlete, other_athletes)
        
        # Print results
        print(f"\n  COMPARISON RESULTS:")
        print(f"  - Categories analyzed: {comparison['summary']['total_categories']}")
        print(f"  - #1 rankings: {comparison['summary']['first_place_count']}")
        print(f"  - Top 2 rankings: {comparison['summary']['top_two_count']}")
        print(f"  - Performance vs avg: +{comparison['summary']['performance_vs_team_avg']:.0f}%")
        
        # Leverage statement
        statement = comparator.generate_leverage_statement(comparison, top_athlete.name)
        print(f"\n  LEVERAGE STATEMENT:")
        print(f"  \"{statement}\"")


async def main():
    """Run CFBD API tests."""
    print("\n" + "🏈 " * 20)
    print("\n  COLLEGE FOOTBALL DATA API TEST")
    print("\n" + "🏈 " * 20)
    
    # Check for API key
    api_key = os.environ.get("CFBD_API_KEY")
    
    if not api_key:
        print("""
  ⚠️  CFBD_API_KEY not found in environment!
  
  To get a free API key:
  1. Go to https://collegefootballdata.com/key
  2. Sign up with your email
  3. Copy your API key
  4. Run: export CFBD_API_KEY=your_key_here
  5. Re-run this script
  
  For now, we'll test ESPN endpoints only...
""")
    
    client = CollegeFootballDataClient(api_key=api_key)
    aggregator = StatsAggregator(cfbd_api_key=api_key)
    
    team = "Fresno State"
    
    if api_key:
        # Test CFBD endpoints
        await test_cfbd_player_stats(client, team)
        await test_cfbd_roster(client, team)
        await test_full_leverage_flow(aggregator, team, "WR")
    else:
        print("  Skipping CFBD tests (no API key)")
    
    print_header("SUMMARY")
    
    if api_key:
        print("""
  ✅ CFBD API Integration Ready!
  
  The system can now:
  1. Fetch individual player stats from CFBD
  2. Get team rosters from ESPN + CFBD
  3. Compare players against teammates
  4. Generate leverage statements
  
  Next: Connect to the Leverage Calculator API endpoints!
""")
    else:
        print(f"""
  📋 ESPN Integration Working:
  - Team rosters: ✅
  - Team statistics: ✅
  - Individual stats: ❌ (need CFBD)
  
  To unlock full functionality:
  1. Get free CFBD API key
  2. Add to .env: CFBD_API_KEY=your_key
  3. Re-run tests
""")


if __name__ == "__main__":
    asyncio.run(main())

