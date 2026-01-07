"""
Data Formatter Service

Formats athlete and brand/campaign data into structured formats
suitable for Claude API prompts.
"""

import json
from typing import Dict, Any, Optional, List


class DataFormatter:
    """Formats data for AI analysis."""
    
    @staticmethod
    def format_athlete_profile(athlete_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format athlete profile data for AI analysis.
        
        Args:
            athlete_data: Raw athlete profile data from API
            
        Returns:
            Formatted dictionary optimized for AI prompts
        """
        formatted = {
            "athlete_id": athlete_data.get("id") or athlete_data.get("athlete_id"),
            "basic_info": {
                "name": DataFormatter._get_full_name(athlete_data),
                "sport": athlete_data.get("sport"),
                "position": athlete_data.get("position"),
                "school": athlete_data.get("school") or athlete_data.get("schoolName"),
                "conference": athlete_data.get("conference"),
                "class_year": athlete_data.get("classYear") or athlete_data.get("class_year"),
                "jersey_number": athlete_data.get("jerseyNumber") or athlete_data.get("jersey_number"),
            },
            "demographics": {
                "age": DataFormatter._calculate_age(athlete_data),
                "gender": athlete_data.get("gender"),
                "hometown": athlete_data.get("hometown"),
                "state": athlete_data.get("state") or athlete_data.get("homeState"),
            },
            "athletic_background": {
                "bio": athlete_data.get("bio"),
                "gpa": athlete_data.get("gpa"),
                "major": athlete_data.get("major"),
                "stats_summary": athlete_data.get("statsSummary") or athlete_data.get("stats_summary"),
                "awards": athlete_data.get("awards"),
                "achievements": athlete_data.get("achievements"),
            },
            "social_media": DataFormatter._format_social_metrics(athlete_data),
            "nil_info": {
                "profile_completeness": athlete_data.get("completenessScore") or athlete_data.get("profile_completeness_score", 0),
                "is_verified": athlete_data.get("isVerified") or athlete_data.get("is_verified", False),
                "is_accepting_deals": athlete_data.get("isAcceptingDeals") or athlete_data.get("is_accepting_deals", True),
                "requested_rate": athlete_data.get("requestedRate") or athlete_data.get("minimum_deal_value"),
                "has_existing_deals": athlete_data.get("hasExistingDeals") or athlete_data.get("has_existing_deals", False),
            },
            "preferences": DataFormatter._format_preferences(athlete_data),
        }
        
        # Remove None values to keep JSON clean
        return DataFormatter._remove_none_values(formatted)
    
    @staticmethod
    def format_brand_campaign(
        brand_data: Dict[str, Any],
        campaign_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Format brand and campaign data for AI analysis.
        Handles both brand intake and brand profile formats.
        
        Args:
            brand_data: Brand information (intake or profile)
            campaign_data: Optional campaign-specific requirements
            
        Returns:
            Formatted dictionary optimized for AI prompts
        """
        # Handle both brand intake and brand profile formats
        company_name = brand_data.get("company") or brand_data.get("companyName")
        target_audience = brand_data.get("targetAudience") or brand_data.get("target_audience")
        goals = brand_data.get("goals") or brand_data.get("marketingGoals")
        
        formatted = {
            "brand_id": brand_data.get("id") or brand_data.get("brand_id"),
            "company": company_name,
            "industry": brand_data.get("industry"),
            "description": brand_data.get("description"),
            "target_audience": target_audience,
            "goals": goals,
            "values": brand_data.get("brandValues") or brand_data.get("brand_values", []),
        }
        
        # Add brand profile specific preferences if available
        if brand_data.get("preferredSports"):
            formatted["preferred_sports"] = DataFormatter._parse_json_field(brand_data, "preferredSports") or []
        if brand_data.get("preferredConferences"):
            formatted["preferred_conferences"] = DataFormatter._parse_json_field(brand_data, "preferredConferences") or []
        if brand_data.get("interestAlignment"):
            formatted["interest_alignment"] = DataFormatter._parse_json_field(brand_data, "interestAlignment") or []
        if brand_data.get("contentPreferences"):
            formatted["content_preferences"] = DataFormatter._parse_json_field(brand_data, "contentPreferences") or []
        if brand_data.get("budgetPerAthlete"):
            formatted["budget_per_athlete"] = brand_data.get("budgetPerAthlete")
        if brand_data.get("matchingNotes"):
            formatted["matching_notes"] = brand_data.get("matchingNotes")
        
        if campaign_data:
            formatted["campaign"] = {
                "campaign_id": campaign_data.get("campaign_id"),
                "sport_preferences": campaign_data.get("sport_preferences", []),
                "conference_preferences": campaign_data.get("conference_preferences", []),
                "min_followers": campaign_data.get("min_followers"),
                "min_engagement_rate": campaign_data.get("min_engagement_rate"),
                "content_types": campaign_data.get("content_types", []),
                "budget_per_athlete": campaign_data.get("budget_per_athlete"),
                "timeline": campaign_data.get("timeline"),
            }
        
        return DataFormatter._remove_none_values(formatted)
    
    @staticmethod
    def _get_full_name(athlete_data: Dict[str, Any]) -> str:
        """Extract full name from athlete data."""
        if athlete_data.get("fullName"):
            return athlete_data["fullName"]
        
        first = athlete_data.get("firstName") or athlete_data.get("first_name", "")
        last = athlete_data.get("lastName") or athlete_data.get("last_name", "")
        
        if first and last:
            return f"{first} {last}"
        elif first:
            return first
        elif last:
            return last
        else:
            return athlete_data.get("displayName") or "Unknown"
    
    @staticmethod
    def _calculate_age(athlete_data: Dict[str, Any]) -> Optional[int]:
        """Calculate age from date of birth if available."""
        from datetime import datetime, date
        
        dob = athlete_data.get("dateOfBirth") or athlete_data.get("date_of_birth")
        if not dob:
            return None
        
        try:
            if isinstance(dob, str):
                # Try parsing different date formats
                for fmt in ["%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y"]:
                    try:
                        dob_date = datetime.strptime(dob, fmt).date()
                        break
                    except ValueError:
                        continue
                else:
                    return None
            else:
                dob_date = dob
            
            today = date.today()
            age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
            return age
        except Exception:
            return None
    
    @staticmethod
    def _format_social_metrics(athlete_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format social media metrics."""
        social_accounts = athlete_data.get("socialAccounts") or athlete_data.get("social_accounts", [])
        
        if not social_accounts:
            return {
                "total_followers": 0,
                "total_engagement_rate": 0.0,
                "platforms": []
            }
        
        total_followers = 0
        engagement_rates = []
        platforms = []
        
        for account in social_accounts:
            followers = account.get("followers") or 0
            engagement_rate = account.get("engagementRate") or account.get("engagement_rate")
            platform = account.get("platform")
            
            total_followers += followers
            if engagement_rate:
                engagement_rates.append(engagement_rate)
            if platform:
                platforms.append({
                    "platform": platform,
                    "handle": account.get("handle"),
                    "followers": followers,
                    "engagement_rate": engagement_rate,
                    "is_verified": account.get("isVerified") or account.get("is_verified", False)
                })
        
        avg_engagement = sum(engagement_rates) / len(engagement_rates) if engagement_rates else 0.0
        
        return {
            "total_followers": total_followers,
            "total_engagement_rate": round(avg_engagement, 2),
            "platforms": platforms,
            "platform_count": len(platforms)
        }
    
    @staticmethod
    def _format_preferences(athlete_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format athlete preferences."""
        preferences = athlete_data.get("preferences") or {}
        
        # Handle both nested preferences object and direct fields
        if isinstance(preferences, dict):
            return {
                "liked_categories": preferences.get("likedCategories") or preferences.get("liked_categories", []),
                "disliked_categories": preferences.get("dislikedCategories") or preferences.get("disliked_categories", []),
                "preferred_brands": preferences.get("preferredBrands") or preferences.get("preferred_brands", []),
                "excluded_brands": preferences.get("excludedBrands") or preferences.get("excluded_brands", []),
                "content_types": preferences.get("contentTypes") or preferences.get("content_types", []),
            }
        else:
            # Try to parse from string fields if stored as JSON
            return {
                "liked_categories": DataFormatter._parse_json_field(athlete_data, "likedCategories") or [],
                "disliked_categories": DataFormatter._parse_json_field(athlete_data, "dislikedCategories") or [],
                "preferred_brands": DataFormatter._parse_json_field(athlete_data, "preferredBrands") or [],
                "excluded_brands": DataFormatter._parse_json_field(athlete_data, "excludedBrands") or [],
                "content_types": DataFormatter._parse_json_field(athlete_data, "contentTypes") or [],
            }
    
    @staticmethod
    def _parse_json_field(data: Dict[str, Any], field_name: str) -> Optional[List]:
        """Parse JSON string field into list."""
        value = data.get(field_name)
        if not value:
            return None
        
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return None
        return None
    
    @staticmethod
    def _remove_none_values(data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively remove None values from dictionary."""
        if isinstance(data, dict):
            return {
                k: DataFormatter._remove_none_values(v)
                for k, v in data.items()
                if v is not None
            }
        elif isinstance(data, list):
            return [DataFormatter._remove_none_values(item) for item in data if item is not None]
        else:
            return data

