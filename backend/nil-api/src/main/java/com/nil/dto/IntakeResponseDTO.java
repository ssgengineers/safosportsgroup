package com.nil.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for intake submissions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntakeResponseDTO {
    
    private UUID id;
    private String status;
    private String message;
    private Instant submittedAt;
}

