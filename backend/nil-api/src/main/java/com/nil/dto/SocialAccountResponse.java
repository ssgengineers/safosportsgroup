package com.nil.dto;

import com.nil.entity.enums.SocialPlatform;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for social accounts.
 */
@Data
@Builder
public class SocialAccountResponse {
    
    private UUID id;
    private SocialPlatform platform;
    private String handle;
    private String profileUrl;
    private Boolean isVerified;
    private Boolean isConnected;
    private Long followerCount;
    private Double engagementRate;
    private Instant lastSyncedAt;
    private Instant createdAt;
}

