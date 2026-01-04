package com.nil.dto;

import com.nil.entity.enums.BrandCategory;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for creating/updating brand profiles.
 */
@Data
public class BrandProfileRequest {
    
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
    
    // Social accounts to add/update
    private List<SocialAccountRequest> socialAccounts;
}

