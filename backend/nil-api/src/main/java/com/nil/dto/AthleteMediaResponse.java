package com.nil.dto;

import com.nil.entity.enums.MediaType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for athlete media.
 */
@Data
@Builder
public class AthleteMediaResponse {
    
    private UUID id;
    private MediaType mediaType;
    private String url;
    private String thumbnailUrl;
    private String title;
    private String description;
    private Boolean isPrimary;
    private Integer displayOrder;
    private Instant createdAt;
}

