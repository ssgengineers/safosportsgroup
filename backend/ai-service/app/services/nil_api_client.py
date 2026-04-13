"""
NIL Platform API Client

HTTP client for fetching athlete and brand data from the main Spring Boot API.
This allows the AI service to retrieve full profiles using just IDs.
"""

import logging
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

        Uses the brand profile endpoint which contains enriched data
        including AI matching preferences (preferredSports, preferredConferences,
        interestAlignment, budgetPerAthlete, etc.) set by brands in the dashboard.

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

        Args:
            brand_id: UUID of the brand intake request

        Returns:
            Brand intake data or None if not found
        """
        # Try admin endpoint for brand intake details
        url = f"{self.base_url}/api/v1/admin/intake/brands/{brand_id}"

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
        url = f"{self.base_url}/api/v1/admin/intake/brands"
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
