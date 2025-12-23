package com.nil.dto;

import com.nil.entity.enums.SocialPlatform;
import lombok.Data;

/**
 * Request DTO for adding/updating social accounts.
 */
@Data
public class SocialAccountRequest {
    
    private SocialPlatform platform;
    private String handle;
    private String profileUrl;
    
    // Optional: initial metrics (can be fetched automatically later)
    private Long followerCount;
    private Double engagementRate;
}

