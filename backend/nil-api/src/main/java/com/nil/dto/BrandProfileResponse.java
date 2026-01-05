package com.nil.dto;

import com.nil.entity.enums.BrandCategory;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for brand profiles.
 */
@Data
@Builder
public class BrandProfileResponse {
    
    private UUID id;
    private UUID userId;
    private String clerkId;
    
    // Company Info
    private String companyName;
    private String industry;
    private BrandCategory brandCategory;
    private String companySize;
    private String website;
    private String logoUrl;
    private String description;
    
    // Contact Info
    private String contactFirstName;
    private String contactLastName;
    private String contactTitle;
    private String contactEmail;
    private String contactPhone;
    
    // User Info (from User entity)
    private String firstName;
    private String lastName;
    private String email;
    private String fullName;
    
    // Marketing Info
    private String targetAudience;
    private String marketingGoals;
    private String budgetRange;
    private String preferredTimeline;
    private String athletePreferences;
    private String contentTypesInterested;
    private String campaignExamples;
    
    // Deal Preferences
    private Double minimumBudget;
    private Double maximumBudget;
    private String preferredDealTypes;
    private String exclusivityRequirements;
    private Boolean isAcceptingApplications;
    
    // AI Matching Preferences
    private String preferredSports; // JSON array
    private String preferredConferences; // JSON array
    private String minFollowers;
    private String maxFollowers;
    private String interestAlignment; // JSON array
    private String contentPreferences; // JSON array
    private String budgetPerAthlete;
    private String dealDuration;
    private String matchingNotes;
    
    // Profile Status
    private Integer profileCompletenessScore;
    private Integer completenessScore; // Alias for profileCompletenessScore
    private Boolean isActive;
    private Boolean isVerified;
    private String status;
    
    // Relationships
    private List<SocialAccountResponse> socialAccounts;
    
    // Timestamps
    private Instant createdAt;
    private Instant updatedAt;
}
