"""
Brand-related Pydantic models.

Note: Spring Boot currently only has BrandIntakeRequest.
These models anticipate a future BrandProfile entity and provide
structure for matching operations.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

from .athlete import BrandCategory, ContentType, Sport, Conference


class BrandTarget(BaseModel):
    """
    Brand's target audience demographics for matching.
    Used to compare against athlete audience data.
    """
    # Age targeting
    age_ranges: List[str] = Field(
        default_factory=list,
        description="Target age ranges, e.g., ['18-24', '25-34']"
    )
    min_age: Optional[int] = None
    max_age: Optional[int] = None

    # Gender targeting
    gender_preference: Optional[str] = Field(
        default=None,
        description="'male', 'female', 'all', or specific percentage target"
    )
    gender_distribution: Dict[str, float] = Field(
        default_factory=dict,
        description="Ideal gender split, e.g., {'male': 60, 'female': 40}"
    )

    # Geographic targeting
    target_regions: List[str] = Field(
        default_factory=list,
        description="Target regions, e.g., ['Northeast', 'Southeast', 'National']"
    )
    target_states: List[str] = Field(default_factory=list)
    target_countries: List[str] = Field(
        default_factory=lambda: ["US"],
        description="Target countries, defaults to US"
    )
    is_national: bool = Field(
        default=False,
        description="True if brand targets national audience"
    )
    is_local: bool = Field(
        default=False,
        description="True if brand is local/regional"
    )

    # Interest/Lifestyle targeting
    interests: List[str] = Field(
        default_factory=list,
        description="Target interests like 'fitness', 'gaming', 'fashion'"
    )


class BrandProfile(BaseModel):
    """
    Brand profile for matching operations.

    Currently constructed from BrandIntakeRequest data.
    Will be updated when BrandProfile entity is created in Spring Boot.
    """
    brand_id: str
    organization_id: Optional[str] = None

    # Basic Information
    company_name: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    website: Optional[str] = None

    # Company Details
    industry: Optional[str] = None
    category: Optional[BrandCategory] = None
    company_size: Optional[str] = Field(
        default=None,
        description="e.g., 'Startup', 'SMB', 'Enterprise'"
    )
    description: Optional[str] = None

    # Brand Identity
    mission: Optional[str] = None
    values: List[str] = Field(
        default_factory=list,
        description="Brand values like 'sustainability', 'innovation', 'community'"
    )
    personality_traits: List[str] = Field(
        default_factory=list,
        description="Brand personality like 'edgy', 'family-friendly', 'premium'"
    )

    # NIL Campaign Preferences
    budget_range: Optional[str] = Field(
        default=None,
        description="Budget range like '$1,000-$5,000', '$10,000+'"
    )
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None

    # Target Athletes
    target_audience: Optional[BrandTarget] = None
    preferred_sports: List[Sport] = Field(default_factory=list)
    preferred_conferences: List[Conference] = Field(default_factory=list)
    min_followers: Optional[int] = None
    min_engagement_rate: Optional[float] = None

    # Content Requirements
    required_content_types: List[ContentType] = Field(default_factory=list)
    content_guidelines: Optional[str] = None

    # Exclusions
    excluded_sports: List[Sport] = Field(default_factory=list)
    competitor_brands: List[str] = Field(
        default_factory=list,
        description="Competitor brands to avoid athletes with deals"
    )

    # Status
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[datetime] = None


class CampaignBrief(BaseModel):
    """
    Specific campaign requirements for matching.
    Used for campaign-specific athlete discovery.
    """
    campaign_id: str
    brand_id: str
    brand: Optional[BrandProfile] = None

    # Campaign Details
    campaign_name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    # Budget
    total_budget: Optional[float] = None
    budget_per_athlete: Optional[float] = None
    max_athletes: int = Field(default=10, ge=1, le=100)

    # Athlete Requirements
    target_audience: Optional[BrandTarget] = None
    required_sports: List[Sport] = Field(default_factory=list)
    required_conferences: List[Conference] = Field(default_factory=list)
    min_followers: Optional[int] = None
    max_followers: Optional[int] = None
    min_engagement_rate: Optional[float] = None

    # Content Requirements
    required_content_types: List[ContentType] = Field(default_factory=list)
    deliverables: List[str] = Field(
        default_factory=list,
        description="Specific deliverables like '3 Instagram posts', '1 TikTok video'"
    )

    # Exclusions
    excluded_athletes: List[str] = Field(
        default_factory=list,
        description="Athlete IDs to exclude"
    )
    excluded_schools: List[str] = Field(default_factory=list)

    # Matching preferences
    prioritize_engagement_over_reach: bool = Field(
        default=False,
        description="If true, prefer high engagement over follower count"
    )
    require_verified_accounts: bool = False
    require_existing_deal_experience: bool = False


class BrandMatchData(BaseModel):
    """
    Simplified brand data used for matching operations.
    Used when we don't need the full profile.
    """
    brand_id: str
    company_name: str
    category: Optional[BrandCategory] = None
    industry: Optional[str] = None

    # Target demographics
    target_audience: Optional[BrandTarget] = None

    # Athlete preferences
    preferred_sports: List[Sport] = Field(default_factory=list)
    preferred_conferences: List[Conference] = Field(default_factory=list)
    min_followers: Optional[int] = None
    min_engagement_rate: Optional[float] = None

    # Content requirements
    required_content_types: List[ContentType] = Field(default_factory=list)

    # Brand values for alignment scoring
    values: List[str] = Field(default_factory=list)
    personality_traits: List[str] = Field(default_factory=list)

    @classmethod
    def from_profile(cls, profile: BrandProfile) -> "BrandMatchData":
        """Create match data from full profile."""
        return cls(
            brand_id=profile.brand_id,
            company_name=profile.company_name,
            category=profile.category,
            industry=profile.industry,
            target_audience=profile.target_audience,
            preferred_sports=profile.preferred_sports,
            preferred_conferences=profile.preferred_conferences,
            min_followers=profile.min_followers,
            min_engagement_rate=profile.min_engagement_rate,
            required_content_types=profile.required_content_types,
            values=profile.values,
            personality_traits=profile.personality_traits,
        )

    @classmethod
    def from_campaign(cls, campaign: CampaignBrief) -> "BrandMatchData":
        """Create match data from campaign brief."""
        return cls(
            brand_id=campaign.brand_id,
            company_name=campaign.brand.company_name if campaign.brand else "Unknown",
            category=campaign.brand.category if campaign.brand else None,
            industry=campaign.brand.industry if campaign.brand else None,
            target_audience=campaign.target_audience,
            preferred_sports=campaign.required_sports,
            preferred_conferences=campaign.required_conferences,
            min_followers=campaign.min_followers,
            min_engagement_rate=campaign.min_engagement_rate,
            required_content_types=campaign.required_content_types,
            values=campaign.brand.values if campaign.brand else [],
            personality_traits=campaign.brand.personality_traits if campaign.brand else [],
        )
