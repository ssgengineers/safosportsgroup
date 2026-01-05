"""
Stats Aggregator Service

Aggregates athlete statistics from multiple sources:
1. ESPN API (basic stats)
2. Hudl API (advanced stats) - Future
3. Manual input (fallback for gaps)

This powers the Athlete Leverage Calculator.
"""

import logging
import os
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, field
from enum import Enum
import httpx

logger = logging.getLogger(__name__)


class DataSource(Enum):
    """Source of stat data."""
    ESPN = "espn"
    CFBD = "cfbd"  # College Football Data API
    HUDL = "hudl"
    MANUAL = "manual"
    CALCULATED = "calculated"


class Sport(Enum):
    """Supported sports."""
    FOOTBALL = "football"
    BASKETBALL = "basketball"
    BASEBALL = "baseball"
    SOCCER = "soccer"
    VOLLEYBALL = "volleyball"
    TRACK = "track"


# Sport-specific stat definitions
SPORT_STATS = {
    Sport.FOOTBALL: {
        "passing": ["completions", "attempts", "yards", "touchdowns", "interceptions", "rating"],
        "rushing": ["attempts", "yards", "touchdowns", "yards_per_carry", "fumbles"],
        "receiving": ["receptions", "targets", "yards", "touchdowns", "yards_per_reception", "catch_rate"],
        "defense": ["tackles", "sacks", "interceptions", "forced_fumbles", "passes_defended"],
        "special_teams": ["field_goals_made", "field_goals_attempted", "punts", "punt_average"],
    },
    Sport.BASKETBALL: {
        "scoring": ["points", "field_goals_made", "field_goals_attempted", "fg_percentage", 
                   "three_pointers_made", "three_pointers_attempted", "three_point_percentage",
                   "free_throws_made", "free_throws_attempted", "ft_percentage"],
        "rebounds": ["offensive_rebounds", "defensive_rebounds", "total_rebounds"],
        "playmaking": ["assists", "turnovers", "assist_to_turnover_ratio"],
        "defense": ["steals", "blocks", "fouls"],
        "efficiency": ["minutes", "plus_minus", "efficiency_rating"],
    },
    Sport.BASEBALL: {
        "batting": ["games", "at_bats", "runs", "hits", "doubles", "triples", "home_runs", 
                   "rbi", "walks", "strikeouts", "batting_average", "on_base_percentage", 
                   "slugging_percentage", "ops"],
        "pitching": ["wins", "losses", "era", "games", "games_started", "saves", 
                    "innings_pitched", "hits_allowed", "runs_allowed", "earned_runs",
                    "walks", "strikeouts", "whip"],
        "fielding": ["games", "putouts", "assists", "errors", "fielding_percentage"],
    },
}


@dataclass
class AthleteStats:
    """Container for athlete statistics."""
    athlete_id: str
    name: str
    school: str
    sport: Sport
    position: str
    season: str
    
    # Stats organized by category
    stats: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    
    # Track where each stat came from
    sources: Dict[str, DataSource] = field(default_factory=dict)
    
    # Stats we couldn't find (need manual input)
    missing_stats: List[str] = field(default_factory=list)
    
    def get_stat(self, stat_name: str) -> Optional[Any]:
        """Get a stat value by name."""
        for category, stats in self.stats.items():
            if stat_name in stats:
                return stats[stat_name]
        return None
    
    def set_stat(self, category: str, stat_name: str, value: Any, source: DataSource):
        """Set a stat value with source tracking."""
        if category not in self.stats:
            self.stats[category] = {}
        self.stats[category][stat_name] = value
        self.sources[f"{category}.{stat_name}"] = source
    
    def get_all_stats_flat(self) -> Dict[str, Any]:
        """Get all stats as a flat dictionary."""
        flat = {}
        for category, stats in self.stats.items():
            for stat_name, value in stats.items():
                flat[f"{category}_{stat_name}"] = value
        return flat


@dataclass
class TeamRoster:
    """Container for team roster data."""
    school: str
    sport: Sport
    season: str
    athletes: List[Dict[str, Any]] = field(default_factory=list)


class ESPNClient:
    """
    Client for fetching data from ESPN's undocumented but public API.
    
    ESPN has several accessible endpoints:
    - Search: https://site.api.espn.com/apis/common/v3/search
    - Athletes: https://site.api.espn.com/apis/site/v2/sports/{sport}/college-{sport}/athletes/{id}
    - Teams: https://site.api.espn.com/apis/site/v2/sports/{sport}/college-{sport}/teams/{id}
    - Scoreboard: https://site.api.espn.com/apis/site/v2/sports/{sport}/college-{sport}/scoreboard
    """
    
    BASE_URL = "https://site.api.espn.com/apis/site/v2/sports"
    SEARCH_URL = "https://site.api.espn.com/apis/common/v3/search"
    
    # Sport path mapping
    SPORT_PATHS = {
        "football": "football/college-football",
        "basketball": "basketball/mens-college-basketball",
        "baseball": "baseball/college-baseball",
        "soccer": "soccer/college-soccer",
    }
    
    # Known team IDs for some schools (ESPN uses numeric IDs)
    TEAM_IDS = {
        "fresno state": "278",
        "alabama": "333",
        "ohio state": "194",
        "georgia": "61",
        "michigan": "130",
        "texas": "251",
        "usc": "30",
        "clemson": "228",
        "duke": "150",
        "notre dame": "87",
        "lsu": "99",
        "oklahoma": "201",
        "florida": "57",
        "penn state": "213",
        "oregon": "2483",
    }
    
    def __init__(self):
        self.timeout = httpx.Timeout(30.0, connect=10.0)
    
    async def search_athlete(
        self, 
        name: str, 
        school: Optional[str] = None,
        sport: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for an athlete by name using ESPN's search API.
        
        Returns list of matching athletes with basic info.
        """
        logger.info(f"Searching ESPN for: {name}, school={school}, sport={sport}")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # ESPN search endpoint
                params = {
                    "query": name,
                    "limit": 10,
                    "type": "player"
                }
                
                response = await client.get(self.SEARCH_URL, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    
                    # Parse search results
                    for item in data.get("results", []):
                        if item.get("type") == "player":
                            for player in item.get("contents", []):
                                athlete_data = {
                                    "id": player.get("uid", "").split(":")[-1] if player.get("uid") else "",
                                    "name": player.get("displayName", player.get("name", "")),
                                    "school": player.get("team", {}).get("displayName", ""),
                                    "sport": sport or "football",
                                    "position": player.get("position", ""),
                                    "image_url": player.get("headshot", {}).get("href", ""),
                                }
                                
                                # Filter by school if specified
                                if school:
                                    if school.lower() in athlete_data["school"].lower():
                                        results.append(athlete_data)
                                else:
                                    results.append(athlete_data)
                    
                    return results
                else:
                    logger.warning(f"ESPN search returned status {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"ESPN search error: {e}")
            return []
    
    async def get_athlete_stats(
        self,
        athlete_id: str,
        sport: str,
        season: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch athlete stats from ESPN.
        
        Returns raw stats data or None if not found.
        """
        logger.info(f"Fetching ESPN stats for athlete: {athlete_id}, sport={sport}")
        
        sport_path = self.SPORT_PATHS.get(sport.lower(), "football/college-football")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Get athlete profile
                url = f"{self.BASE_URL}/{sport_path}/athletes/{athlete_id}"
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract stats from the response
                    stats = {}
                    
                    # Get athlete info
                    athlete_info = {
                        "id": data.get("id"),
                        "name": data.get("fullName", data.get("displayName", "")),
                        "position": data.get("position", {}).get("abbreviation", ""),
                        "team": data.get("team", {}).get("displayName", ""),
                        "jersey": data.get("jersey", ""),
                        "height": data.get("displayHeight", ""),
                        "weight": data.get("displayWeight", ""),
                    }
                    
                    # Get statistics if available
                    for stat_category in data.get("statistics", []):
                        category_name = stat_category.get("name", "").lower().replace(" ", "_")
                        stats[category_name] = {}
                        
                        for stat in stat_category.get("stats", []):
                            stat_name = stat.get("name", "").lower().replace(" ", "_")
                            stat_value = stat.get("value", stat.get("displayValue", "0"))
                            
                            # Convert to number if possible
                            try:
                                if "." in str(stat_value):
                                    stat_value = float(stat_value)
                                else:
                                    stat_value = int(stat_value)
                            except (ValueError, TypeError):
                                pass
                            
                            stats[category_name][stat_name] = stat_value
                    
                    return {
                        "athlete_info": athlete_info,
                        "stats": stats
                    }
                    
                elif response.status_code == 404:
                    logger.warning(f"Athlete not found: {athlete_id}")
                    return None
                else:
                    logger.warning(f"ESPN athlete fetch returned status {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"ESPN athlete fetch error: {e}")
            return None
    
    async def get_team_roster(
        self,
        school: str,
        sport: str,
        season: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch team roster from ESPN.
        
        Returns list of athletes on the team.
        """
        logger.info(f"Fetching ESPN roster for: {school}, sport={sport}")
        
        # Get team ID
        team_id = self.TEAM_IDS.get(school.lower())
        
        if not team_id:
            # Try to search for the team
            team_id = await self._search_team_id(school, sport)
        
        if not team_id:
            logger.warning(f"Could not find team ID for: {school}")
            return None
        
        sport_path = self.SPORT_PATHS.get(sport.lower(), "football/college-football")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Get team roster
                url = f"{self.BASE_URL}/{sport_path}/teams/{team_id}/roster"
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    roster = []
                    
                    # Parse roster by position groups
                    for group in data.get("athletes", []):
                        position_group = group.get("position", "")
                        
                        for athlete in group.get("items", []):
                            roster.append({
                                "id": athlete.get("id"),
                                "name": athlete.get("fullName", athlete.get("displayName", "")),
                                "position": athlete.get("position", {}).get("abbreviation", ""),
                                "position_group": position_group,
                                "jersey": athlete.get("jersey", ""),
                                "height": athlete.get("displayHeight", ""),
                                "weight": athlete.get("displayWeight", ""),
                                "year": athlete.get("experience", {}).get("displayValue", ""),
                                "hometown": athlete.get("birthPlace", {}).get("city", ""),
                            })
                    
                    return roster
                else:
                    logger.warning(f"ESPN roster fetch returned status {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"ESPN roster fetch error: {e}")
            return None
    
    async def _search_team_id(self, school: str, sport: str) -> Optional[str]:
        """Search for a team's ESPN ID by name."""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                params = {
                    "query": school,
                    "limit": 5,
                    "type": "team"
                }
                
                response = await client.get(self.SEARCH_URL, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    for item in data.get("results", []):
                        if item.get("type") == "team":
                            for team in item.get("contents", []):
                                team_name = team.get("displayName", "").lower()
                                if school.lower() in team_name:
                                    uid = team.get("uid", "")
                                    # UID format: s:20~l:23~t:278
                                    if uid:
                                        parts = uid.split("~")
                                        for part in parts:
                                            if part.startswith("t:"):
                                                return part[2:]
                    
                return None
                
        except Exception as e:
            logger.error(f"Team search error: {e}")
            return None
    
    async def get_team_statistics(
        self,
        school: str,
        sport: str,
        season: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch team statistics from ESPN.
        
        Returns team stats including individual player stats.
        """
        team_id = self.TEAM_IDS.get(school.lower())
        
        if not team_id:
            team_id = await self._search_team_id(school, sport)
        
        if not team_id:
            return None
        
        sport_path = self.SPORT_PATHS.get(sport.lower(), "football/college-football")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.BASE_URL}/{sport_path}/teams/{team_id}/statistics"
                response = await client.get(url)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return None
                    
        except Exception as e:
            logger.error(f"Team statistics fetch error: {e}")
            return None


class CollegeFootballDataClient:
    """
    Client for College Football Data API (collegefootballdata.com).
    
    This is a FREE, well-documented API with individual player stats.
    Sign up at: https://collegefootballdata.com/key
    
    Endpoints include:
    - /stats/player/season - Individual player season stats
    - /roster - Team rosters
    - /teams - Team information
    - /games/players - Player game stats
    """
    
    BASE_URL = "https://api.collegefootballdata.com"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("CFBD_API_KEY")
        self.available = self.api_key is not None
        self.timeout = httpx.Timeout(30.0, connect=10.0)
    
    def _get_headers(self) -> Dict[str, str]:
        """Get auth headers for API requests."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json"
        }
    
    async def get_player_season_stats(
        self,
        year: int = 2024,
        team: Optional[str] = None,
        category: Optional[str] = None,
        player: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get individual player season statistics.
        
        Args:
            year: Season year
            team: Filter by team name (e.g., "Fresno State")
            category: Stat category (passing, rushing, receiving, etc.)
            player: Filter by player name
            
        Returns:
            List of player stat records
        """
        if not self.available:
            logger.warning("CFBD API key not configured")
            return []
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                params = {"year": year}
                
                if team:
                    params["team"] = team
                if category:
                    params["category"] = category
                if player:
                    params["player"] = player
                
                response = await client.get(
                    f"{self.BASE_URL}/stats/player/season",
                    headers=self._get_headers(),
                    params=params
                )
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 401:
                    logger.error("CFBD API: Unauthorized - check API key")
                    return []
                else:
                    logger.warning(f"CFBD API returned status {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"CFBD API error: {e}")
            return []
    
    async def get_team_roster(
        self,
        team: str,
        year: int = 2024
    ) -> List[Dict[str, Any]]:
        """
        Get team roster from CFBD.
        
        Returns detailed player info including height, weight, hometown.
        """
        if not self.available:
            return []
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                params = {"team": team, "year": year}
                
                response = await client.get(
                    f"{self.BASE_URL}/roster",
                    headers=self._get_headers(),
                    params=params
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return []
                    
        except Exception as e:
            logger.error(f"CFBD roster error: {e}")
            return []
    
    async def get_player_game_stats(
        self,
        year: int = 2024,
        team: Optional[str] = None,
        player_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get player stats by game.
        
        Useful for detailed breakdowns.
        """
        if not self.available:
            return []
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                params = {"year": year}
                
                if team:
                    params["team"] = team
                if player_id:
                    params["playerId"] = player_id
                
                response = await client.get(
                    f"{self.BASE_URL}/games/players",
                    headers=self._get_headers(),
                    params=params
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return []
                    
        except Exception as e:
            logger.error(f"CFBD game stats error: {e}")
            return []
    
    async def get_player_usage(
        self,
        year: int = 2024,
        team: Optional[str] = None,
        position: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get player usage statistics (snap counts, targets, etc.).
        """
        if not self.available:
            return []
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                params = {"year": year}
                
                if team:
                    params["team"] = team
                if position:
                    params["position"] = position
                
                response = await client.get(
                    f"{self.BASE_URL}/player/usage",
                    headers=self._get_headers(),
                    params=params
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return []
                    
        except Exception as e:
            logger.error(f"CFBD usage error: {e}")
            return []


class HudlClient:
    """
    Client for fetching data from Hudl.
    
    Note: Hudl requires partnership/API access.
    This is a placeholder for future integration.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.available = api_key is not None
    
    async def get_advanced_stats(
        self,
        athlete_id: str,
        sport: str
    ) -> Optional[Dict[str, Any]]:
        """
        Fetch advanced stats from Hudl.
        
        Returns film grades, practice metrics, etc.
        """
        if not self.available:
            logger.debug("Hudl client not configured")
            return None
        
        # TODO: Implement Hudl API integration
        return None


class StatsAggregator:
    """
    Aggregates athlete stats from multiple sources.
    
    Priority order:
    1. CFBD (individual player stats - football)
    2. ESPN (team roster, team stats)
    3. Hudl (advanced stats - future)
    4. Manual input (fill gaps)
    """
    
    def __init__(self, cfbd_api_key: Optional[str] = None):
        self.espn = ESPNClient()
        self.cfbd = CollegeFootballDataClient(api_key=cfbd_api_key)
        self.hudl = HudlClient()
    
    async def search_athlete(
        self,
        name: str,
        school: Optional[str] = None,
        sport: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for an athlete across data sources.
        
        Returns list of potential matches.
        """
        results = await self.espn.search_athlete(name, school, sport)
        return results
    
    async def aggregate_stats(
        self,
        athlete_id: str,
        name: str,
        school: str,
        sport: Sport,
        position: str,
        season: str = "2024",
        manual_stats: Optional[Dict[str, Any]] = None
    ) -> AthleteStats:
        """
        Aggregate stats from all available sources.
        
        Args:
            athlete_id: Unique identifier for the athlete
            name: Athlete's full name
            school: School name
            sport: Sport enum
            position: Playing position
            season: Season year
            manual_stats: Manually provided stats to fill gaps
            
        Returns:
            AthleteStats object with all available data
        """
        athlete_stats = AthleteStats(
            athlete_id=athlete_id,
            name=name,
            school=school,
            sport=sport,
            position=position,
            season=season
        )
        
        # Step 1: For football, use CFBD for individual player stats (best source)
        if sport == Sport.FOOTBALL and self.cfbd.available:
            cfbd_data = await self.cfbd.get_player_season_stats(
                year=int(season),
                team=school,
                player=name
            )
            if cfbd_data:
                self._merge_cfbd_stats(athlete_stats, cfbd_data, name)
        
        # Step 2: Fetch from ESPN (mainly for roster info if needed)
        espn_data = await self.espn.get_athlete_stats(
            athlete_id, 
            sport.value, 
            season
        )
        
        if espn_data:
            self._merge_espn_stats(athlete_stats, espn_data)
        
        # Step 3: Fetch from Hudl (advanced stats - future)
        hudl_data = await self.hudl.get_advanced_stats(athlete_id, sport.value)
        
        if hudl_data:
            self._merge_hudl_stats(athlete_stats, hudl_data)
        
        # Step 4: Apply manual stats
        if manual_stats:
            self._merge_manual_stats(athlete_stats, manual_stats)
        
        # Step 5: Identify missing stats
        self._identify_missing_stats(athlete_stats)
        
        return athlete_stats
    
    def _merge_cfbd_stats(self, athlete_stats: AthleteStats, cfbd_data: List[Dict[str, Any]], player_name: str):
        """Merge CFBD stats into athlete stats."""
        # CFBD returns a list of stat records
        # Each record has: player, team, category, statType, stat
        for record in cfbd_data:
            # Match by player name (case insensitive)
            record_player = record.get("player", "")
            if player_name.lower() not in record_player.lower() and record_player.lower() not in player_name.lower():
                continue
            
            category = record.get("category", "general").lower()
            stat_type = record.get("statType", "").lower().replace(" ", "_")
            stat_value = record.get("stat")
            
            # Convert to number if possible
            if stat_value is not None:
                try:
                    if "." in str(stat_value):
                        stat_value = float(stat_value)
                    else:
                        stat_value = int(stat_value)
                except (ValueError, TypeError):
                    pass
            
            athlete_stats.set_stat(category, stat_type, stat_value, DataSource.CFBD)
    
    def _merge_espn_stats(self, athlete_stats: AthleteStats, espn_data: Dict[str, Any]):
        """Merge ESPN stats into athlete stats."""
        for category, stats in espn_data.items():
            if isinstance(stats, dict):
                for stat_name, value in stats.items():
                    athlete_stats.set_stat(category, stat_name, value, DataSource.ESPN)
    
    def _merge_hudl_stats(self, athlete_stats: AthleteStats, hudl_data: Dict[str, Any]):
        """Merge Hudl stats into athlete stats (only for gaps)."""
        for category, stats in hudl_data.items():
            if isinstance(stats, dict):
                for stat_name, value in stats.items():
                    # Only add if not already present from ESPN
                    if athlete_stats.get_stat(stat_name) is None:
                        athlete_stats.set_stat(category, stat_name, value, DataSource.HUDL)
    
    def _merge_manual_stats(self, athlete_stats: AthleteStats, manual_stats: Dict[str, Any]):
        """Merge manually provided stats."""
        for key, value in manual_stats.items():
            # Parse category.stat_name format or just use "manual" category
            if "." in key:
                category, stat_name = key.split(".", 1)
            else:
                category = "manual"
                stat_name = key
            
            # Only add if not already present
            if athlete_stats.get_stat(stat_name) is None:
                athlete_stats.set_stat(category, stat_name, value, DataSource.MANUAL)
    
    def _identify_missing_stats(self, athlete_stats: AthleteStats):
        """Identify stats that are still missing."""
        sport_stats = SPORT_STATS.get(athlete_stats.sport, {})
        
        # Get position-relevant categories
        position_lower = athlete_stats.position.lower()
        relevant_categories = []
        
        if athlete_stats.sport == Sport.FOOTBALL:
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
                relevant_categories = list(sport_stats.keys())
        else:
            relevant_categories = list(sport_stats.keys())
        
        # Check for missing stats in relevant categories
        for category in relevant_categories:
            if category in sport_stats:
                for stat_name in sport_stats[category]:
                    if athlete_stats.get_stat(stat_name) is None:
                        athlete_stats.missing_stats.append(f"{category}.{stat_name}")
    
    async def get_teammates(
        self,
        school: str,
        sport: Sport,
        position: Optional[str] = None,
        season: str = "2024"
    ) -> List[Dict[str, Any]]:
        """
        Get list of teammates for comparison.
        
        Args:
            school: School name
            sport: Sport enum
            position: Optional position filter (e.g., only other WRs)
            season: Season year
            
        Returns:
            List of teammate data with their stats
        """
        roster = await self.espn.get_team_roster(school, sport.value, season)
        
        if not roster:
            return []
        
        # Filter by position if specified
        if position:
            position_lower = position.lower()
            roster = [
                p for p in roster 
                if position_lower in p.get("position", "").lower()
            ]
        
        return roster
    
    async def get_team_position_stats(
        self,
        school: str,
        sport: Sport,
        position: str,
        season: str = "2024"
    ) -> Tuple[List[Dict[str, Any]], List[AthleteStats]]:
        """
        Get stats for all players at a position on a team.
        
        This is the KEY method for leverage comparison - gets all WRs,
        all QBs, etc. with their individual stats.
        
        Args:
            school: School name (e.g., "Fresno State")
            sport: Sport enum
            position: Position to filter (e.g., "WR", "QB", "RB")
            season: Season year
            
        Returns:
            Tuple of (roster list, list of AthleteStats objects with stats)
        """
        # Step 1: Get roster from ESPN
        roster = await self.espn.get_team_roster(school, sport.value, season)
        
        if not roster:
            return [], []
        
        # Step 2: Filter by position
        position_upper = position.upper()
        position_roster = [
            p for p in roster 
            if p.get("position", "").upper() == position_upper
        ]
        
        # Step 3: For football, get stats from CFBD
        athlete_stats_list = []
        
        if sport == Sport.FOOTBALL and self.cfbd.available:
            # Get receiving stats for WRs, rushing for RBs, etc.
            stat_category = self._get_stat_category_for_position(position)
            
            # Fetch all players' stats for this team and category
            all_player_stats = await self.cfbd.get_player_season_stats(
                year=int(season),
                team=school,
                category=stat_category
            )
            
            # Map stats by player name
            player_stats_map = {}
            for record in all_player_stats:
                player_name = record.get("player", "")
                if player_name not in player_stats_map:
                    player_stats_map[player_name] = []
                player_stats_map[player_name].append(record)
            
            # Create AthleteStats for each roster player
            for player in position_roster:
                player_name = player.get("name", "")
                
                # Find matching stats (fuzzy match)
                matched_stats = []
                for name, stats in player_stats_map.items():
                    if self._names_match(name, player_name):
                        matched_stats = stats
                        break
                
                athlete = AthleteStats(
                    athlete_id=player.get("id", ""),
                    name=player_name,
                    school=school,
                    sport=sport,
                    position=position,
                    season=season
                )
                
                # Add stats
                for record in matched_stats:
                    category = record.get("category", "general").lower()
                    stat_type = record.get("statType", "").lower().replace(" ", "_")
                    stat_value = record.get("stat")
                    
                    if stat_value is not None:
                        try:
                            if "." in str(stat_value):
                                stat_value = float(stat_value)
                            else:
                                stat_value = int(stat_value)
                        except (ValueError, TypeError):
                            pass
                    
                    athlete.set_stat(category, stat_type, stat_value, DataSource.CFBD)
                
                athlete_stats_list.append(athlete)
        
        return position_roster, athlete_stats_list
    
    def _get_stat_category_for_position(self, position: str) -> str:
        """Map position to CFBD stat category."""
        position_upper = position.upper()
        
        if position_upper in ["WR", "TE"]:
            return "receiving"
        elif position_upper in ["RB", "FB"]:
            return "rushing"
        elif position_upper == "QB":
            return "passing"
        elif position_upper in ["DB", "CB", "S", "LB", "DE", "DT"]:
            return "defensive"
        elif position_upper in ["K", "PK"]:
            return "kicking"
        elif position_upper == "P":
            return "punting"
        else:
            return "receiving"
    
    def _names_match(self, name1: str, name2: str) -> bool:
        """Check if two names match (handles variations)."""
        # Normalize names
        n1 = name1.lower().strip()
        n2 = name2.lower().strip()
        
        # Exact match
        if n1 == n2:
            return True
        
        # Check if one contains the other
        if n1 in n2 or n2 in n1:
            return True
        
        # Check last name match
        parts1 = n1.split()
        parts2 = n2.split()
        
        if parts1 and parts2:
            # Last names match
            if parts1[-1] == parts2[-1]:
                # First initials match
                if parts1[0][0] == parts2[0][0]:
                    return True
        
        return False


class StatsComparator:
    """
    Compares athlete stats against teammates.
    
    Calculates rankings, percentiles, and generates insights.
    """
    
    def compare_to_teammates(
        self,
        athlete_stats: AthleteStats,
        teammate_stats: List[AthleteStats]
    ) -> Dict[str, Any]:
        """
        Compare athlete's stats to teammates.
        
        Returns rankings, percentiles, and insights.
        """
        if not teammate_stats:
            return {
                "error": "No teammate data available for comparison",
                "rankings": {},
                "percentiles": {},
                "summary": {}
            }
        
        # Get all stats as flat dict
        athlete_flat = athlete_stats.get_all_stats_flat()
        
        # Compile teammate stats
        all_stats = {}
        for stat_name, value in athlete_flat.items():
            if isinstance(value, (int, float)):
                teammate_values = []
                for teammate in teammate_stats:
                    teammate_value = teammate.get_all_stats_flat().get(stat_name)
                    if isinstance(teammate_value, (int, float)):
                        teammate_values.append(teammate_value)
                
                if teammate_values:
                    all_stats[stat_name] = {
                        "athlete_value": value,
                        "teammate_values": teammate_values,
                        "all_values": [value] + teammate_values
                    }
        
        # Calculate rankings and percentiles
        rankings = {}
        percentiles = {}
        excel_categories = []
        
        for stat_name, data in all_stats.items():
            all_values = data["all_values"]
            athlete_value = data["athlete_value"]
            
            # Determine if higher is better (most stats) or lower is better
            higher_is_better = not any(
                neg in stat_name.lower() 
                for neg in ["interceptions", "fumbles", "turnovers", "errors", "fouls", "losses"]
            )
            
            # Sort and find rank
            sorted_values = sorted(all_values, reverse=higher_is_better)
            rank = sorted_values.index(athlete_value) + 1
            
            rankings[stat_name] = {
                "rank": rank,
                "total": len(all_values),
                "value": athlete_value,
                "team_average": sum(data["teammate_values"]) / len(data["teammate_values"]) if data["teammate_values"] else 0,
                "is_top": rank == 1
            }
            
            # Calculate percentile
            percentile = ((len(all_values) - rank) / len(all_values)) * 100
            percentiles[stat_name] = round(percentile, 1)
            
            # Track categories where athlete excels
            if rank <= 2 and len(all_values) >= 3:
                excel_categories.append(stat_name)
        
        # Generate summary
        total_categories = len(rankings)
        first_place_count = sum(1 for r in rankings.values() if r["is_top"])
        top_two_count = sum(1 for r in rankings.values() if r["rank"] <= 2)
        
        # Calculate overall performance vs team average
        performance_vs_avg = []
        for stat_name, data in rankings.items():
            if data["team_average"] > 0:
                pct_diff = ((data["value"] - data["team_average"]) / data["team_average"]) * 100
                performance_vs_avg.append(pct_diff)
        
        avg_performance_diff = sum(performance_vs_avg) / len(performance_vs_avg) if performance_vs_avg else 0
        
        return {
            "rankings": rankings,
            "percentiles": percentiles,
            "summary": {
                "total_categories": total_categories,
                "first_place_count": first_place_count,
                "top_two_count": top_two_count,
                "excel_categories": excel_categories,
                "performance_vs_team_avg": round(avg_performance_diff, 1),
                "comparison_count": len(teammate_stats) + 1,  # Including athlete
            }
        }
    
    def generate_leverage_statement(
        self,
        comparison_result: Dict[str, Any],
        athlete_name: str
    ) -> str:
        """
        Generate a leverage statement for negotiations.
        
        Returns a professional statement highlighting strengths.
        """
        summary = comparison_result.get("summary", {})
        rankings = comparison_result.get("rankings", {})
        
        first_count = summary.get("first_place_count", 0)
        total = summary.get("total_categories", 0)
        excel_cats = summary.get("excel_categories", [])
        perf_diff = summary.get("performance_vs_team_avg", 0)
        
        # Build the statement
        parts = []
        
        if first_count > 0:
            # Get the names of #1 categories
            top_stats = [
                stat.replace("_", " ").title() 
                for stat, data in rankings.items() 
                if data.get("is_top")
            ][:3]  # Limit to 3
            
            if len(top_stats) == 1:
                parts.append(f"I lead the team in {top_stats[0]}")
            elif len(top_stats) == 2:
                parts.append(f"I lead the team in {top_stats[0]} and {top_stats[1]}")
            else:
                parts.append(f"I lead the team in {', '.join(top_stats[:-1])}, and {top_stats[-1]}")
        
        if first_count > 0 and total > 0:
            parts.append(f"ranking #1 in {first_count} of {total} key statistical categories")
        
        if perf_diff > 0:
            parts.append(f"My overall performance exceeds the team average by {abs(perf_diff):.0f}%")
        
        if not parts:
            return "Performance data demonstrates consistent contribution to team success."
        
        statement = ". ".join(parts) + "."
        return statement

