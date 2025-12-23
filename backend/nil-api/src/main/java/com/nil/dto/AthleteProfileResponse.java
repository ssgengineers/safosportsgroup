package com.nil.dto;

import com.nil.entity.enums.Conference;
import com.nil.entity.enums.Sport;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for athlete profiles.
 */
@Data
@Builder
public class AthleteProfileResponse {
    
    private UUID id;
    private UUID userId;
    private String clerkId;
    
    // Basic Info
    private String firstName;
    private String lastName;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    
    // Athletic Info
    private Sport sport;
    private String position;
    private String schoolName;
    private Conference conference;
    private String classYear;
    private String jerseyNumber;
    
    // Physical Stats
    private String height;
    private String weight;
    
    // Location
    private String city;
    private String state;
    private String hometown;
    
    // Bio
    private String bio;
    private String headshotUrl;
    
    // NIL Info
    private BigDecimal requestedRate;
    private Boolean nilReady;
    
    // Profile Status
    private Integer completenessScore;
    private Boolean isVerified;
    private String status;
    
    // Relationships
    private List<SocialAccountResponse> socialAccounts;
    private List<AthleteMediaResponse> media;
    
    // Timestamps
    private Instant createdAt;
    private Instant updatedAt;
}

