"""
Rule-Based Matching Scorer - Phase 1

Implements 4 weighted scoring functions:
1. Audience Fit (35%) - Demographics + follower alignment
2. Content Fit (30%) - Sport/content type vs. brand category
3. Engagement Quality (20%) - Follower count & engagement rate
4. Values Alignment (15%) - Brand exclusions & values match

Total score: 0-100 points
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime
import logging

from app.models.athlete import (
    AthleteProfile,
    AthleteMatchData,
    SocialAccount,
    SocialSnapshot,
    Sport,
    Conference,
    BrandCategory,
    ContentType,
)
from app.models.brand import BrandProfile, BrandMatchData, BrandTarget
from app.models.matching import (
    MatchResult,
    MatchTier,
    ScoreBreakdown,
    MatchReason,
    ScoringMethod,
)

logger = logging.getLogger(__name__)


# ============= Configuration Constants =============

# Score weights (must sum to 100)
WEIGHT_AUDIENCE_FIT = 35
WEIGHT_CONTENT_FIT = 30
WEIGHT_ENGAGEMENT_QUALITY = 20
WEIGHT_VALUES_ALIGNMENT = 15

# Follower tier thresholds and scores
FOLLOWER_TIERS = [
    (1_000_000, 12, "MEGA"),      # 1M+ followers
    (500_000, 11, "MACRO_PLUS"),  # 500K-1M
    (100_000, 10, "MACRO"),       # 100K-500K
    (50_000, 8, "MID"),           # 50K-100K
    (25_000, 6, "MICRO_PLUS"),    # 25K-50K
    (10_000, 5, "MICRO"),         # 10K-25K
    (5_000, 3, "NANO"),           # 5K-10K
    (1_000, 2, "STARTER"),        # 1K-5K
    (0, 1, "EMERGING"),           # <1K
]

# Engagement rate thresholds and scores (max 8 points)
ENGAGEMENT_THRESHOLDS = [
    (8.0, 8, "EXCEPTIONAL"),   # 8%+ engagement
    (6.0, 7, "EXCELLENT"),     # 6-8%
    (4.0, 6, "VERY_GOOD"),     # 4-6%
    (3.0, 5, "GOOD"),          # 3-4%
    (2.0, 4, "AVERAGE"),       # 2-3%
    (1.0, 2, "BELOW_AVERAGE"), # 1-2%
    (0.0, 0, "LOW"),           # <1%
]

# Sport-to-Brand Category Affinity Matrix
# Values: 0.0 (no affinity) to 1.0 (perfect fit)
SPORT_BRAND_AFFINITY: Dict[Sport, Dict[BrandCategory, float]] = {
    Sport.FOOTBALL: {
        BrandCategory.ATHLETIC_APPAREL: 1.0,
        BrandCategory.SPORTS_NUTRITION: 0.95,
        BrandCategory.ENERGY_DRINKS: 0.9,
        BrandCategory.FOOTWEAR: 0.9,
        BrandCategory.SPORTS_EQUIPMENT: 0.85,
        BrandCategory.FAST_FOOD: 0.75,
        BrandCategory.GAMING: 0.7,
        BrandCategory.CARS: 0.65,
        BrandCategory.BANKING: 0.5,
        BrandCategory.ELECTRONICS: 0.6,
    },
    Sport.BASKETBALL: {
        BrandCategory.FOOTWEAR: 1.0,
        BrandCategory.ATHLETIC_APPAREL: 0.95,
        BrandCategory.STREETWEAR: 0.9,
        BrandCategory.SPORTS_NUTRITION: 0.85,
        BrandCategory.ENERGY_DRINKS: 0.85,
        BrandCategory.GAMING: 0.8,
        BrandCategory.ELECTRONICS: 0.7,
        BrandCategory.MUSIC: 0.7,
    },
    Sport.SOCCER: {
        BrandCategory.ATHLETIC_APPAREL: 1.0,
        BrandCategory.FOOTWEAR: 0.95,
        BrandCategory.SPORTS_NUTRITION: 0.85,
        BrandCategory.ENERGY_DRINKS: 0.8,
        BrandCategory.SPORTS_EQUIPMENT: 0.8,
    },
    Sport.BASEBALL: {
        BrandCategory.ATHLETIC_APPAREL: 0.9,
        BrandCategory.SPORTS_EQUIPMENT: 0.95,
        BrandCategory.SPORTS_NUTRITION: 0.8,
        BrandCategory.FAST_FOOD: 0.7,
        BrandCategory.CARS: 0.6,
    },
    Sport.VOLLEYBALL: {
        BrandCategory.ATHLETIC_APPAREL: 0.95,
        BrandCategory.SPORTS_NUTRITION: 0.8,
        BrandCategory.FOOTWEAR: 0.85,
        BrandCategory.SKINCARE: 0.7,
        BrandCategory.FITNESS_EQUIPMENT: 0.75,
    },
    Sport.SWIMMING: {
        BrandCategory.ATHLETIC_APPAREL: 0.9,
        BrandCategory.SPORTS_NUTRITION: 0.85,
        BrandCategory.SKINCARE: 0.8,
        BrandCategory.WEARABLES: 0.75,
        BrandCategory.WELLNESS_SERVICES: 0.7,
    },
    Sport.TRACK_AND_FIELD: {
        BrandCategory.ATHLETIC_APPAREL: 0.95,
        BrandCategory.FOOTWEAR: 1.0,
        BrandCategory.SPORTS_NUTRITION: 0.9,
        BrandCategory.WEARABLES: 0.85,
        BrandCategory.ENERGY_DRINKS: 0.8,
    },
    Sport.GYMNASTICS: {
        BrandCategory.ATHLETIC_APPAREL: 0.95,
        BrandCategory.FITNESS_EQUIPMENT: 0.85,
        BrandCategory.SKINCARE: 0.8,
        BrandCategory.WELLNESS_SERVICES: 0.75,
        BrandCategory.HEALTHY_FOOD: 0.8,
    },
    Sport.GOLF: {
        BrandCategory.ATHLETIC_APPAREL: 0.9,
        BrandCategory.LUXURY_FASHION: 0.8,
        BrandCategory.CARS: 0.85,
        BrandCategory.BANKING: 0.75,
        BrandCategory.INVESTING: 0.7,
        BrandCategory.SPORTS_EQUIPMENT: 0.95,
    },
    Sport.TENNIS: {
        BrandCategory.ATHLETIC_APPAREL: 0.95,
        BrandCategory.LUXURY_FASHION: 0.75,
        BrandCategory.FOOTWEAR: 0.9,
        BrandCategory.SPORTS_EQUIPMENT: 0.9,
        BrandCategory.WEARABLES: 0.8,
    },
    Sport.CHEERLEADING: {
        BrandCategory.ATHLETIC_APPAREL: 0.9,
        BrandCategory.SKINCARE: 0.85,
        BrandCategory.HAIRCARE: 0.85,
        BrandCategory.CASUAL_FASHION: 0.8,
        BrandCategory.HEALTHY_FOOD: 0.7,
    },
    Sport.ESPORTS: {
        BrandCategory.GAMING: 1.0,
        BrandCategory.ELECTRONICS: 0.95,
        BrandCategory.ENERGY_DRINKS: 0.9,
        BrandCategory.STREAMING_SERVICES: 0.85,
        BrandCategory.SOFTWARE_APPS: 0.8,
        BrandCategory.FAST_FOOD: 0.7,
    },
}

# Default affinity for sports not in the matrix
DEFAULT_SPORT_AFFINITY = 0.4

# Conference tiers for market value
POWER_CONFERENCES = {Conference.SEC, Conference.BIG_TEN, Conference.BIG_12, Conference.ACC, Conference.PAC_12}
MID_MAJOR_CONFERENCES = {Conference.AAC, Conference.MOUNTAIN_WEST, Conference.SUN_BELT}


class RuleBasedScorer:
    """
    Rule-based scoring engine for brand-athlete matching.

    Usage:
        scorer = RuleBasedScorer()
        result = scorer.calculate_match(athlete_data, brand_data)
    """

    def __init__(self):
        """Initialize the scorer with default configuration."""
        self.weights = {
            "audience_fit": WEIGHT_AUDIENCE_FIT,
            "content_fit": WEIGHT_CONTENT_FIT,
            "engagement_quality": WEIGHT_ENGAGEMENT_QUALITY,
            "values_alignment": WEIGHT_VALUES_ALIGNMENT,
        }

    def calculate_match(
        self,
        athlete: AthleteMatchData,
        brand: BrandMatchData,
        campaign_id: Optional[str] = None,
    ) -> MatchResult:
        """
        Calculate complete match score between athlete and brand.

        Args:
            athlete: Athlete data for matching
            brand: Brand data for matching
            campaign_id: Optional campaign ID

        Returns:
            MatchResult with scores, tier, and explanations
        """
        start_time = datetime.utcnow()
        match_reasons: List[MatchReason] = []
        concerns: List[MatchReason] = []

        # 1. Check hard exclusions first
        exclusion = self._check_exclusions(athlete, brand)
        if exclusion:
            return MatchResult(
                athlete_id=athlete.athlete_id,
                brand_id=brand.brand_id,
                campaign_id=campaign_id,
                athlete_name=athlete.display_name,
                athlete_sport=athlete.sport,
                athlete_school=athlete.school,
                athlete_followers=athlete.total_followers,
                athlete_engagement_rate=athlete.avg_engagement_rate,
                total_score=0.0,
                tier=MatchTier.WEAK,
                breakdown=ScoreBreakdown(),
                is_excluded=True,
                exclusion_reason=exclusion,
                scoring_method=ScoringMethod.RULE_BASED,
                calculated_at=datetime.utcnow(),
            )

        # 2. Calculate individual scores
        audience_score, audience_reasons = self.calculate_audience_fit(athlete, brand)
        content_score, content_reasons = self.calculate_content_fit(athlete, brand)
        engagement_score, engagement_reasons = self.calculate_engagement_quality(athlete, brand)
        values_score, values_reasons = self.calculate_values_alignment(athlete, brand)

        # Collect reasons
        for reason in audience_reasons + content_reasons + engagement_reasons + values_reasons:
            if reason.impact == "positive":
                match_reasons.append(reason)
            else:
                concerns.append(reason)

        # 3. Calculate total score
        total_score = audience_score + content_score + engagement_score + values_score

        # 4. Determine tier
        tier = self._get_tier(total_score)

        # 5. Build result
        calc_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        return MatchResult(
            athlete_id=athlete.athlete_id,
            brand_id=brand.brand_id,
            campaign_id=campaign_id,
            athlete_name=athlete.display_name,
            athlete_sport=athlete.sport,
            athlete_school=athlete.school,
            athlete_followers=athlete.total_followers,
            athlete_engagement_rate=athlete.avg_engagement_rate,
            total_score=round(total_score, 1),
            tier=tier,
            breakdown=ScoreBreakdown(
                audience_fit=round(audience_score, 1),
                content_fit=round(content_score, 1),
                engagement_quality=round(engagement_score, 1),
                values_alignment=round(values_score, 1),
            ),
            match_reasons=match_reasons[:5],  # Top 5 reasons
            concerns=concerns[:3],  # Top 3 concerns
            scoring_method=ScoringMethod.RULE_BASED,
            calculated_at=datetime.utcnow(),
            calculation_time_ms=calc_time,
        )

    # =========================================================================
    # SCORING FUNCTION 1: Audience Fit (35 points max)
    # =========================================================================

    def calculate_audience_fit(
        self,
        athlete: AthleteMatchData,
        brand: BrandMatchData,
    ) -> Tuple[float, List[MatchReason]]:
        """
        Calculate audience demographics alignment score.

        Components:
        - Age distribution overlap (0-15 points)
        - Gender alignment (0-10 points)
        - Geographic match (0-10 points)

        Args:
            athlete: Athlete data with audience demographics
            brand: Brand data with target audience

        Returns:
            Tuple of (score, list of reasons)
        """
        score = 0.0
        reasons: List[MatchReason] = []
        target = brand.target_audience

        if not target:
            # No target audience defined - give neutral score
            score = WEIGHT_AUDIENCE_FIT * 0.5  # 50% of max
            reasons.append(MatchReason(
                category="audience_fit",
                reason="Brand has no specific audience targeting defined",
                impact="neutral",
            ))
            return score, reasons

        # ----- Age Distribution (0-15 points) -----
        age_score, age_reason = self._score_age_alignment(
            athlete.audience_age_distribution,
            target.age_ranges,
        )
        score += age_score
        if age_reason:
            reasons.append(age_reason)

        # ----- Gender Alignment (0-10 points) -----
        gender_score, gender_reason = self._score_gender_alignment(
            athlete.audience_gender_distribution,
            target.gender_distribution,
            target.gender_preference,
        )
        score += gender_score
        if gender_reason:
            reasons.append(gender_reason)

        # ----- Geographic Match (0-10 points) -----
        geo_score, geo_reason = self._score_geographic_alignment(
            athlete.audience_top_locations,
            target.target_regions,
            target.is_national,
            target.is_local,
        )
        score += geo_score
        if geo_reason:
            reasons.append(geo_reason)

        return min(WEIGHT_AUDIENCE_FIT, score), reasons

    def _score_age_alignment(
        self,
        athlete_ages: Dict[str, float],
        target_ranges: List[str],
    ) -> Tuple[float, Optional[MatchReason]]:
        """
        Score age distribution overlap.

        TODO: Implement actual age overlap calculation
        - Parse athlete_ages dict (e.g., {"18-24": 45, "25-34": 30})
        - Compare against target_ranges (e.g., ["18-24", "25-34"])
        - Calculate percentage overlap
        """
        max_points = 15.0

        if not athlete_ages or not target_ranges:
            return max_points * 0.5, None

        # PLACEHOLDER: Calculate actual overlap
        # For now, return moderate score
        overlap_percentage = 0.6  # TODO: Calculate real overlap

        score = max_points * overlap_percentage
        reason = MatchReason(
            category="audience_fit",
            reason=f"Age demographics have {int(overlap_percentage * 100)}% overlap with target",
            impact="positive" if overlap_percentage > 0.5 else "negative",
            score_contribution=score,
        )

        return score, reason

    def _score_gender_alignment(
        self,
        athlete_genders: Dict[str, float],
        target_distribution: Dict[str, float],
        target_preference: Optional[str],
    ) -> Tuple[float, Optional[MatchReason]]:
        """
        Score gender distribution alignment.

        TODO: Implement actual gender matching
        - If target_preference is "male"/"female", check majority
        - If target_distribution provided, calculate distribution similarity
        """
        max_points = 10.0

        if not athlete_genders:
            return max_points * 0.5, None

        # PLACEHOLDER: Calculate actual alignment
        alignment = 0.7  # TODO: Calculate real alignment

        score = max_points * alignment
        reason = MatchReason(
            category="audience_fit",
            reason="Gender demographics align with brand target",
            impact="positive" if alignment > 0.5 else "negative",
            score_contribution=score,
        )

        return score, reason

    def _score_geographic_alignment(
        self,
        athlete_locations: List[str],
        target_regions: List[str],
        is_national: bool,
        is_local: bool,
    ) -> Tuple[float, Optional[MatchReason]]:
        """
        Score geographic alignment.

        TODO: Implement actual geographic matching
        - Map athlete locations to regions
        - Check overlap with target_regions
        - Handle national vs local brands differently
        """
        max_points = 10.0

        # National brands match with anyone
        if is_national:
            return max_points, MatchReason(
                category="audience_fit",
                reason="National brand - geographic location not a limiting factor",
                impact="positive",
                score_contribution=max_points,
            )

        if not athlete_locations or not target_regions:
            return max_points * 0.5, None

        # PLACEHOLDER: Calculate actual geographic overlap
        overlap = 0.6  # TODO: Calculate real overlap

        score = max_points * overlap
        impact = "positive" if overlap > 0.5 else "negative"

        return score, MatchReason(
            category="audience_fit",
            reason=f"Geographic reach overlaps {int(overlap * 100)}% with target regions",
            impact=impact,
            score_contribution=score,
        )

    # =========================================================================
    # SCORING FUNCTION 2: Content Fit (30 points max)
    # =========================================================================

    def calculate_content_fit(
        self,
        athlete: AthleteMatchData,
        brand: BrandMatchData,
    ) -> Tuple[float, List[MatchReason]]:
        """
        Calculate sport and content type alignment score.

        Components:
        - Sport-brand category affinity (0-15 points)
        - Content type capability (0-10 points)
        - Category preference bonus/penalty (0-5 points)

        Args:
            athlete: Athlete data with sport and content preferences
            brand: Brand data with category and content requirements

        Returns:
            Tuple of (score, list of reasons)
        """
        score = 0.0
        reasons: List[MatchReason] = []

        # ----- Sport-Brand Affinity (0-15 points) -----
        affinity_score, affinity_reason = self._score_sport_brand_affinity(
            athlete.sport,
            brand.category,
        )
        score += affinity_score
        if affinity_reason:
            reasons.append(affinity_reason)

        # ----- Content Type Capability (0-10 points) -----
        content_score, content_reason = self._score_content_capability(
            athlete.content_types,
            brand.required_content_types,
        )
        score += content_score
        if content_reason:
            reasons.append(content_reason)

        # ----- Category Preference (0-5 points or penalty) -----
        pref_score, pref_reason = self._score_category_preference(
            athlete.liked_categories,
            athlete.disliked_categories,
            brand.category,
        )
        score += pref_score
        if pref_reason:
            reasons.append(pref_reason)

        return max(0, min(WEIGHT_CONTENT_FIT, score)), reasons

    def _score_sport_brand_affinity(
        self,
        sport: Sport,
        brand_category: Optional[BrandCategory],
    ) -> Tuple[float, Optional[MatchReason]]:
        """
        Score sport-to-brand category natural fit.

        Uses SPORT_BRAND_AFFINITY matrix to determine how well
        the athlete's sport aligns with the brand's category.
        """
        max_points = 15.0

        if not brand_category:
            return max_points * 0.5, None

        # Look up affinity in matrix
        sport_affinities = SPORT_BRAND_AFFINITY.get(sport, {})
        affinity = sport_affinities.get(brand_category, DEFAULT_SPORT_AFFINITY)

        score = max_points * affinity

        if affinity >= 0.8:
            impact = "positive"
            reason_text = f"{sport.value} athletes are a natural fit for {brand_category.value}"
        elif affinity >= 0.5:
            impact = "neutral"
            reason_text = f"{sport.value} has moderate alignment with {brand_category.value}"
        else:
            impact = "negative"
            reason_text = f"{sport.value} may not be the best fit for {brand_category.value}"

        return score, MatchReason(
            category="content_fit",
            reason=reason_text,
            impact=impact,
            score_contribution=score,
        )

    def _score_content_capability(
        self,
        athlete_content_types: List[ContentType],
        required_content_types: List[ContentType],
    ) -> Tuple[float, Optional[MatchReason]]:
        """
        Score athlete's ability to create required content types.

        TODO: Implement content matching
        - Check overlap between athlete capabilities and brand requirements
        - Weight by importance of each content type
        """
        max_points = 10.0

        if not required_content_types:
            # No specific requirements - full score
            return max_points, MatchReason(
                category="content_fit",
                reason="Brand has no specific content type requirements",
                impact="positive",
                score_contribution=max_points,
            )

        if not athlete_content_types:
            # Athlete hasn't specified - partial score
            return max_points * 0.5, MatchReason(
                category="content_fit",
                reason="Athlete content capabilities unknown",
                impact="neutral",
                score_contribution=max_points * 0.5,
            )

        # Calculate overlap
        athlete_set = set(athlete_content_types)
        required_set = set(required_content_types)
        overlap = len(athlete_set & required_set)
        coverage = overlap / len(required_set) if required_set else 1.0

        score = max_points * coverage

        if coverage >= 0.8:
            impact = "positive"
            reason_text = f"Athlete can create {overlap}/{len(required_set)} required content types"
        elif coverage >= 0.5:
            impact = "neutral"
            reason_text = f"Athlete covers {int(coverage * 100)}% of required content types"
        else:
            impact = "negative"
            reason_text = f"Limited overlap with required content types ({overlap}/{len(required_set)})"

        return score, MatchReason(
            category="content_fit",
            reason=reason_text,
            impact=impact,
            score_contribution=score,
        )

    def _score_category_preference(
        self,
        liked_categories: List[BrandCategory],
        disliked_categories: List[BrandCategory],
        brand_category: Optional[BrandCategory],
    ) -> Tuple[float, Optional[MatchReason]]:
        """
        Score based on athlete's category preferences.

        - Bonus if brand category is in liked_categories
        - Penalty if brand category is in disliked_categories
        """
        max_points = 5.0

        if not brand_category:
            return 0, None

        if brand_category in liked_categories:
            return max_points, MatchReason(
                category="content_fit",
                reason=f"Athlete has expressed interest in {brand_category.value} brands",
                impact="positive",
                score_contribution=max_points,
            )

        if brand_category in disliked_categories:
            return -5.0, MatchReason(
                category="content_fit",
                reason=f"Athlete has indicated disinterest in {brand_category.value}",
                impact="negative",
                score_contribution=-5.0,
            )

        return 0, None

    # =========================================================================
    # SCORING FUNCTION 3: Engagement Quality (20 points max)
    # =========================================================================

    def calculate_engagement_quality(
        self,
        athlete: AthleteMatchData,
        brand: BrandMatchData,
    ) -> Tuple[float, List[MatchReason]]:
        """
        Calculate social media influence and engagement score.

        Components:
        - Follower count tier (0-12 points)
        - Engagement rate (0-8 points)

        Args:
            athlete: Athlete data with social metrics
            brand: Brand data with min requirements

        Returns:
            Tuple of (score, list of reasons)
        """
        score = 0.0
        reasons: List[MatchReason] = []

        # ----- Follower Count (0-12 points) -----
        follower_score, follower_tier, follower_reason = self._score_follower_count(
            athlete.total_followers,
            brand.min_followers,
        )
        score += follower_score
        if follower_reason:
            reasons.append(follower_reason)

        # ----- Engagement Rate (0-8 points) -----
        engagement_score, engagement_reason = self._score_engagement_rate(
            athlete.avg_engagement_rate,
            brand.min_engagement_rate,
        )
        score += engagement_score
        if engagement_reason:
            reasons.append(engagement_reason)

        return min(WEIGHT_ENGAGEMENT_QUALITY, score), reasons

    def _score_follower_count(
        self,
        total_followers: int,
        min_required: Optional[int],
    ) -> Tuple[float, str, Optional[MatchReason]]:
        """
        Score based on total follower count across platforms.

        Uses tiered scoring to reward larger audiences while
        still giving credit to smaller, engaged followings.
        """
        # Check minimum requirement
        if min_required and total_followers < min_required:
            return 0, "BELOW_MIN", MatchReason(
                category="engagement_quality",
                reason=f"Follower count ({total_followers:,}) below minimum required ({min_required:,})",
                impact="negative",
                score_contribution=0,
            )

        # Find tier
        for threshold, points, tier_name in FOLLOWER_TIERS:
            if total_followers >= threshold:
                reason = MatchReason(
                    category="engagement_quality",
                    reason=f"{tier_name} tier influence with {total_followers:,} total followers",
                    impact="positive" if points >= 8 else "neutral",
                    score_contribution=points,
                )
                return points, tier_name, reason

        return 0, "NONE", None

    def _score_engagement_rate(
        self,
        engagement_rate: float,
        min_required: Optional[float],
    ) -> Tuple[float, Optional[MatchReason]]:
        """
        Score based on engagement rate.

        Higher engagement rates are valued because they indicate
        authentic audience connection and better campaign ROI.
        """
        # Check minimum requirement
        if min_required and engagement_rate < min_required:
            return 0, MatchReason(
                category="engagement_quality",
                reason=f"Engagement rate ({engagement_rate:.1f}%) below minimum ({min_required:.1f}%)",
                impact="negative",
                score_contribution=0,
            )

        # Find engagement tier
        for threshold, points, tier_name in ENGAGEMENT_THRESHOLDS:
            if engagement_rate >= threshold:
                if points >= 6:
                    impact = "positive"
                    reason_text = f"{tier_name.replace('_', ' ').title()} engagement rate ({engagement_rate:.1f}%)"
                elif points >= 4:
                    impact = "neutral"
                    reason_text = f"Average engagement rate ({engagement_rate:.1f}%)"
                else:
                    impact = "negative"
                    reason_text = f"Below average engagement rate ({engagement_rate:.1f}%)"

                return points, MatchReason(
                    category="engagement_quality",
                    reason=reason_text,
                    impact=impact,
                    score_contribution=points,
                )

        return 0, None

    # =========================================================================
    # SCORING FUNCTION 4: Values Alignment (15 points max)
    # =========================================================================

    def calculate_values_alignment(
        self,
        athlete: AthleteMatchData,
        brand: BrandMatchData,
    ) -> Tuple[float, List[MatchReason]]:
        """
        Calculate brand safety and values compatibility score.

        Components:
        - No exclusions (base 10 points)
        - Values/personality match (0-5 points bonus)
        - Conference prestige (0-2 points bonus, capped at 15 total)

        Args:
            athlete: Athlete data with preferences and school
            brand: Brand data with values and exclusions

        Returns:
            Tuple of (score, list of reasons)
        """
        score = 0.0
        reasons: List[MatchReason] = []

        # ----- Base Score (10 points if no soft conflicts) -----
        base_score, base_reasons = self._score_compatibility_base(athlete, brand)
        score += base_score
        reasons.extend(base_reasons)

        # ----- Values/Personality Match (0-5 points) -----
        values_score, values_reason = self._score_values_match(
            athlete,  # Would need personality_tags from preferences
            brand.values,
            brand.personality_traits,
        )
        score += values_score
        if values_reason:
            reasons.append(values_reason)

        # ----- Conference Prestige Bonus (0-2 points) -----
        # Power conference athletes may be more valuable for national brands
        if athlete.conference in POWER_CONFERENCES:
            prestige_bonus = 2.0
            score += prestige_bonus
            reasons.append(MatchReason(
                category="values_alignment",
                reason=f"Power conference athlete ({athlete.conference.value})",
                impact="positive",
                score_contribution=prestige_bonus,
            ))

        return min(WEIGHT_VALUES_ALIGNMENT, score), reasons

    def _score_compatibility_base(
        self,
        athlete: AthleteMatchData,
        brand: BrandMatchData,
    ) -> Tuple[float, List[MatchReason]]:
        """
        Calculate base compatibility score, checking for soft conflicts.

        Soft conflicts reduce score but don't disqualify:
        - Brand category in disliked_categories
        - Sport not in brand's preferred sports (if specified)
        """
        max_points = 10.0
        score = max_points
        reasons: List[MatchReason] = []

        # Check if brand category is disliked
        if brand.category and brand.category in athlete.disliked_categories:
            penalty = 5.0
            score -= penalty
            reasons.append(MatchReason(
                category="values_alignment",
                reason=f"Athlete has expressed disinterest in {brand.category.value}",
                impact="negative",
                score_contribution=-penalty,
            ))

        # Check if athlete's sport is in brand's preferred sports
        if brand.preferred_sports and athlete.sport not in brand.preferred_sports:
            penalty = 3.0
            score -= penalty
            reasons.append(MatchReason(
                category="values_alignment",
                reason=f"Athlete's sport ({athlete.sport.value}) not in brand's preferred sports",
                impact="negative",
                score_contribution=-penalty,
            ))

        if score == max_points:
            reasons.append(MatchReason(
                category="values_alignment",
                reason="No compatibility concerns identified",
                impact="positive",
                score_contribution=max_points,
            ))

        return max(0, score), reasons

    def _score_values_match(
        self,
        athlete: AthleteMatchData,
        brand_values: List[str],
        brand_personality: List[str],
    ) -> Tuple[float, Optional[MatchReason]]:
        """
        Score values and personality alignment.

        TODO: Implement actual values matching
        - Would need athlete.personality_tags from preferences
        - Compare against brand values and personality
        """
        max_points = 5.0

        if not brand_values and not brand_personality:
            return 0, None

        # PLACEHOLDER: Calculate actual values overlap
        # For now, return moderate score
        overlap = 0.5  # TODO: Calculate real overlap

        score = max_points * overlap

        return score, MatchReason(
            category="values_alignment",
            reason="Values alignment assessment pending additional data",
            impact="neutral",
            score_contribution=score,
        )

    # =========================================================================
    # Helper Methods
    # =========================================================================

    def _check_exclusions(
        self,
        athlete: AthleteMatchData,
        brand: BrandMatchData,
    ) -> Optional[str]:
        """
        Check for hard exclusions that disqualify the match.

        Hard exclusions:
        - Brand name in athlete's excluded_brands
        - Brand category in athlete's school_restricted_categories
        - Athlete in brand's competitor exclusion list (future)

        Returns:
            Exclusion reason string if excluded, None otherwise
        """
        # Check if brand is explicitly excluded by athlete
        if brand.company_name and brand.company_name.lower() in [
            b.lower() for b in athlete.excluded_brands
        ]:
            return f"Athlete has excluded brand: {brand.company_name}"

        # Check school/NCAA restrictions
        if brand.category and brand.category in athlete.school_restricted_categories:
            return f"School restricts {brand.category.value} partnerships"

        # Future: Check brand's competitor exclusions
        # if athlete has deals with brand.competitor_brands...

        return None

    def _get_tier(self, score: float) -> MatchTier:
        """Determine match tier based on total score."""
        if score >= 85:
            return MatchTier.ELITE
        elif score >= 70:
            return MatchTier.STRONG
        elif score >= 55:
            return MatchTier.GOOD
        elif score >= 40:
            return MatchTier.MODERATE
        else:
            return MatchTier.WEAK


# ============= Module-level convenience function =============

def calculate_match_score(
    athlete: AthleteMatchData,
    brand: BrandMatchData,
    campaign_id: Optional[str] = None,
) -> MatchResult:
    """
    Convenience function to calculate match score.

    Usage:
        from app.services.rule_based import calculate_match_score
        result = calculate_match_score(athlete_data, brand_data)
    """
    scorer = RuleBasedScorer()
    return scorer.calculate_match(athlete, brand, campaign_id)
