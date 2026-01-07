"""
Rule-Based Matching Engine

Handles quantitative filtering and scoring of athlete-brand matches
BEFORE passing top candidates to Claude for qualitative analysis.

This hybrid approach:
- Reduces Claude API calls (cost savings)
- Speeds up response time
- Provides explainable scores for quantitative factors
"""

import logging
import json
import re
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


# ============= Configuration =============

from app.config import get_settings

settings = get_settings()


class ScoringWeights:
    """Configurable weights for soft scoring (total = 100)."""
    SPORT_MATCH = settings.rule_weight_sport_match              # Exact sport match
    FOLLOWER_REACH = settings.rule_weight_follower_reach        # Total social media reach
    ENGAGEMENT_QUALITY = settings.rule_weight_engagement        # Engagement rate
    INTEREST_TAG_MATCH = settings.rule_weight_interest_tags     # Interest/industry match
    GEOGRAPHIC_FIT = settings.rule_weight_geographic            # Location/conference fit


class BudgetTier(Enum):
    """Budget tiers derived from brand budget ranges."""
    MICRO = "micro"           # Under $5,000
    SMALL = "small"           # $5,000 - $15,000
    MEDIUM = "medium"         # $15,000 - $50,000
    HIGH = "high"             # $50,000 - $100,000
    PREMIUM = "premium"       # $100,000 - $250,000
    ENTERPRISE = "enterprise" # $250,000+


# Industry to interest tag mapping
INDUSTRY_TAG_MAP = {
    "Sports & Fitness": ["Fitness", "Sports", "Health", "Wellness", "Training", "Athletics"],
    "Food & Beverage": ["Food", "Nutrition", "Cooking", "Lifestyle", "Health"],
    "Apparel & Fashion": ["Fashion", "Sneakers", "Style", "Clothing", "Streetwear"],
    "Technology": ["Tech", "Gaming", "Innovation", "Gadgets"],
    "Health & Wellness": ["Health", "Wellness", "Fitness", "Mental Health", "Nutrition"],
    "Financial Services": ["Finance", "Business", "Entrepreneurship", "Investing"],
    "Automotive": ["Cars", "Automotive", "Trucks", "Racing"],
    "Entertainment & Media": ["Entertainment", "Music", "Media", "Content", "Streaming"],
    "Retail & E-commerce": ["Shopping", "Lifestyle", "Fashion", "Deals"],
    "Travel & Hospitality": ["Travel", "Adventure", "Lifestyle", "Experiences"],
}

# Sport relatedness for partial matching
RELATED_SPORTS = {
    "Basketball": ["Basketball", "Volleyball"],
    "Football": ["Football"],
    "Soccer": ["Soccer"],
    "Baseball": ["Baseball", "Softball"],
    "Softball": ["Softball", "Baseball"],
    "Volleyball": ["Volleyball", "Basketball"],
    "Track & Field": ["Track & Field", "Cross Country"],
    "Cross Country": ["Cross Country", "Track & Field"],
    "Swimming": ["Swimming", "Diving", "Water Polo"],
    "Tennis": ["Tennis"],
    "Golf": ["Golf"],
    "Wrestling": ["Wrestling"],
    "Gymnastics": ["Gymnastics"],
    "Lacrosse": ["Lacrosse"],
    "Hockey": ["Hockey"],
}

# Conference regions for geographic matching
CONFERENCE_REGIONS = {
    "ACC": "East Coast",
    "SEC": "South",
    "Big Ten": "Midwest",
    "Big 12": "Central",
    "Pac-12": "West Coast",
    "Big East": "East Coast",
    "American": "National",
    "Mountain West": "West",
    "Sun Belt": "South",
    "MAC": "Midwest",
    "Conference USA": "South",
}


@dataclass
class BrandCriteria:
    """Structured criteria extracted from brand intake."""
    brand_id: str
    company: str
    industry: str
    budget: str
    budget_tier: BudgetTier = BudgetTier.MEDIUM
    
    # Hard filters (pass/fail)
    preferred_sports: List[str] = field(default_factory=list)
    preferred_conferences: List[str] = field(default_factory=list)
    min_followers: int = 0
    min_engagement_rate: float = 0.0
    preferred_gender: Optional[str] = None  # None = Any
    age_range: Optional[Tuple[int, int]] = None  # (min, max) or None = Any
    
    # Soft scoring factors
    target_regions: List[str] = field(default_factory=list)
    target_tags: List[str] = field(default_factory=list)
    timeline_urgency: str = "flexible"
    
    @classmethod
    def from_brand_data(cls, brand_data: Dict[str, Any]) -> "BrandCriteria":
        """
        Extract structured criteria from raw brand intake data.
        
        Handles both structured fields (if added to form) and 
        attempts to parse unstructured athletePreferences text.
        """
        # Determine budget tier
        budget = brand_data.get("budget", "")
        budget_tier = cls._parse_budget_tier(budget)
        
        # Get industry and map to target tags
        industry = brand_data.get("industry", "")
        target_tags = INDUSTRY_TAG_MAP.get(industry, [])
        
        # Try to extract sports from structured field or preferences text
        preferred_sports = brand_data.get("preferredSports", [])
        # Handle JSON string format
        if isinstance(preferred_sports, str):
            try:
                preferred_sports = json.loads(preferred_sports)
            except (json.JSONDecodeError, TypeError):
                preferred_sports = []
        if not preferred_sports or (isinstance(preferred_sports, list) and len(preferred_sports) == 0):
            # Try to parse from athletePreferences text
            preferences_text = brand_data.get("athletePreferences", "").lower()
            preferred_sports = cls._extract_sports_from_text(preferences_text)
        
        # Get conferences (structured or empty)
        preferred_conferences = brand_data.get("preferredConferences", [])
        # Handle JSON string format
        if isinstance(preferred_conferences, str):
            try:
                preferred_conferences = json.loads(preferred_conferences)
            except (json.JSONDecodeError, TypeError):
                preferred_conferences = []
        
        # Get follower minimum (structured or default based on budget)
        min_followers = brand_data.get("minFollowers", 0)
        # Handle string format like "50K" -> 50000
        if isinstance(min_followers, str):
            numbers = re.findall(r'\d+', min_followers)
            if numbers:
                num = int(numbers[0])
                if 'k' in min_followers.lower():
                    min_followers = num * 1000
                else:
                    min_followers = num
            else:
                min_followers = 0
        elif not isinstance(min_followers, int):
            min_followers = 0
        
        if not min_followers:
            # Default based on budget tier
            min_followers = {
                BudgetTier.MICRO: 1000,
                BudgetTier.SMALL: 5000,
                BudgetTier.MEDIUM: 10000,
                BudgetTier.HIGH: 25000,
                BudgetTier.PREMIUM: 50000,
                BudgetTier.ENTERPRISE: 100000,
            }.get(budget_tier, 5000)
        
        return cls(
            brand_id=brand_data.get("id", ""),
            company=brand_data.get("company", ""),
            industry=industry,
            budget=budget,
            budget_tier=budget_tier,
            preferred_sports=preferred_sports,
            preferred_conferences=preferred_conferences,
            min_followers=min_followers,
            min_engagement_rate=brand_data.get("minEngagement", 0.0),
            preferred_gender=brand_data.get("preferredGender"),
            age_range=brand_data.get("ageRange"),
            target_tags=target_tags,
            timeline_urgency=brand_data.get("timeline", "flexible"),
        )
    
    @staticmethod
    def _parse_budget_tier(budget: str) -> BudgetTier:
        """Parse budget string to tier enum."""
        budget_lower = budget.lower()
        if "under" in budget_lower or "5,000" in budget and "15" not in budget:
            return BudgetTier.MICRO
        elif "5,000" in budget_lower and "15,000" in budget_lower:
            return BudgetTier.SMALL
        elif "15,000" in budget_lower or "50,000" in budget_lower:
            return BudgetTier.MEDIUM
        elif "50,000" in budget_lower and "100,000" in budget_lower:
            return BudgetTier.HIGH
        elif "100,000" in budget_lower and "250,000" in budget_lower:
            return BudgetTier.PREMIUM
        elif "250,000" in budget_lower:
            return BudgetTier.ENTERPRISE
        return BudgetTier.MEDIUM
    
    @staticmethod
    def _extract_sports_from_text(text: str) -> List[str]:
        """Attempt to extract sport names from free text."""
        sports = []
        sport_keywords = [
            "basketball", "football", "soccer", "baseball", "softball",
            "volleyball", "track", "swimming", "tennis", "golf",
            "wrestling", "gymnastics", "lacrosse", "hockey"
        ]
        for sport in sport_keywords:
            if sport in text:
                # Capitalize properly
                sports.append(sport.title().replace("And", "&"))
        return sports


@dataclass
class AthleteProfile:
    """Structured athlete profile for matching."""
    athlete_id: str
    name: str
    sport: str
    position: str
    school: str
    conference: str
    location: str
    age: Optional[int] = None
    gender: Optional[str] = None
    
    # Social metrics (will be populated by API later)
    total_followers: int = 0
    engagement_rate: float = 0.0
    platforms: List[str] = field(default_factory=list)
    
    # Interests and preferences
    interest_tags: List[str] = field(default_factory=list)
    excluded_categories: List[str] = field(default_factory=list)
    minimum_deal_value: float = 0.0
    
    @classmethod
    def from_athlete_data(cls, athlete_data: Dict[str, Any]) -> "AthleteProfile":
        """Extract structured profile from raw athlete data."""
        # Calculate age from date of birth
        age = cls._calculate_age(athlete_data.get("dateOfBirth"))
        
        # Get name
        name = athlete_data.get("fullName") or \
               f"{athlete_data.get('firstName', '')} {athlete_data.get('lastName', '')}".strip()
        
        # Get conference (from data or derive from school)
        conference = athlete_data.get("conference", "")
        
        # Get social metrics from social accounts if available
        total_followers, platforms = cls._extract_social_metrics(athlete_data)
        
        # Get interest tags
        interest_tags = athlete_data.get("interestTags", [])
        if not interest_tags:
            # Try to get from preferences
            prefs = athlete_data.get("preferences", {})
            if isinstance(prefs, dict):
                interest_tags = prefs.get("likedCategories", [])
        
        return cls(
            athlete_id=athlete_data.get("id", ""),
            name=name,
            sport=athlete_data.get("sport", ""),
            position=athlete_data.get("position", ""),
            school=athlete_data.get("school", athlete_data.get("schoolName", "")),
            conference=conference,
            location=athlete_data.get("location", athlete_data.get("hometown", "")),
            age=age,
            gender=athlete_data.get("gender"),
            total_followers=total_followers,
            engagement_rate=athlete_data.get("engagementRate", 0.0),
            platforms=platforms,
            interest_tags=interest_tags,
            excluded_categories=athlete_data.get("excludedCategories", []),
            minimum_deal_value=athlete_data.get("minimumDealValue", 0.0),
        )
    
    @staticmethod
    def _calculate_age(dob: Optional[str]) -> Optional[int]:
        """Calculate age from date of birth string."""
        if not dob:
            return None
        
        from datetime import datetime, date
        
        try:
            # Try common date formats
            for fmt in ["%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y"]:
                try:
                    dob_date = datetime.strptime(dob, fmt).date()
                    today = date.today()
                    age = today.year - dob_date.year - (
                        (today.month, today.day) < (dob_date.month, dob_date.day)
                    )
                    return age
                except ValueError:
                    continue
        except Exception:
            pass
        
        return None
    
    @staticmethod
    def _extract_social_metrics(athlete_data: Dict[str, Any]) -> Tuple[int, List[str]]:
        """Extract total followers and platforms from social accounts."""
        social_accounts = athlete_data.get("socialAccounts", [])
        
        total_followers = 0
        platforms = []
        
        for account in social_accounts:
            # Handle follower count (might be string like "125K")
            followers = account.get("followers", 0)
            if isinstance(followers, str):
                followers = AthleteProfile._parse_follower_count(followers)
            total_followers += followers
            
            platform = account.get("platform")
            if platform:
                platforms.append(platform)
        
        return total_followers, platforms
    
    @staticmethod
    def _parse_follower_count(count_str: str) -> int:
        """Parse follower count strings like '125K' or '1.2M'."""
        count_str = count_str.upper().replace(",", "").strip()
        
        try:
            if "K" in count_str:
                return int(float(count_str.replace("K", "")) * 1000)
            elif "M" in count_str:
                return int(float(count_str.replace("M", "")) * 1000000)
            else:
                return int(float(count_str))
        except (ValueError, TypeError):
            return 0


@dataclass 
class FilterResult:
    """Result of filtering an athlete."""
    passed: bool
    reasons: List[str] = field(default_factory=list)


@dataclass
class ScoringResult:
    """Result of scoring an athlete."""
    athlete_id: str
    athlete_name: str
    total_score: float
    component_scores: Dict[str, float] = field(default_factory=dict)
    score_reasons: List[str] = field(default_factory=list)


class RuleEngine:
    """
    Rule-based matching engine for athlete-brand filtering and scoring.
    
    Flow:
    1. filter_candidates() - Apply hard pass/fail filters
    2. score_athletes() - Calculate weighted scores for passing athletes
    3. rank_and_select() - Sort by score and return top N for Claude analysis
    """
    
    def __init__(self, weights: Optional[ScoringWeights] = None):
        """Initialize with optional custom weights."""
        self.weights = weights or ScoringWeights()
    
    def filter_candidates(
        self, 
        athletes: List[Dict[str, Any]], 
        brand_criteria: BrandCriteria
    ) -> Tuple[List[AthleteProfile], List[Dict[str, Any]]]:
        """
        Apply hard filters to eliminate non-matching athletes.
        
        Args:
            athletes: List of raw athlete data dictionaries
            brand_criteria: Structured brand requirements
            
        Returns:
            Tuple of (passing athletes as AthleteProfile, filter stats)
        """
        passing = []
        stats = {
            "total_evaluated": len(athletes),
            "passed": 0,
            "failed_sport": 0,
            "failed_conference": 0,
            "failed_followers": 0,
            "failed_engagement": 0,
            "failed_gender": 0,
            "failed_age": 0,
            "failed_excluded": 0,
        }
        
        for athlete_data in athletes:
            athlete = AthleteProfile.from_athlete_data(athlete_data)
            result = self._apply_hard_filters(athlete, brand_criteria)
            
            if result.passed:
                passing.append(athlete)
                stats["passed"] += 1
            else:
                # Track why athletes failed
                for reason in result.reasons:
                    if "sport" in reason.lower():
                        stats["failed_sport"] += 1
                    elif "conference" in reason.lower():
                        stats["failed_conference"] += 1
                    elif "follower" in reason.lower():
                        stats["failed_followers"] += 1
                    elif "engagement" in reason.lower():
                        stats["failed_engagement"] += 1
                    elif "gender" in reason.lower():
                        stats["failed_gender"] += 1
                    elif "age" in reason.lower():
                        stats["failed_age"] += 1
                    elif "excluded" in reason.lower():
                        stats["failed_excluded"] += 1
        
        logger.info(f"Filter results: {stats['passed']}/{stats['total_evaluated']} passed")
        return passing, stats
    
    def _apply_hard_filters(
        self, 
        athlete: AthleteProfile, 
        criteria: BrandCriteria
    ) -> FilterResult:
        """Apply all hard filters to a single athlete."""
        reasons = []
        
        # Sport filter (if specified)
        if criteria.preferred_sports:
            if athlete.sport not in criteria.preferred_sports:
                # Check for related sports
                related = RELATED_SPORTS.get(athlete.sport, [])
                if not any(s in criteria.preferred_sports for s in related):
                    reasons.append(f"Sport mismatch: {athlete.sport} not in {criteria.preferred_sports}")
        
        # Conference filter (if specified)
        if criteria.preferred_conferences:
            if athlete.conference and athlete.conference not in criteria.preferred_conferences:
                reasons.append(f"Conference mismatch: {athlete.conference} not in {criteria.preferred_conferences}")
        
        # Minimum followers filter
        if criteria.min_followers > 0:
            if athlete.total_followers < criteria.min_followers:
                reasons.append(f"Below follower minimum: {athlete.total_followers} < {criteria.min_followers}")
        
        # Minimum engagement filter (when available)
        if criteria.min_engagement_rate > 0:
            if athlete.engagement_rate < criteria.min_engagement_rate:
                reasons.append(f"Below engagement minimum: {athlete.engagement_rate}% < {criteria.min_engagement_rate}%")
        
        # Gender filter (if specified)
        if criteria.preferred_gender and criteria.preferred_gender.lower() != "any":
            if athlete.gender and athlete.gender.lower() != criteria.preferred_gender.lower():
                reasons.append(f"Gender mismatch: {athlete.gender} != {criteria.preferred_gender}")
        
        # Age filter (if specified)
        if criteria.age_range and athlete.age:
            min_age, max_age = criteria.age_range
            if athlete.age < min_age or athlete.age > max_age:
                reasons.append(f"Age out of range: {athlete.age} not in {min_age}-{max_age}")
        
        # Check if brand's industry is in athlete's excluded categories
        if criteria.industry and athlete.excluded_categories:
            if criteria.industry in athlete.excluded_categories:
                reasons.append(f"Athlete excludes industry: {criteria.industry}")
        
        return FilterResult(passed=len(reasons) == 0, reasons=reasons)
    
    def score_athletes(
        self, 
        athletes: List[AthleteProfile], 
        brand_criteria: BrandCriteria
    ) -> List[ScoringResult]:
        """
        Calculate weighted scores for all passing athletes.
        
        Args:
            athletes: List of AthleteProfile objects that passed filtering
            brand_criteria: Structured brand requirements
            
        Returns:
            List of ScoringResult objects
        """
        results = []
        
        for athlete in athletes:
            result = self._score_athlete(athlete, brand_criteria)
            results.append(result)
        
        return results
    
    def _score_athlete(
        self, 
        athlete: AthleteProfile, 
        criteria: BrandCriteria
    ) -> ScoringResult:
        """Calculate score for a single athlete."""
        component_scores = {}
        reasons = []
        
        # 1. Sport Match Score (0-25)
        sport_score = self._score_sport_match(athlete, criteria)
        component_scores["sport_match"] = sport_score
        if sport_score == self.weights.SPORT_MATCH:
            reasons.append(f"Exact sport match: {athlete.sport}")
        elif sport_score > 0:
            reasons.append(f"Related sport: {athlete.sport}")
        
        # 2. Follower Reach Score (0-25)
        follower_score = self._score_follower_reach(athlete, criteria)
        component_scores["follower_reach"] = follower_score
        if athlete.total_followers > 0:
            reasons.append(f"Social reach: {athlete.total_followers:,} followers")
        
        # 3. Engagement Quality Score (0-20) - Placeholder until API ready
        engagement_score = self._score_engagement(athlete)
        component_scores["engagement_quality"] = engagement_score
        if athlete.engagement_rate > 0:
            reasons.append(f"Engagement rate: {athlete.engagement_rate}%")
        
        # 4. Interest Tag Match Score (0-15)
        tag_score = self._score_interest_tags(athlete, criteria)
        component_scores["interest_tag_match"] = tag_score
        if tag_score > 0:
            matching_tags = set(athlete.interest_tags) & set(criteria.target_tags)
            if matching_tags:
                reasons.append(f"Matching interests: {', '.join(list(matching_tags)[:3])}")
        
        # 5. Geographic Fit Score (0-15)
        geo_score = self._score_geographic_fit(athlete, criteria)
        component_scores["geographic_fit"] = geo_score
        if athlete.conference:
            region = CONFERENCE_REGIONS.get(athlete.conference, "Unknown")
            reasons.append(f"Region: {region} ({athlete.conference})")
        
        # Calculate total
        total_score = sum(component_scores.values())
        
        return ScoringResult(
            athlete_id=athlete.athlete_id,
            athlete_name=athlete.name,
            total_score=round(total_score, 1),
            component_scores=component_scores,
            score_reasons=reasons
        )
    
    def _score_sport_match(self, athlete: AthleteProfile, criteria: BrandCriteria) -> float:
        """Score based on sport alignment."""
        if not criteria.preferred_sports:
            # No preference = full points for having a sport
            return self.weights.SPORT_MATCH if athlete.sport else 0
        
        if athlete.sport in criteria.preferred_sports:
            return self.weights.SPORT_MATCH  # Exact match
        
        # Check for related sports
        related = RELATED_SPORTS.get(athlete.sport, [])
        if any(s in criteria.preferred_sports for s in related):
            return self.weights.SPORT_MATCH * 0.6  # 60% for related sport
        
        return 0
    
    def _score_follower_reach(self, athlete: AthleteProfile, criteria: BrandCriteria) -> float:
        """Score based on social media reach."""
        followers = athlete.total_followers
        max_score = self.weights.FOLLOWER_REACH
        
        # Tiered scoring based on follower count
        if followers >= 500000:
            return max_score  # 500K+ = max
        elif followers >= 250000:
            return max_score * 0.9  # 250K-500K
        elif followers >= 100000:
            return max_score * 0.8  # 100K-250K
        elif followers >= 50000:
            return max_score * 0.7  # 50K-100K
        elif followers >= 25000:
            return max_score * 0.6  # 25K-50K
        elif followers >= 10000:
            return max_score * 0.5  # 10K-25K
        elif followers >= 5000:
            return max_score * 0.3  # 5K-10K
        elif followers >= 1000:
            return max_score * 0.1  # 1K-5K
        else:
            return 0
    
    def _score_engagement(self, athlete: AthleteProfile) -> float:
        """Score based on engagement rate (placeholder until API ready)."""
        rate = athlete.engagement_rate
        max_score = self.weights.ENGAGEMENT_QUALITY
        
        # If no engagement data, give neutral score (50%)
        if rate == 0:
            return max_score * 0.5
        
        # Industry benchmarks for engagement
        if rate >= 6.0:
            return max_score  # Excellent
        elif rate >= 4.0:
            return max_score * 0.85  # Very good
        elif rate >= 3.0:
            return max_score * 0.7  # Good
        elif rate >= 2.0:
            return max_score * 0.5  # Average
        elif rate >= 1.0:
            return max_score * 0.3  # Below average
        else:
            return max_score * 0.1  # Poor
    
    def _score_interest_tags(self, athlete: AthleteProfile, criteria: BrandCriteria) -> float:
        """Score based on overlap between athlete interests and brand industry."""
        if not criteria.target_tags or not athlete.interest_tags:
            return self.weights.INTEREST_TAG_MATCH * 0.5  # Neutral if no data
        
        # Calculate overlap
        athlete_tags = set(t.lower() for t in athlete.interest_tags)
        target_tags = set(t.lower() for t in criteria.target_tags)
        
        overlap = len(athlete_tags & target_tags)
        total_targets = len(target_tags)
        
        if total_targets == 0:
            return self.weights.INTEREST_TAG_MATCH * 0.5
        
        # Score based on percentage of target tags matched
        match_ratio = overlap / total_targets
        return self.weights.INTEREST_TAG_MATCH * min(match_ratio * 1.5, 1.0)  # Cap at max
    
    def _score_geographic_fit(self, athlete: AthleteProfile, criteria: BrandCriteria) -> float:
        """Score based on geographic/regional alignment."""
        max_score = self.weights.GEOGRAPHIC_FIT
        
        if not criteria.target_regions:
            return max_score * 0.5  # Neutral if no preference
        
        # Get athlete's region from conference
        athlete_region = CONFERENCE_REGIONS.get(athlete.conference, "")
        
        if athlete_region in criteria.target_regions:
            return max_score
        
        # Partial credit for nearby regions
        # (Could expand this with actual geographic proximity)
        return max_score * 0.3
    
    def rank_and_select(
        self, 
        scoring_results: List[ScoringResult], 
        top_n: int = 20
    ) -> List[ScoringResult]:
        """
        Sort athletes by score and return top N candidates.
        
        Args:
            scoring_results: List of scored athletes
            top_n: Maximum number to return for Claude analysis
            
        Returns:
            Top N athletes sorted by score descending
        """
        # Sort by total score descending
        sorted_results = sorted(
            scoring_results, 
            key=lambda x: x.total_score, 
            reverse=True
        )
        
        # Return top N
        selected = sorted_results[:top_n]
        
        logger.info(f"Selected top {len(selected)} athletes for AI analysis")
        if selected:
            logger.info(f"Score range: {selected[-1].total_score} - {selected[0].total_score}")
        
        return selected
    
    def process_matching_request(
        self,
        athletes: List[Dict[str, Any]],
        brand_data: Dict[str, Any],
        top_n: int = 20
    ) -> Tuple[List[ScoringResult], Dict[str, Any]]:
        """
        Complete matching pipeline: filter -> score -> rank.
        
        Args:
            athletes: List of raw athlete data
            brand_data: Raw brand intake data
            top_n: Number of top candidates for Claude
            
        Returns:
            Tuple of (top candidates, processing stats)
        """
        # Extract structured criteria
        criteria = BrandCriteria.from_brand_data(brand_data)
        
        logger.info(f"Processing match request for {criteria.company}")
        logger.info(f"Criteria: sports={criteria.preferred_sports}, min_followers={criteria.min_followers}")
        
        # Step 1: Filter
        passing_athletes, filter_stats = self.filter_candidates(athletes, criteria)
        
        if not passing_athletes:
            return [], {
                "filter_stats": filter_stats,
                "message": "No athletes passed the filters"
            }
        
        # Step 2: Score
        scoring_results = self.score_athletes(passing_athletes, criteria)
        
        # Step 3: Rank and select
        top_candidates = self.rank_and_select(scoring_results, top_n)
        
        stats = {
            "filter_stats": filter_stats,
            "total_scored": len(scoring_results),
            "top_n_selected": len(top_candidates),
            "score_range": {
                "min": top_candidates[-1].total_score if top_candidates else 0,
                "max": top_candidates[0].total_score if top_candidates else 0,
            }
        }
        
        return top_candidates, stats

