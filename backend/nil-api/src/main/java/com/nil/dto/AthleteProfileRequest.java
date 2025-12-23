package com.nil.dto;

import com.nil.entity.enums.Conference;
import com.nil.entity.enums.Sport;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request DTO for creating/updating athlete profiles.
 */
@Data
public class AthleteProfileRequest {
    
    // Basic Info
    private String firstName;
    private String lastName;
    private String email;
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
    
    // Social accounts to add
    private List<SocialAccountRequest> socialAccounts;
}

