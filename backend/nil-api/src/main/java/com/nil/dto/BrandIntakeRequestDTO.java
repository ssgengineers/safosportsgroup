package com.nil.dto;

import lombok.Data;

/**
 * DTO for brand intake form submissions from the frontend.
 */
@Data
public class BrandIntakeRequestDTO {
    
    private String company;
    private String contactFirstName;
    private String contactLastName;
    private String contactTitle;
    private String email;
    private String phone;
    private String website;
    
    private String industry;
    private String companySize;
    private String budget;
    
    private String description;
    private String targetAudience;
    private String goals;
    private String timeline;
    private String athletePreferences;
}

