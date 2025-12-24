package com.nil.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO for athlete intake form submissions from the frontend.
 */
@Data
public class AthleteIntakeRequestDTO {
    
    // Personal Info
    private String firstName;
    private String lastName;
    private String email;
    private String dateOfBirth;
    private String location;
    
    // Athletic Info
    private String school;
    private String sport;
    private String position;
    
    // Social Media
    private SocialAccountInfo primarySocial;
    private List<SocialAccountInfo> additionalSocials;
    
    // Profile
    private String bio;
    private String goals;
    
    @Data
    public static class SocialAccountInfo {
        private String platform;
        private String handle;
    }
}

