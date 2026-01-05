package com.nil.entity;

import com.nil.entity.enums.BrandCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Brand Profile - Core brand data for matching and NIL deals.
 * This is the primary entity capturing all brand information.
 */
@Entity
@Table(name = "brand_profiles", indexes = {
    @Index(name = "idx_brand_user", columnList = "user_id"),
    @Index(name = "idx_brand_company", columnList = "company_name"),
    @Index(name = "idx_brand_industry", columnList = "industry")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandProfile extends BaseEntity {

    // ==================== User Relationship ====================
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ==================== Company Information ====================
    
    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "industry", length = 100)
    private String industry;

    @Enumerated(EnumType.STRING)
    @Column(name = "brand_category", length = 50)
    private BrandCategory brandCategory;

    @Column(name = "company_size", length = 100)
    private String companySize;

    @Column(name = "website", length = 500)
    private String website;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // ==================== Contact Information ====================
    
    @Column(name = "contact_first_name", length = 100)
    private String contactFirstName;

    @Column(name = "contact_last_name", length = 100)
    private String contactLastName;

    @Column(name = "contact_title", length = 100)
    private String contactTitle;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    // ==================== Campaign & Marketing Information ====================
    
    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "marketing_goals", columnDefinition = "TEXT")
    private String marketingGoals;

    @Column(name = "budget_range", length = 100)
    private String budgetRange;

    @Column(name = "preferred_timeline", length = 100)
    private String preferredTimeline;

    @Column(name = "athlete_preferences", columnDefinition = "TEXT")
    private String athletePreferences; // JSON or formatted text

    @Column(name = "content_types_interested", columnDefinition = "TEXT")
    private String contentTypesInterested; // JSON array

    // ==================== AI Matching Preferences ====================
    
    @Column(name = "preferred_sports", columnDefinition = "TEXT")
    private String preferredSports; // JSON array of sports

    @Column(name = "preferred_conferences", columnDefinition = "TEXT")
    private String preferredConferences; // JSON array of conferences

    @Column(name = "min_followers", length = 50)
    private String minFollowers; // e.g., "50K"

    @Column(name = "max_followers", length = 50)
    private String maxFollowers; // e.g., "500K"

    @Column(name = "interest_alignment", columnDefinition = "TEXT")
    private String interestAlignment; // JSON array of interests

    @Column(name = "content_preferences", columnDefinition = "TEXT")
    private String contentPreferences; // JSON array of content types

    @Column(name = "budget_per_athlete", length = 100)
    private String budgetPerAthlete; // e.g., "$5,000 - $15,000"

    @Column(name = "deal_duration", length = 100)
    private String dealDuration; // e.g., "3-6 months"

    @Column(name = "matching_notes", columnDefinition = "TEXT")
    private String matchingNotes; // Additional notes for AI matching

    @Column(name = "campaign_examples", columnDefinition = "TEXT")
    private String campaignExamples; // JSON or formatted text

    // ==================== Deal Preferences ====================
    
    @Column(name = "minimum_budget")
    private Double minimumBudget;

    @Column(name = "maximum_budget")
    private Double maximumBudget;

    @Column(name = "preferred_deal_types", columnDefinition = "TEXT")
    private String preferredDealTypes; // JSON array

    @Column(name = "exclusivity_requirements", columnDefinition = "TEXT")
    private String exclusivityRequirements;

    @Column(name = "is_accepting_applications")
    @Builder.Default
    private Boolean isAcceptingApplications = true;

    // ==================== Profile Status & Metrics ====================
    
    @Column(name = "profile_completeness_score")
    @Builder.Default
    private Integer profileCompletenessScore = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    // ==================== Relationships ====================
    
    @OneToMany(mappedBy = "brandProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BrandSocialAccount> socialAccounts = new ArrayList<>();
}

