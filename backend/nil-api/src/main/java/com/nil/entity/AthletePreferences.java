package com.nil.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Athlete Preferences - Brand preferences, content types, and restrictions.
 * Stored separately for easier updates and cleaner data model.
 */
@Entity
@Table(name = "athlete_preferences", indexes = {
    @Index(name = "idx_prefs_athlete", columnList = "athlete_profile_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthletePreferences extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_profile_id", nullable = false, unique = true)
    private AthleteProfile athleteProfile;

    // ==================== Brand Category Preferences ====================
    
    /**
     * Brand categories the athlete is interested in working with.
     * Stored as JSON array of BrandCategory enum values.
     * Example: ["ATHLETIC_APPAREL", "SPORTS_NUTRITION", "GAMING"]
     */
    @Column(name = "liked_categories", columnDefinition = "TEXT")
    private String likedCategories;

    /**
     * Brand categories the athlete does NOT want to work with.
     * Example: ["ALCOHOL", "SPORTS_BETTING", "CRYPTO"]
     */
    @Column(name = "disliked_categories", columnDefinition = "TEXT")
    private String dislikedCategories;

    /**
     * Specific brands the athlete wants to work with.
     * Example: ["Nike", "Gatorade", "Apple"]
     */
    @Column(name = "preferred_brands", columnDefinition = "TEXT")
    private String preferredBrands;

    /**
     * Specific brands the athlete will NOT work with.
     * Example: ["Competitor Brand X"]
     */
    @Column(name = "excluded_brands", columnDefinition = "TEXT")
    private String excludedBrands;

    // ==================== Content Preferences ====================
    
    /**
     * Types of content the athlete is willing to create.
     * Stored as JSON array of ContentType enum values.
     * Example: ["REELS", "TIKTOK_VIDEOS", "IN_PERSON_APPEARANCES"]
     */
    @Column(name = "content_types", columnDefinition = "TEXT")
    private String contentTypes;

    /**
     * Personal interests/themes for content alignment.
     * Example: ["fitness", "fashion", "gaming", "lifestyle"]
     */
    @Column(name = "content_themes", columnDefinition = "TEXT")
    private String contentThemes;

    /**
     * Personality tags for brand matching.
     * Example: ["funny", "inspirational", "family-friendly"]
     */
    @Column(name = "personality_tags", columnDefinition = "TEXT")
    private String personalityTags;

    // ==================== Availability & Travel ====================
    
    /**
     * Willing to travel for appearances/events?
     */
    @Column(name = "willing_to_travel")
    @Builder.Default
    private Boolean willingToTravel = true;

    /**
     * Maximum travel distance in miles (0 = no limit)
     */
    @Column(name = "max_travel_distance")
    private Integer maxTravelDistance;

    /**
     * Regions where athlete is available.
     * Example: ["Northeast", "DMV", "National"]
     */
    @Column(name = "available_regions", columnDefinition = "TEXT")
    private String availableRegions;

    /**
     * General availability notes.
     */
    @Column(name = "availability_notes", columnDefinition = "TEXT")
    private String availabilityNotes;

    // ==================== Compensation Preferences ====================
    
    /**
     * Preferred payment structure.
     * Values: FLAT_FEE, COMMISSION, HYBRID, PRODUCT_ONLY
     */
    @Column(name = "preferred_compensation", length = 50)
    private String preferredCompensation;

    /**
     * Minimum cash payment required.
     */
    @Column(name = "minimum_cash")
    private Double minimumCash;

    /**
     * Open to product-only deals?
     */
    @Column(name = "accepts_product_only")
    @Builder.Default
    private Boolean acceptsProductOnly = false;

    // ==================== Safety & Compliance ====================
    
    /**
     * Restricted categories per school rules.
     * Example: ["ALCOHOL", "GAMBLING", "TOBACCO"]
     */
    @Column(name = "school_restricted_categories", columnDefinition = "TEXT")
    private String schoolRestrictedCategories;

    /**
     * Required disclosure text for posts (per school/NCAA).
     */
    @Column(name = "required_disclosures", columnDefinition = "TEXT")
    private String requiredDisclosures;

    /**
     * Any additional compliance notes.
     */
    @Column(name = "compliance_notes", columnDefinition = "TEXT")
    private String complianceNotes;
}

