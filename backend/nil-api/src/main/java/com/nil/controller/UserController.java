package com.nil.controller;

import com.nil.dto.UserResponse;
import com.nil.entity.User;
import com.nil.exception.ResourceNotFoundException;
import com.nil.repository.AthleteProfileRepository;
import com.nil.repository.BrandProfileRepository;
import com.nil.service.ClerkUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for user information endpoints.
 */
@RestController
@RequestMapping("/api/v1/user")
@Tag(name = "User", description = "User information endpoints")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final ClerkUserService clerkUserService;
    private final AthleteProfileRepository athleteProfileRepository;
    private final BrandProfileRepository brandProfileRepository;

    public UserController(ClerkUserService clerkUserService, AthleteProfileRepository athleteProfileRepository, BrandProfileRepository brandProfileRepository) {
        this.clerkUserService = clerkUserService;
        this.athleteProfileRepository = athleteProfileRepository;
        this.brandProfileRepository = brandProfileRepository;
    }

    @GetMapping("/me")
    @Operation(
        summary = "Get current authenticated user",
        description = "Returns the current user's information including roles and profile status"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<UserResponse> getCurrentUser() {
        try {
            String clerkId = getAuthenticatedClerkId();
            log.info("Getting user data for clerkId: {}", clerkId);
            
            // Try to get user, or sync if they don't exist
            User user = clerkUserService.getUserByClerkId(clerkId)
                    .orElseGet(() -> {
                        log.warn("User not found for clerkId: {}, attempting to sync", clerkId);
                        // Get email from authentication details if available
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        String email = null;
                        String firstName = null;
                        String lastName = null;
                        
                        if (auth != null && auth.getDetails() instanceof java.util.Map) {
                            @SuppressWarnings("unchecked")
                            java.util.Map<String, Object> details = (java.util.Map<String, Object>) auth.getDetails();
                            email = (String) details.get("email");
                            firstName = (String) details.get("firstName");
                            lastName = (String) details.get("lastName");
                            log.debug("Extracted from auth details - email: {}, firstName: {}, lastName: {}", email, firstName, lastName);
                        }
                        
                        // If we have email, try to sync the user
                        if (email != null && !email.isEmpty()) {
                            log.info("Syncing user with email: {}", email);
                            try {
                                return clerkUserService.syncClerkUser(clerkId, email, firstName, lastName);
                            } catch (IllegalArgumentException e) {
                                log.error("Failed to sync user: {}", e.getMessage());
                                throw new ResourceNotFoundException("User not found and unable to sync: " + e.getMessage());
                            }
                        }
                        
                        // If no email, we can't create the user (email is required in database)
                        log.error("User not found and unable to sync - no email in auth details for clerkId: {}", clerkId);
                        throw new ResourceNotFoundException("User not found. Please ensure your Clerk account has an email address configured and that email is included in the JWT token.");
                    });

            // Check if user has athlete profile
            boolean hasAthleteProfile = false;
            try {
                if (user.getId() != null) {
                    hasAthleteProfile = athleteProfileRepository.existsByUserId(user.getId());
                }
            } catch (Exception e) {
                log.warn("Error checking athlete profile existence: {}", e.getMessage());
            }

            // Check if user has brand profile
            boolean hasBrandProfile = false;
            try {
                if (user.getId() != null) {
                    hasBrandProfile = brandProfileRepository.existsByUserId(user.getId());
                }
            } catch (Exception e) {
                log.warn("Error checking brand profile existence: {}", e.getMessage());
            }

            // Build response with null-safe operations
            List<String> roles = new ArrayList<>();
            try {
                if (user.getRoles() != null) {
                    roles = user.getRoles().stream()
                        .filter(role -> role != null && role.getName() != null)
                        .map(role -> role.getName().name())
                        .collect(Collectors.toList());
                }
            } catch (Exception e) {
                log.warn("Error extracting roles: {}", e.getMessage());
            }

            // Build response with all null checks - use builder pattern safely
            UserResponse response = UserResponse.builder()
                    .id(user.getId() != null ? user.getId().toString() : null)
                    .clerkId(user.getClerkId() != null ? user.getClerkId() : null)
                    .email(user.getEmail() != null ? user.getEmail() : null)
                    .firstName(user.getFirstName() != null ? user.getFirstName() : null)
                    .lastName(user.getLastName() != null ? user.getLastName() : null)
                    .fullName(user.getFullName() != null ? user.getFullName() : null)
                    .status(user.getStatus() != null ? user.getStatus() : "ACTIVE")
                    .roles(roles != null ? roles : new ArrayList<>())
                    .hasAthleteProfile(hasAthleteProfile)
                    .hasBrandProfile(hasBrandProfile)
                    .build();

            log.info("Returning user data for clerkId: {}, email: {}, roles: {}", clerkId, user.getEmail(), roles);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error in getCurrentUser: {}", e.getMessage(), e);
            throw e; // Re-throw to be handled by GlobalExceptionHandler
        } catch (Exception e) {
            log.error("Unexpected error in getCurrentUser: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get user data: " + e.getMessage(), e);
        }
    }

    /**
     * Extract Clerk ID from security context.
     */
    private String getAuthenticatedClerkId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getPrincipal().toString();
        }
        throw new RuntimeException("User not authenticated");
    }
}

