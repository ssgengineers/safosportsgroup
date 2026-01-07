"""
NIL Platform API Client

HTTP client for fetching athlete and brand data from the main Spring Boot API.
This allows the AI service to retrieve full profiles using just IDs.
"""

import logging
import json
import re
from typing import Dict, Any, Optional, List
import httpx
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class NILApiClient:
    """Client for interacting with the main NIL Platform API (Spring Boot)."""

    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize the API client.

        Args:
            base_url: Optional base URL override. Defaults to settings.main_api_url
        """
        self.base_url = (base_url or settings.main_api_url).rstrip("/")
        self.timeout = httpx.Timeout(30.0, connect=10.0)

    async def get_athlete_profile(self, athlete_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch an athlete profile by ID.

        Args:
            athlete_id: UUID of the athlete profile

        Returns:
            Athlete profile data or None if not found
        """
        url = f"{self.base_url}/api/v1/athletes/{athlete_id}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)

                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    logger.warning(f"Athlete not found: {athlete_id}")
                    return None
                else:
                    logger.error(f"Failed to fetch athlete {athlete_id}: {response.status_code}")
                    return None

        except httpx.RequestError as e:
            logger.error(f"Request error fetching athlete {athlete_id}: {e}")
            return None

    async def get_athlete_profiles(self, athlete_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Fetch multiple athlete profiles by IDs.

        Args:
            athlete_ids: List of athlete profile UUIDs

        Returns:
            List of athlete profile data (excludes failed fetches)
        """
        profiles = []

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for athlete_id in athlete_ids:
                try:
                    url = f"{self.base_url}/api/v1/athletes/{athlete_id}"
                    response = await client.get(url)

                    if response.status_code == 200:
                        profiles.append(response.json())
                    else:
                        logger.warning(f"Failed to fetch athlete {athlete_id}: {response.status_code}")

                except httpx.RequestError as e:
                    logger.error(f"Request error fetching athlete {athlete_id}: {e}")

        return profiles

    async def get_all_athletes(
        self,
        page: int = 0,
        size: int = 100,
        sport: Optional[str] = None,
        conference: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fetch paginated list of all athlete profiles.

        Args:
            page: Page number (0-indexed)
            size: Number of results per page
            sport: Optional sport filter
            conference: Optional conference filter

        Returns:
            Paginated response with content and metadata
        """
        url = f"{self.base_url}/api/v1/athletes"
        params = {"page": page, "size": size}

        if sport:
            params["sport"] = sport
        if conference:
            params["conference"] = conference

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to fetch athletes: {response.status_code}")
                    return {"content": [], "totalElements": 0}

        except httpx.RequestError as e:
            logger.error(f"Request error fetching athletes: {e}")
            return {"content": [], "totalElements": 0}

    async def get_brand_profile(self, brand_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a brand profile by ID.

        Args:
            brand_id: UUID of the brand profile

        Returns:
            Brand profile data or None if not found
        """
        url = f"{self.base_url}/api/v1/brands/{brand_id}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)

                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    logger.warning(f"Brand profile not found: {brand_id}")
                    return None
                else:
                    logger.error(f"Failed to fetch brand profile {brand_id}: {response.status_code}")
                    return None

        except httpx.RequestError as e:
            logger.error(f"Request error fetching brand profile {brand_id}: {e}")
            return None

    async def get_brand_intake(self, brand_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a brand intake request by ID.
        Also tries to fetch brand profile if intake not found.

        Args:
            brand_id: UUID of the brand intake request or brand profile

        Returns:
            Brand intake/profile data or None if not found
        """
        # First try brand profile (more common in dashboards)
        brand_profile = await self.get_brand_profile(brand_id)
        if brand_profile:
            # Convert brand profile to format compatible with intake
            # Map brand profile fields to intake format for compatibility
            
            # Parse JSON fields if they're strings
            preferred_sports = brand_profile.get("preferredSports")
            if isinstance(preferred_sports, str):
                try:
                    preferred_sports = json.loads(preferred_sports)
                except (json.JSONDecodeError, TypeError):
                    preferred_sports = []
            elif not isinstance(preferred_sports, list):
                preferred_sports = []
            
            preferred_conferences = brand_profile.get("preferredConferences")
            if isinstance(preferred_conferences, str):
                try:
                    preferred_conferences = json.loads(preferred_conferences)
                except (json.JSONDecodeError, TypeError):
                    preferred_conferences = []
            elif not isinstance(preferred_conferences, list):
                preferred_conferences = []
            
            interest_alignment = brand_profile.get("interestAlignment")
            if isinstance(interest_alignment, str):
                try:
                    interest_alignment = json.loads(interest_alignment)
                except (json.JSONDecodeError, TypeError):
                    interest_alignment = []
            elif not isinstance(interest_alignment, list):
                interest_alignment = []
            
            content_preferences = brand_profile.get("contentPreferences")
            if isinstance(content_preferences, str):
                try:
                    content_preferences = json.loads(content_preferences)
                except (json.JSONDecodeError, TypeError):
                    content_preferences = []
            elif not isinstance(content_preferences, list):
                content_preferences = []
            
            # Parse minFollowers as integer if it's a string
            min_followers = brand_profile.get("minFollowers")
            if isinstance(min_followers, str):
                # Extract numbers from string like "50K" -> 50000
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
            
            intake_format = {
                "id": brand_profile.get("id"),
                "company": brand_profile.get("companyName"),
                "contactFirstName": brand_profile.get("contactFirstName"),
                "contactLastName": brand_profile.get("contactLastName"),
                "contactTitle": brand_profile.get("contactTitle"),
                "email": brand_profile.get("contactEmail"),
                "phone": brand_profile.get("contactPhone"),
                "website": brand_profile.get("website"),
                "industry": brand_profile.get("industry"),
                "companySize": brand_profile.get("companySize"),
                "budget": brand_profile.get("budgetRange") or brand_profile.get("budgetPerAthlete"),
                "description": brand_profile.get("description"),
                "targetAudience": brand_profile.get("targetAudience"),
                "goals": brand_profile.get("marketingGoals"),
                "timeline": brand_profile.get("preferredTimeline") or brand_profile.get("dealDuration"),
                "athletePreferences": brand_profile.get("athletePreferences") or brand_profile.get("matchingNotes"),
                # Add brand profile specific fields (parsed)
                "preferredSports": preferred_sports,
                "preferredConferences": preferred_conferences,
                "minFollowers": min_followers,
                "maxFollowers": brand_profile.get("maxFollowers"),
                "interestAlignment": interest_alignment,
                "contentPreferences": content_preferences,
                "budgetPerAthlete": brand_profile.get("budgetPerAthlete"),
                "dealDuration": brand_profile.get("dealDuration"),
                "matchingNotes": brand_profile.get("matchingNotes"),
            }
            return intake_format

        # Fall back to brand intake endpoint
        url = f"{self.base_url}/api/v1/admin/intakes/brands/{brand_id}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)

                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 404:
                    logger.warning(f"Brand intake not found: {brand_id}")
                    return None
                else:
                    logger.error(f"Failed to fetch brand {brand_id}: {response.status_code}")
                    return None

        except httpx.RequestError as e:
            logger.error(f"Request error fetching brand {brand_id}: {e}")
            return None

    async def get_all_brand_profiles(
        self,
        page: int = 0,
        size: int = 100
    ) -> Dict[str, Any]:
        """
        Fetch paginated list of brand profiles (active brands on the platform).

        Args:
            page: Page number (0-indexed)
            size: Number of results per page

        Returns:
            Paginated response with content and metadata
        """
        url = f"{self.base_url}/api/v1/brands"
        params = {"page": page, "size": size}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)

                if response.status_code == 200:
                    # Spring Boot returns Page object, convert to our format
                    page_data = response.json()
                    # Spring Boot Page format: {content: [], totalElements: 0, ...}
                    return {
                        "content": page_data.get("content", []),
                        "totalElements": page_data.get("totalElements", 0)
                    }
                else:
                    logger.error(f"Failed to fetch brand profiles: {response.status_code}")
                    return {"content": [], "totalElements": 0}

        except httpx.RequestError as e:
            logger.error(f"Request error fetching brand profiles: {e}")
            return {"content": [], "totalElements": 0}

    async def get_all_brand_intakes(
        self,
        status: Optional[str] = None,
        page: int = 0,
        size: int = 100
    ) -> Dict[str, Any]:
        """
        Fetch paginated list of brand intake requests.

        Args:
            status: Optional status filter (PENDING, APPROVED, REJECTED)
            page: Page number (0-indexed)
            size: Number of results per page

        Returns:
            Paginated response with content and metadata
        """
        url = f"{self.base_url}/api/v1/admin/intakes/brands"
        params = {"page": page, "size": size}

        if status:
            params["status"] = status

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to fetch brand intakes: {response.status_code}")
                    return {"content": [], "totalElements": 0}

        except httpx.RequestError as e:
            logger.error(f"Request error fetching brand intakes: {e}")
            return {"content": [], "totalElements": 0}

    async def health_check(self) -> bool:
        """
        Check if the main API is healthy.

        Returns:
            True if API is reachable, False otherwise
        """
        url = f"{self.base_url}/api/v1/health"

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
                response = await client.get(url)
                return response.status_code == 200

        except httpx.RequestError:
            return False
