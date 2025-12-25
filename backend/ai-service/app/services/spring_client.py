"""
Spring Boot API Client

HTTP client for fetching data from the main Spring Boot API.
Used to retrieve athlete profiles, brand data, and social metrics
for the matching algorithm.
"""

from typing import Optional, List, Dict, Any
import logging
from datetime import datetime

import httpx
from pydantic import BaseModel

from app.config import get_settings
from app.models.athlete import (
    AthleteProfile,
    AthletePreferences,
    AthleteMatchData,
    SocialAccount,
    SocialSnapshot,
    Sport,
    Conference,
    SocialPlatform,
    BrandCategory,
    ContentType,
)
from app.models.brand import BrandProfile, BrandMatchData, BrandTarget

logger = logging.getLogger(__name__)
settings = get_settings()


class SpringBootClientError(Exception):
    """Exception raised when Spring Boot API call fails."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class SpringBootClient:
    """
    HTTP client for the Spring Boot NIL API.

    Usage:
        client = SpringBootClient()
        athlete = await client.get_athlete(athlete_id)
        athletes = await client.search_athletes(sport=Sport.FOOTBALL)
    """

    def __init__(self, base_url: Optional[str] = None, timeout: float = 30.0):
        """
        Initialize the Spring Boot client.

        Args:
            base_url: Base URL of Spring Boot API (defaults to settings)
            timeout: Request timeout in seconds
        """
        self.base_url = base_url or settings.main_api_url
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self.timeout,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    # TODO: Add authentication header if needed
                    # "Authorization": f"Bearer {token}"
                },
            )
        return self._client

    async def close(self):
        """Close the HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # =========================================================================
    # Athlete Endpoints
    # =========================================================================

    async def get_athlete(self, athlete_id: str) -> Optional[AthleteProfile]:
        """
        Fetch a single athlete profile by ID.

        Args:
            athlete_id: UUID of the athlete

        Returns:
            AthleteProfile or None if not found
        """
        client = await self._get_client()

        try:
            response = await client.get(f"/api/v1/athletes/{athlete_id}")

            if response.status_code == 404:
                return None

            response.raise_for_status()
            data = response.json()

            return self._parse_athlete_profile(data)

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching athlete {athlete_id}: {e}")
            raise SpringBootClientError(
                f"Failed to fetch athlete: {e.response.status_code}",
                status_code=e.response.status_code,
            )
        except httpx.RequestError as e:
            logger.error(f"Request error fetching athlete {athlete_id}: {e}")
            raise SpringBootClientError(f"Request failed: {str(e)}")

    async def get_athlete_for_matching(self, athlete_id: str) -> Optional[AthleteMatchData]:
        """
        Fetch athlete data optimized for matching operations.

        This fetches the full profile and converts it to AthleteMatchData.

        Args:
            athlete_id: UUID of the athlete

        Returns:
            AthleteMatchData or None if not found
        """
        profile = await self.get_athlete(athlete_id)
        if not profile:
            return None

        return AthleteMatchData.from_profile(profile)

    async def search_athletes(
        self,
        sport: Optional[Sport] = None,
        conference: Optional[Conference] = None,
        school: Optional[str] = None,
        min_followers: Optional[int] = None,
        min_engagement: Optional[float] = None,
        is_accepting_deals: bool = True,
        limit: int = 50,
        offset: int = 0,
    ) -> List[AthleteProfile]:
        """
        Search for athletes matching criteria.

        Args:
            sport: Filter by sport
            conference: Filter by conference
            school: Filter by school name
            min_followers: Minimum total followers
            min_engagement: Minimum engagement rate
            is_accepting_deals: Only athletes accepting deals
            limit: Maximum results
            offset: Pagination offset

        Returns:
            List of matching AthleteProfiles
        """
        client = await self._get_client()

        # Build query params
        params: Dict[str, Any] = {
            "limit": limit,
            "offset": offset,
            "isAcceptingDeals": is_accepting_deals,
        }

        if sport:
            params["sport"] = sport.value
        if conference:
            params["conference"] = conference.value
        if school:
            params["school"] = school
        if min_followers:
            params["minFollowers"] = min_followers
        if min_engagement:
            params["minEngagement"] = min_engagement

        try:
            response = await client.get("/api/v1/athletes", params=params)
            response.raise_for_status()
            data = response.json()

            # Handle paginated response
            athletes_data = data.get("content", data) if isinstance(data, dict) else data

            return [self._parse_athlete_profile(a) for a in athletes_data]

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error searching athletes: {e}")
            raise SpringBootClientError(
                f"Failed to search athletes: {e.response.status_code}",
                status_code=e.response.status_code,
            )
        except httpx.RequestError as e:
            logger.error(f"Request error searching athletes: {e}")
            raise SpringBootClientError(f"Request failed: {str(e)}")

    async def get_athlete_social_accounts(
        self,
        athlete_id: str,
    ) -> List[SocialAccount]:
        """
        Fetch social accounts for an athlete.

        Args:
            athlete_id: UUID of the athlete

        Returns:
            List of SocialAccounts
        """
        client = await self._get_client()

        try:
            response = await client.get(f"/api/v1/athletes/{athlete_id}/social")

            if response.status_code == 404:
                return []

            response.raise_for_status()
            data = response.json()

            return [self._parse_social_account(acc) for acc in data]

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching social accounts: {e}")
            return []
        except httpx.RequestError as e:
            logger.error(f"Request error fetching social accounts: {e}")
            return []

    # =========================================================================
    # Brand Endpoints
    # =========================================================================

    async def get_brand(self, brand_id: str) -> Optional[BrandProfile]:
        """
        Fetch a brand profile by ID.

        Note: Currently fetches from BrandIntakeRequest as BrandProfile
        entity doesn't exist yet. Update when BrandProfile is created.

        Args:
            brand_id: UUID of the brand/intake request

        Returns:
            BrandProfile or None if not found
        """
        client = await self._get_client()

        try:
            # TODO: Update endpoint when BrandProfile entity exists
            # Currently using intake request as proxy
            response = await client.get(f"/api/v1/intake/brand/{brand_id}")

            if response.status_code == 404:
                return None

            response.raise_for_status()
            data = response.json()

            return self._parse_brand_profile(data)

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching brand {brand_id}: {e}")
            raise SpringBootClientError(
                f"Failed to fetch brand: {e.response.status_code}",
                status_code=e.response.status_code,
            )
        except httpx.RequestError as e:
            logger.error(f"Request error fetching brand {brand_id}: {e}")
            raise SpringBootClientError(f"Request failed: {str(e)}")

    async def get_brand_for_matching(self, brand_id: str) -> Optional[BrandMatchData]:
        """
        Fetch brand data optimized for matching operations.

        Args:
            brand_id: UUID of the brand

        Returns:
            BrandMatchData or None if not found
        """
        profile = await self.get_brand(brand_id)
        if not profile:
            return None

        return BrandMatchData.from_profile(profile)

    # =========================================================================
    # Data Parsing Helpers
    # =========================================================================

    def _parse_athlete_profile(self, data: Dict[str, Any]) -> AthleteProfile:
        """
        Parse athlete profile from API response.

        Maps Spring Boot entity fields to Pydantic model.
        """
        # Parse preferences if present
        preferences = None
        if "preferences" in data and data["preferences"]:
            preferences = self._parse_preferences(data["preferences"])

        # Parse social accounts if present
        social_accounts = []
        if "socialAccounts" in data and data["socialAccounts"]:
            social_accounts = [
                self._parse_social_account(acc)
                for acc in data["socialAccounts"]
            ]

        # Parse sport enum
        sport = Sport.OTHER
        if "sport" in data and data["sport"]:
            try:
                sport = Sport(data["sport"])
            except ValueError:
                logger.warning(f"Unknown sport: {data['sport']}")

        # Parse conference enum
        conference = None
        if "conference" in data and data["conference"]:
            try:
                conference = Conference(data["conference"])
            except ValueError:
                logger.warning(f"Unknown conference: {data['conference']}")

        return AthleteProfile(
            athlete_id=data.get("id", ""),
            user_id=data.get("userId"),
            display_name=data.get("displayName", "Unknown"),
            date_of_birth=data.get("dateOfBirth"),
            gender=data.get("gender"),
            ethnicity=data.get("ethnicity"),
            hometown=data.get("hometown"),
            home_state=data.get("homeState"),
            bio=data.get("bio"),
            sport=sport,
            position=data.get("position"),
            jersey_number=data.get("jerseyNumber"),
            school=data.get("school"),
            conference=conference,
            class_year=data.get("classYear"),
            eligibility_years=data.get("eligibilityYear"),
            gpa=data.get("gpa"),
            major=data.get("major"),
            team_ranking=data.get("teamRanking"),
            stats_summary=data.get("statsSummary"),
            awards=data.get("awards", []),
            achievements=data.get("achievements"),
            has_existing_deals=data.get("hasExistingDeals", False),
            existing_deals_summary=data.get("existingDealsSummary"),
            minimum_deal_value=data.get("minimumDealValue"),
            preferred_deal_types=data.get("preferredDealTypes", []),
            exclusivity_restrictions=data.get("exclusivityRestrictions"),
            profile_completeness_score=data.get("profileCompletenessScore", 0),
            is_verified=data.get("isVerified", False),
            is_active=data.get("isActive", True),
            is_accepting_deals=data.get("isAcceptingDeals", True),
            preferences=preferences,
            social_accounts=social_accounts,
        )

    def _parse_preferences(self, data: Dict[str, Any]) -> AthletePreferences:
        """Parse athlete preferences from API response."""

        def parse_brand_categories(items: List[str]) -> List[BrandCategory]:
            categories = []
            for item in items or []:
                try:
                    categories.append(BrandCategory(item))
                except ValueError:
                    pass
            return categories

        def parse_content_types(items: List[str]) -> List[ContentType]:
            types = []
            for item in items or []:
                try:
                    types.append(ContentType(item))
                except ValueError:
                    pass
            return types

        return AthletePreferences(
            preferences_id=data.get("id"),
            liked_categories=parse_brand_categories(data.get("likedCategories", [])),
            disliked_categories=parse_brand_categories(data.get("dislikedCategories", [])),
            preferred_brands=data.get("preferredBrands", []),
            excluded_brands=data.get("excludedBrands", []),
            content_types=parse_content_types(data.get("contentTypes", [])),
            content_themes=data.get("contentThemes", []),
            personality_tags=data.get("personalityTags", []),
            willing_to_travel=data.get("willingToTravel", True),
            max_travel_distance=data.get("maxTravelDistance", 0),
            available_regions=data.get("availableRegions", []),
            preferred_compensation=data.get("preferredCompensation"),
            minimum_cash=data.get("minimumCash"),
            accepts_product_only=data.get("acceptsProductOnly", False),
            school_restricted_categories=parse_brand_categories(
                data.get("schoolRestrictedCategories", [])
            ),
        )

    def _parse_social_account(self, data: Dict[str, Any]) -> SocialAccount:
        """Parse social account from API response."""

        # Parse platform enum
        platform = SocialPlatform.OTHER
        if "platform" in data and data["platform"]:
            try:
                platform = SocialPlatform(data["platform"])
            except ValueError:
                logger.warning(f"Unknown platform: {data['platform']}")

        # Parse latest snapshot if present
        latest_snapshot = None
        if "latestSnapshot" in data and data["latestSnapshot"]:
            latest_snapshot = self._parse_social_snapshot(data["latestSnapshot"])

        return SocialAccount(
            account_id=data.get("id"),
            platform=platform,
            handle=data.get("handle", ""),
            profile_url=data.get("profileUrl"),
            is_verified=data.get("isVerified", False),
            is_connected=data.get("isConnected", False),
            followers=data.get("followers", 0),
            following=data.get("following", 0),
            posts_count=data.get("postsCount", 0),
            engagement_rate=data.get("engagementRate", 0.0),
            avg_likes=data.get("avgLikes", 0),
            avg_comments=data.get("avgComments", 0),
            avg_views=data.get("avgViews", 0),
            latest_snapshot=latest_snapshot,
        )

    def _parse_social_snapshot(self, data: Dict[str, Any]) -> SocialSnapshot:
        """Parse social snapshot from API response."""
        return SocialSnapshot(
            snapshot_id=data.get("id"),
            snapshot_timestamp=data.get("snapshotTimestamp"),
            followers=data.get("followers", 0),
            following=data.get("following", 0),
            posts_count=data.get("postsCount", 0),
            engagement_rate=data.get("engagementRate", 0.0),
            avg_likes=data.get("avgLikes", 0),
            avg_comments=data.get("avgComments", 0),
            avg_views=data.get("avgViews", 0),
            avg_shares=data.get("avgShares", 0),
            avg_saves=data.get("avgSaves", 0),
            audience_age_distribution=data.get("audienceAgeDistribution", {}),
            audience_gender_distribution=data.get("audienceGenderDistribution", {}),
            audience_top_locations=data.get("audienceTopLocations", []),
            audience_top_countries=data.get("audienceTopCountries", []),
            posting_frequency=data.get("postingFrequency", 0.0),
        )

    def _parse_brand_profile(self, data: Dict[str, Any]) -> BrandProfile:
        """
        Parse brand profile from API response.

        Currently parses BrandIntakeRequest data.
        Update when BrandProfile entity is created.
        """

        # Parse category from industry
        category = None
        if "industry" in data and data["industry"]:
            try:
                category = BrandCategory(data["industry"].upper().replace(" ", "_"))
            except ValueError:
                pass

        # Parse target audience from text field
        target_audience = None
        if "targetAudience" in data and data["targetAudience"]:
            # TODO: Parse target audience text into BrandTarget
            target_audience = BrandTarget(
                is_national=True,  # Default assumption
            )

        return BrandProfile(
            brand_id=data.get("id", ""),
            company_name=data.get("company", "Unknown"),
            contact_name=f"{data.get('contactFirstName', '')} {data.get('contactLastName', '')}".strip(),
            contact_email=data.get("email"),
            website=data.get("website"),
            industry=data.get("industry"),
            category=category,
            company_size=data.get("companySize"),
            description=data.get("description"),
            budget_range=data.get("budget"),
            target_audience=target_audience,
            is_active=data.get("status") == "APPROVED",
            created_at=data.get("createdAt"),
        )


# ============= Singleton instance =============

_client_instance: Optional[SpringBootClient] = None


def get_spring_client() -> SpringBootClient:
    """Get or create Spring Boot client instance."""
    global _client_instance
    if _client_instance is None:
        _client_instance = SpringBootClient()
    return _client_instance
