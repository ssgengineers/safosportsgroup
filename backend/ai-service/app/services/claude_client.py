"""
Claude API Client Service

Handles all interactions with Anthropic's Claude API for:
- Brand-athlete matching analysis
- Athlete scoring
- Brand fit analysis
- Batch matching for efficiency
"""

import json
import logging
import asyncio
import re
from typing import Dict, Any, Optional, List
from anthropic import Anthropic, APIError
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ClaudeClient:
    """Client for interacting with Claude API."""

    # System prompt for consistent JSON responses
    SYSTEM_PROMPT = """You are an expert NIL (Name, Image, Likeness) analyst for college sports.
You help match brands with college athletes based on their profiles, social media presence,
sport, conference, engagement metrics, and brand alignment.

IMPORTANT: Always respond with valid JSON only. Do not include any markdown formatting,
code blocks, or explanatory text outside the JSON object."""

    def __init__(self):
        """Initialize Claude client with API key from settings."""
        if not settings.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")

        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.claude_model
        self.max_tokens = settings.claude_max_tokens

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """
        Extract JSON from Claude's response, handling various formats.

        Args:
            text: Raw response text from Claude

        Returns:
            Parsed JSON dictionary

        Raises:
            json.JSONDecodeError: If JSON cannot be extracted
        """
        # Clean up the text
        text = text.strip()

        # Try direct JSON parse first
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Try to extract from markdown code block
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
        if json_match:
            try:
                return json.loads(json_match.group(1).strip())
            except json.JSONDecodeError:
                pass

        # Try to find JSON object pattern (handles nested objects)
        brace_count = 0
        start_idx = None
        for i, char in enumerate(text):
            if char == '{':
                if brace_count == 0:
                    start_idx = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start_idx is not None:
                    try:
                        return json.loads(text[start_idx:i + 1])
                    except json.JSONDecodeError:
                        pass

        raise json.JSONDecodeError("Could not extract JSON from response", text, 0)

    async def _call_claude(self, prompt: str) -> str:
        """
        Make an API call to Claude.

        Args:
            prompt: The user prompt

        Returns:
            Response text from Claude
        """
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=self.SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
        )
        return response.content[0].text

    async def analyze_match(
        self,
        athlete_data: Dict[str, Any],
        brand_data: Dict[str, Any],
        campaign_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze brand-athlete match using Claude.

        Args:
            athlete_data: Complete athlete profile data
            brand_data: Brand/campaign information
            campaign_data: Optional specific campaign requirements

        Returns:
            Dictionary with match_score, match_reasons, concerns, etc.
        """
        prompt = self._build_match_prompt(athlete_data, brand_data, campaign_data)

        try:
            content = await self._call_claude(prompt)
            result = self._extract_json(content)
            return self._normalize_match_response(result)

        except APIError as e:
            logger.error(f"Claude API error: {e}")
            raise Exception(f"Failed to analyze match: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response: {e}")
            raise Exception("Invalid response format from Claude API")
        except Exception as e:
            logger.error(f"Unexpected error in analyze_match: {e}")
            raise

    async def analyze_batch_matches(
        self,
        athletes: List[Dict[str, Any]],
        brand_data: Dict[str, Any],
        campaign_data: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Analyze multiple athletes against a brand in a single API call.

        This is more efficient than making individual calls for each athlete.

        Args:
            athletes: List of athlete profile data
            brand_data: Brand/campaign information
            campaign_data: Optional specific campaign requirements

        Returns:
            List of match results for each athlete
        """
        prompt = self._build_batch_match_prompt(athletes, brand_data, campaign_data)

        try:
            content = await self._call_claude(prompt)
            result = self._extract_json(content)

            # Normalize each match in the results
            matches = result.get("matches", [])
            return [self._normalize_match_response(m) for m in matches]

        except APIError as e:
            logger.error(f"Claude API error in batch match: {e}")
            raise Exception(f"Failed to analyze batch matches: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude batch response: {e}")
            raise Exception("Invalid response format from Claude API")
        except Exception as e:
            logger.error(f"Unexpected error in analyze_batch_matches: {e}")
            raise

    async def score_athlete(
        self,
        athlete_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Score athlete profile using Claude.

        Args:
            athlete_data: Complete athlete profile data

        Returns:
            Dictionary with component scores and overall score
        """
        prompt = self._build_scoring_prompt(athlete_data)

        try:
            content = await self._call_claude(prompt)
            result = self._extract_json(content)
            return self._normalize_scoring_response(result)

        except APIError as e:
            logger.error(f"Claude API error: {e}")
            raise Exception(f"Failed to score athlete: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response: {e}")
            raise Exception("Invalid response format from Claude API")
        except Exception as e:
            logger.error(f"Unexpected error in score_athlete: {e}")
            raise

    async def score_brand_fit(
        self,
        athlete_data: Dict[str, Any],
        brand_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze brand-athlete fit using Claude.

        Args:
            athlete_data: Complete athlete profile data
            brand_data: Brand information and values

        Returns:
            Dictionary with fit_score, match_reasons, concerns
        """
        prompt = self._build_brand_fit_prompt(athlete_data, brand_data)

        try:
            content = await self._call_claude(prompt)
            result = self._extract_json(content)
            return self._normalize_brand_fit_response(result)

        except APIError as e:
            logger.error(f"Claude API error: {e}")
            raise Exception(f"Failed to score brand fit: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response: {e}")
            raise Exception("Invalid response format from Claude API")
        except Exception as e:
            logger.error(f"Unexpected error in score_brand_fit: {e}")
            raise

    def _build_match_prompt(
        self,
        athlete_data: Dict[str, Any],
        brand_data: Dict[str, Any],
        campaign_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Build prompt for brand-athlete matching."""
        prompt = """Analyze the compatibility between this athlete and brand/campaign.

Your task:
1. Evaluate athlete alignment with brand's target audience, values, and campaign goals
2. Assess social media reach and engagement quality
3. Consider sport, demographics, content style, and brand safety
4. Provide a match score (0-100) with detailed reasoning
5. Suggest appropriate compensation based on reach and engagement

Return JSON with this exact structure:
{
  "match_score": 87.5,
  "match_reasons": ["reason1", "reason2", "reason3"],
  "concerns": ["concern1", "concern2"],
  "estimated_reach": 45000,
  "suggested_rate": 500.0,
  "component_scores": {
    "demographic_fit": 90,
    "engagement_quality": 85,
    "brand_alignment": 88,
    "reach_value": 82
  }
}

ATHLETE PROFILE:
"""
        prompt += json.dumps(athlete_data, indent=2, default=str)
        prompt += "\n\nBRAND/CAMPAIGN INFORMATION:\n"
        prompt += json.dumps(brand_data, indent=2, default=str)

        if campaign_data:
            prompt += "\n\nCAMPAIGN REQUIREMENTS:\n"
            prompt += json.dumps(campaign_data, indent=2, default=str)

        return prompt

    def _build_batch_match_prompt(
        self,
        athletes: List[Dict[str, Any]],
        brand_data: Dict[str, Any],
        campaign_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Build prompt for batch brand-athlete matching."""
        prompt = """Analyze compatibility between these athletes and the brand/campaign.

For EACH athlete, evaluate:
1. Alignment with brand's target audience, values, and campaign goals
2. Social media reach and engagement quality
3. Sport, demographics, content style, and brand safety
4. Provide a match score (0-100) with reasoning
5. Suggest appropriate compensation

Return JSON with this exact structure:
{
  "matches": [
    {
      "athlete_id": "id1",
      "match_score": 87.5,
      "match_reasons": ["reason1", "reason2"],
      "concerns": ["concern1"],
      "estimated_reach": 45000,
      "suggested_rate": 500.0,
      "component_scores": {
        "demographic_fit": 90,
        "engagement_quality": 85,
        "brand_alignment": 88,
        "reach_value": 82
      }
    }
  ]
}

ATHLETES:
"""
        for i, athlete in enumerate(athletes):
            prompt += f"\n--- Athlete {i + 1} ---\n"
            prompt += json.dumps(athlete, indent=2, default=str)

        prompt += "\n\nBRAND/CAMPAIGN INFORMATION:\n"
        prompt += json.dumps(brand_data, indent=2, default=str)

        if campaign_data:
            prompt += "\n\nCAMPAIGN REQUIREMENTS:\n"
            prompt += json.dumps(campaign_data, indent=2, default=str)

        return prompt

    def _build_scoring_prompt(self, athlete_data: Dict[str, Any]) -> str:
        """Build prompt for athlete scoring."""
        prompt = """Analyze this athlete's NIL potential and provide a comprehensive score.

Score across these components (with maximum points):
- Profile Quality (0-25): Completeness, bio quality, professionalism
- Social Influence (0-30): Total reach, engagement rate, audience quality, growth potential
- Market Value (0-25): Sport popularity, conference tier, performance level, school prestige
- NIL Readiness (0-20): Brand safety, content quality, responsiveness, deal experience

Assign a tier based on overall score:
- ELITE: 80-100 (Top-tier athletes with strong brand potential)
- PREMIUM: 65-79 (Strong candidates for brand partnerships)
- STANDARD: 50-64 (Solid athletes building their brand)
- DEVELOPING: 0-49 (Emerging athletes with growth potential)

Return JSON with this exact structure:
{
  "overall_score": 78.5,
  "component_scores": {
    "profile_quality": 20.0,
    "social_influence": 25.0,
    "market_value": 20.0,
    "nil_readiness": 13.5
  },
  "tier": "PREMIUM",
  "recommendations": ["recommendation1", "recommendation2"]
}

ATHLETE PROFILE:
"""
        prompt += json.dumps(athlete_data, indent=2, default=str)
        return prompt

    def _build_brand_fit_prompt(
        self,
        athlete_data: Dict[str, Any],
        brand_data: Dict[str, Any]
    ) -> str:
        """Build prompt for brand fit analysis."""
        prompt = """Evaluate how well this athlete fits with the brand's category, values, and target audience.

Consider:
- Brand category alignment (e.g., athletic apparel, nutrition, gaming)
- Value and message alignment
- Audience demographics overlap
- Content style compatibility
- Brand safety and risk factors

Return JSON with this exact structure:
{
  "fit_score": 85.0,
  "match_reasons": ["reason1", "reason2", "reason3"],
  "concerns": ["concern1", "concern2"]
}

ATHLETE PROFILE:
"""
        prompt += json.dumps(athlete_data, indent=2, default=str)
        prompt += "\n\nBRAND INFORMATION:\n"
        prompt += json.dumps(brand_data, indent=2, default=str)
        return prompt

    def _normalize_match_response(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize and validate match response from Claude."""
        normalized = {
            "athlete_id": result.get("athlete_id"),
            "match_score": float(result.get("match_score", 0.0)),
            "match_reasons": result.get("match_reasons", []),
            "concerns": result.get("concerns", []),
            "estimated_reach": int(result.get("estimated_reach", 0)),
            "suggested_rate": float(result.get("suggested_rate", 0.0)),
            "component_scores": result.get("component_scores", {})
        }

        # Ensure match_score is in valid range
        normalized["match_score"] = max(0.0, min(100.0, normalized["match_score"]))

        return normalized

    def _normalize_scoring_response(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize and validate scoring response from Claude."""
        component_scores = result.get("component_scores", {})

        normalized = {
            "overall_score": float(result.get("overall_score", 0.0)),
            "component_scores": {
                "profile_quality": float(component_scores.get("profile_quality", 0.0)),
                "social_influence": float(component_scores.get("social_influence", 0.0)),
                "market_value": float(component_scores.get("market_value", 0.0)),
                "nil_readiness": float(component_scores.get("nil_readiness", 0.0))
            },
            "tier": result.get("tier", "DEVELOPING"),
            "recommendations": result.get("recommendations", [])
        }

        # Ensure overall_score is in valid range
        normalized["overall_score"] = max(0.0, min(100.0, normalized["overall_score"]))

        return normalized

    def _normalize_brand_fit_response(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize and validate brand fit response from Claude."""
        normalized = {
            "fit_score": float(result.get("fit_score", 0.0)),
            "match_reasons": result.get("match_reasons", []),
            "concerns": result.get("concerns", [])
        }

        # Ensure fit_score is in valid range
        normalized["fit_score"] = max(0.0, min(100.0, normalized["fit_score"]))

        return normalized
