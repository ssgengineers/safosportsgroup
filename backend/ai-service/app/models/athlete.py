"""
Athlete-related Pydantic models.

These models mirror the Spring Boot entities:
- AthleteProfile
- AthletePreferences
- AthleteSocialAccount
- AthleteSocialSnapshot
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum
from datetime import date, datetime


# ============= Enums (Mirror Java Enums) =============

class Sport(str, Enum):
    """Sports enum - mirrors backend/nil-api Sport.java"""
    # Major Sports
    FOOTBALL = "FOOTBALL"
    BASKETBALL = "BASKETBALL"
    MENS_BASKETBALL = "MENS_BASKETBALL"
    WOMENS_BASKETBALL = "WOMENS_BASKETBALL"
    BASEBALL = "BASEBALL"
    SOFTBALL = "SOFTBALL"
    SOCCER = "SOCCER"
    MENS_SOCCER = "MENS_SOCCER"
    WOMENS_SOCCER = "WOMENS_SOCCER"
    VOLLEYBALL = "VOLLEYBALL"

    # Track & Field
    TRACK_AND_FIELD = "TRACK_AND_FIELD"
    CROSS_COUNTRY = "CROSS_COUNTRY"

    # Swimming & Aquatics
    SWIMMING = "SWIMMING"
    DIVING = "DIVING"
    WATER_POLO = "WATER_POLO"

    # Racquet Sports
    TENNIS = "TENNIS"

    # Golf
    GOLF = "GOLF"

    # Combat Sports
    WRESTLING = "WRESTLING"

    # Gymnastics
    GYMNASTICS = "GYMNASTICS"

    # Other Team Sports
    LACROSSE = "LACROSSE"
    HOCKEY = "HOCKEY"
    FIELD_HOCKEY = "FIELD_HOCKEY"
    ICE_HOCKEY = "ICE_HOCKEY"

    # Rowing
    ROWING = "ROWING"

    # Spirit
    CHEERLEADING = "CHEERLEADING"
    DANCE = "DANCE"

    # E-Sports
    ESPORTS = "ESPORTS"

    # Other
    OTHER = "OTHER"


class Conference(str, Enum):
    """NCAA Conference enum - mirrors backend/nil-api Conference.java"""
    # Power Five
    SEC = "SEC"
    BIG_TEN = "BIG_TEN"
    BIG_12 = "BIG_12"
    ACC = "ACC"
    PAC_12 = "PAC_12"

    # Group of Five
    AAC = "AAC"
    MOUNTAIN_WEST = "MOUNTAIN_WEST"
    MAC = "MAC"
    SUN_BELT = "SUN_BELT"
    CONFERENCE_USA = "CONFERENCE_USA"

    # FCS Conferences
    IVY_LEAGUE = "IVY_LEAGUE"

    # Other
    INDEPENDENT = "INDEPENDENT"
    NAIA = "NAIA"
    JUCO = "JUCO"
    D2 = "D2"
    D3 = "D3"
    OTHER = "OTHER"


class SocialPlatform(str, Enum):
    """Social media platforms - mirrors backend/nil-api SocialPlatform.java"""
    INSTAGRAM = "INSTAGRAM"
    TIKTOK = "TIKTOK"
    YOUTUBE = "YOUTUBE"
    TWITTER = "TWITTER"
    TWITCH = "TWITCH"
    FACEBOOK = "FACEBOOK"
    LINKEDIN = "LINKEDIN"
    SNAPCHAT = "SNAPCHAT"
    THREADS = "THREADS"
    OTHER = "OTHER"


class BrandCategory(str, Enum):
    """Brand/Industry categories - mirrors backend/nil-api BrandCategory.java"""
    # Apparel & Fashion
    ATHLETIC_APPAREL = "ATHLETIC_APPAREL"
    FOOTWEAR = "FOOTWEAR"
    CASUAL_FASHION = "CASUAL_FASHION"
    LUXURY_FASHION = "LUXURY_FASHION"
    STREETWEAR = "STREETWEAR"

    # Food & Beverage
    SPORTS_NUTRITION = "SPORTS_NUTRITION"
    ENERGY_DRINKS = "ENERGY_DRINKS"
    FAST_FOOD = "FAST_FOOD"
    HEALTHY_FOOD = "HEALTHY_FOOD"
    RESTAURANTS = "RESTAURANTS"
    ALCOHOL = "ALCOHOL"

    # Technology
    ELECTRONICS = "ELECTRONICS"
    GAMING = "GAMING"
    SOFTWARE_APPS = "SOFTWARE_APPS"
    WEARABLES = "WEARABLES"

    # Health & Wellness
    FITNESS_EQUIPMENT = "FITNESS_EQUIPMENT"
    SUPPLEMENTS = "SUPPLEMENTS"
    WELLNESS_SERVICES = "WELLNESS_SERVICES"
    HEALTHCARE = "HEALTHCARE"

    # Financial
    BANKING = "BANKING"
    CRYPTO = "CRYPTO"
    INSURANCE = "INSURANCE"
    INVESTING = "INVESTING"

    # Automotive
    CARS = "CARS"
    MOTORCYCLES = "MOTORCYCLES"
    AUTO_ACCESSORIES = "AUTO_ACCESSORIES"

    # Entertainment
    STREAMING_SERVICES = "STREAMING_SERVICES"
    MUSIC = "MUSIC"
    MOVIES_TV = "MOVIES_TV"
    VIDEO_GAMES = "VIDEO_GAMES"

    # Personal Care
    SKINCARE = "SKINCARE"
    HAIRCARE = "HAIRCARE"
    GROOMING = "GROOMING"

    # Sports
    SPORTS_EQUIPMENT = "SPORTS_EQUIPMENT"
    SPORTS_BETTING = "SPORTS_BETTING"
    SPORTS_MEMORABILIA = "SPORTS_MEMORABILIA"

    # Other
    LOCAL_BUSINESS = "LOCAL_BUSINESS"
    NONPROFIT = "NONPROFIT"
    OTHER = "OTHER"


class ContentType(str, Enum):
    """Content creation types - mirrors backend/nil-api ContentType.java"""
    # Video
    REELS = "REELS"
    TIKTOK_VIDEOS = "TIKTOK_VIDEOS"
    YOUTUBE_VIDEOS = "YOUTUBE_VIDEOS"
    LIVE_STREAMS = "LIVE_STREAMS"

    # Static
    PHOTO_POSTS = "PHOTO_POSTS"
    STORIES = "STORIES"
    CAROUSEL_POSTS = "CAROUSEL_POSTS"

    # Interactive
    Q_AND_A = "Q_AND_A"
    POLLS = "POLLS"
    CHALLENGES = "CHALLENGES"

    # Appearances
    IN_PERSON_APPEARANCES = "IN_PERSON_APPEARANCES"
    AUTOGRAPH_SIGNINGS = "AUTOGRAPH_SIGNINGS"
    SPEAKING_ENGAGEMENTS = "SPEAKING_ENGAGEMENTS"

    # Product
    PRODUCT_REVIEWS = "PRODUCT_REVIEWS"
    UNBOXING = "UNBOXING"
    TUTORIALS = "TUTORIALS"

    # Other
    PODCAST_APPEARANCES = "PODCAST_APPEARANCES"
    INTERVIEWS = "INTERVIEWS"
    BRAND_AMBASSADOR = "BRAND_AMBASSADOR"


# ============= Data Models =============

class SocialSnapshot(BaseModel):
    """
    Point-in-time social media metrics with audience demographics.
    Mirrors AthleteSocialSnapshot.java
    """
    snapshot_id: Optional[str] = None
    snapshot_timestamp: Optional[datetime] = None

    # Core metrics
    followers: int = 0
    following: int = 0
    posts_count: int = 0

    # Engagement metrics
    engagement_rate: float = 0.0
    avg_likes: int = 0
    avg_comments: int = 0
    avg_views: int = 0
    avg_shares: int = 0
    avg_saves: int = 0

    # Audience demographics (parsed from JSON)
    audience_age_distribution: Dict[str, float] = Field(
        default_factory=dict,
        description="Age distribution, e.g., {'13-17': 5, '18-24': 45, '25-34': 35}"
    )
    audience_gender_distribution: Dict[str, float] = Field(
        default_factory=dict,
        description="Gender distribution, e.g., {'male': 60, 'female': 38, 'other': 2}"
    )
    audience_top_locations: List[Dict[str, any]] = Field(
        default_factory=list,
        description="Top locations with city/region and percentage"
    )
    audience_top_countries: List[Dict[str, any]] = Field(
        default_factory=list,
        description="Top countries with percentage"
    )

    # Content performance
    posting_frequency: float = Field(
        default=0.0,
        description="Average posts per week"
    )


class SocialAccount(BaseModel):
    """
    Connected social media account with current metrics.
    Mirrors AthleteSocialAccount.java
    """
    account_id: Optional[str] = None
    platform: SocialPlatform
    handle: str = Field(..., description="@username")
    profile_url: Optional[str] = None
    is_verified: bool = False
    is_connected: bool = False

    # Current metrics (latest snapshot)
    followers: int = 0
    following: int = 0
    posts_count: int = 0
    engagement_rate: float = Field(
        default=0.0,
        description="Engagement rate as percentage (e.g., 4.5 = 4.5%)"
    )
    avg_likes: int = 0
    avg_comments: int = 0
    avg_views: int = 0

    # Latest snapshot for detailed demographics
    latest_snapshot: Optional[SocialSnapshot] = None


class AthletePreferences(BaseModel):
    """
    Athlete's brand and content preferences.
    Mirrors AthletePreferences.java
    """
    preferences_id: Optional[str] = None

    # Brand category preferences
    liked_categories: List[BrandCategory] = Field(default_factory=list)
    disliked_categories: List[BrandCategory] = Field(default_factory=list)
    preferred_brands: List[str] = Field(
        default_factory=list,
        description="Specific brand names athlete prefers"
    )
    excluded_brands: List[str] = Field(
        default_factory=list,
        description="Specific brand names athlete will not work with"
    )

    # Content preferences
    content_types: List[ContentType] = Field(default_factory=list)
    content_themes: List[str] = Field(
        default_factory=list,
        description="Themes like 'fitness', 'fashion', 'gaming', 'lifestyle'"
    )
    personality_tags: List[str] = Field(
        default_factory=list,
        description="Tags like 'funny', 'inspirational', 'family-friendly'"
    )

    # Availability & Travel
    willing_to_travel: bool = True
    max_travel_distance: int = Field(
        default=0,
        description="Miles, 0 = no limit"
    )
    available_regions: List[str] = Field(
        default_factory=list,
        description="Regions like 'Northeast', 'DMV', 'National'"
    )

    # Compensation preferences
    preferred_compensation: Optional[str] = Field(
        default=None,
        description="FLAT_FEE, COMMISSION, HYBRID, PRODUCT_ONLY"
    )
    minimum_cash: Optional[float] = None
    accepts_product_only: bool = False

    # Compliance
    school_restricted_categories: List[BrandCategory] = Field(
        default_factory=list,
        description="Categories restricted by school/NCAA"
    )


class AthleteProfile(BaseModel):
    """
    Complete athlete profile with all related data.
    Mirrors AthleteProfile.java
    """
    athlete_id: str
    user_id: Optional[str] = None

    # Identity & Demographics
    display_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    ethnicity: Optional[str] = None
    hometown: Optional[str] = None
    home_state: Optional[str] = None
    bio: Optional[str] = None

    # Athletic Background
    sport: Sport
    position: Optional[str] = None
    jersey_number: Optional[str] = None
    school: Optional[str] = None
    conference: Optional[Conference] = None
    class_year: Optional[str] = Field(
        default=None,
        description="Freshman, Sophomore, Junior, Senior, Graduate"
    )
    eligibility_years: Optional[int] = None
    gpa: Optional[float] = None
    major: Optional[str] = None

    # Performance & Recognition
    team_ranking: Optional[int] = None
    stats_summary: Optional[Dict] = None
    awards: List[str] = Field(default_factory=list)
    achievements: Optional[str] = None

    # NIL & Contract Information
    has_existing_deals: bool = False
    existing_deals_summary: Optional[str] = None
    minimum_deal_value: Optional[float] = None
    preferred_deal_types: List[str] = Field(default_factory=list)
    exclusivity_restrictions: Optional[str] = None

    # Profile Status
    profile_completeness_score: int = Field(default=0, ge=0, le=100)
    is_verified: bool = False
    is_active: bool = True
    is_accepting_deals: bool = True

    # Related data
    preferences: Optional[AthletePreferences] = None
    social_accounts: List[SocialAccount] = Field(default_factory=list)

    # Computed properties
    @property
    def total_followers(self) -> int:
        """Sum of followers across all social accounts."""
        return sum(acc.followers for acc in self.social_accounts)

    @property
    def average_engagement_rate(self) -> float:
        """Average engagement rate across accounts with data."""
        rates = [acc.engagement_rate for acc in self.social_accounts if acc.engagement_rate > 0]
        return sum(rates) / len(rates) if rates else 0.0

    @property
    def primary_social_account(self) -> Optional[SocialAccount]:
        """Account with highest follower count."""
        if not self.social_accounts:
            return None
        return max(self.social_accounts, key=lambda x: x.followers)


# ============= Request/Response Models for API =============

class AthleteMatchData(BaseModel):
    """
    Simplified athlete data used for matching operations.
    Used when we don't need the full profile.
    """
    athlete_id: str
    display_name: str
    sport: Sport
    school: Optional[str] = None
    conference: Optional[Conference] = None

    # Aggregated social metrics
    total_followers: int = 0
    avg_engagement_rate: float = 0.0
    primary_platform: Optional[SocialPlatform] = None

    # Key preferences for matching
    liked_categories: List[BrandCategory] = Field(default_factory=list)
    disliked_categories: List[BrandCategory] = Field(default_factory=list)
    excluded_brands: List[str] = Field(default_factory=list)
    content_types: List[ContentType] = Field(default_factory=list)
    school_restricted_categories: List[BrandCategory] = Field(default_factory=list)

    # Audience demographics (from primary account snapshot)
    audience_age_distribution: Dict[str, float] = Field(default_factory=dict)
    audience_gender_distribution: Dict[str, float] = Field(default_factory=dict)
    audience_top_locations: List[str] = Field(default_factory=list)

    @classmethod
    def from_profile(cls, profile: AthleteProfile) -> "AthleteMatchData":
        """Create match data from full profile."""
        primary = profile.primary_social_account
        snapshot = primary.latest_snapshot if primary else None

        return cls(
            athlete_id=profile.athlete_id,
            display_name=profile.display_name,
            sport=profile.sport,
            school=profile.school,
            conference=profile.conference,
            total_followers=profile.total_followers,
            avg_engagement_rate=profile.average_engagement_rate,
            primary_platform=primary.platform if primary else None,
            liked_categories=profile.preferences.liked_categories if profile.preferences else [],
            disliked_categories=profile.preferences.disliked_categories if profile.preferences else [],
            excluded_brands=profile.preferences.excluded_brands if profile.preferences else [],
            content_types=profile.preferences.content_types if profile.preferences else [],
            school_restricted_categories=profile.preferences.school_restricted_categories if profile.preferences else [],
            audience_age_distribution=snapshot.audience_age_distribution if snapshot else {},
            audience_gender_distribution=snapshot.audience_gender_distribution if snapshot else {},
            audience_top_locations=[loc.get("name", "") for loc in (snapshot.audience_top_locations if snapshot else [])],
        )
