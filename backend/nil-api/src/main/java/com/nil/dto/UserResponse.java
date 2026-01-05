package com.nil.dto;

import com.nil.entity.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Response DTO for user information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String clerkId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String status;
    private List<String> roles; // List of role names (ATHLETE, BRAND, ADMIN)
    private Boolean hasAthleteProfile;
    private Boolean hasBrandProfile; // For future use
}

