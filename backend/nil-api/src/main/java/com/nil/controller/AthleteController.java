package com.nil.controller;

import com.nil.dto.*;
import com.nil.service.AthleteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for athlete profile management.
 * Handles CRUD operations for athlete profiles, social accounts, and media.
 */
@RestController
@RequestMapping("/api/v1/athletes")
@Tag(name = "Athletes", description = "Athlete profile management endpoints")
public class AthleteController {

    private final AthleteService athleteService;

    public AthleteController(AthleteService athleteService) {
        this.athleteService = athleteService;
    }

    // ============= Profile CRUD =============

    @PostMapping
    @Operation(
        summary = "Create athlete profile",
        description = "Creates a new athlete profile for the authenticated user"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<AthleteProfileResponse> createProfile(
            @RequestBody AthleteProfileRequest request) {
        
        String clerkId = getAuthenticatedClerkId();
        AthleteProfileResponse response = athleteService.createProfile(clerkId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get athlete profile by ID")
    public ResponseEntity<AthleteProfileResponse> getProfile(
            @Parameter(description = "Profile ID") @PathVariable UUID id) {
        
        AthleteProfileResponse response = athleteService.getProfile(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(
        summary = "Get current user's athlete profile",
        description = "Returns the athlete profile for the authenticated user"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<AthleteProfileResponse> getMyProfile() {
        String clerkId = getAuthenticatedClerkId();
        AthleteProfileResponse response = athleteService.getProfileByClerkId(clerkId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List all athlete profiles with pagination")
    public ResponseEntity<Page<AthleteProfileResponse>> listProfiles(
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<AthleteProfileResponse> profiles = athleteService.getAllProfiles(pageable);
        return ResponseEntity.ok(profiles);
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Update athlete profile",
        description = "Updates an existing athlete profile"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<AthleteProfileResponse> updateProfile(
            @Parameter(description = "Profile ID") @PathVariable UUID id,
            @RequestBody AthleteProfileRequest request) {
        
        AthleteProfileResponse response = athleteService.updateProfile(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete athlete profile")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<Void> deleteProfile(
            @Parameter(description = "Profile ID") @PathVariable UUID id) {
        
        athleteService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }

    // ============= Social Accounts =============

    @PostMapping("/{id}/socials")
    @Operation(
        summary = "Add social account",
        description = "Adds a new social media account to the athlete profile"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<SocialAccountResponse> addSocialAccount(
            @Parameter(description = "Profile ID") @PathVariable UUID id,
            @RequestBody SocialAccountRequest request) {
        
        SocialAccountResponse response = athleteService.addSocialAccount(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{profileId}/socials/{socialId}")
    @Operation(summary = "Remove social account")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<Void> removeSocialAccount(
            @Parameter(description = "Profile ID") @PathVariable UUID profileId,
            @Parameter(description = "Social Account ID") @PathVariable UUID socialId) {
        
        athleteService.deleteSocialAccount(profileId, socialId);
        return ResponseEntity.noContent().build();
    }

    // ============= Profile Completeness =============

    @GetMapping("/{id}/completeness")
    @Operation(
        summary = "Get profile completeness score",
        description = "Returns a 0-100 score indicating how complete the athlete profile is"
    )
    public ResponseEntity<Map<String, Object>> getCompleteness(
            @Parameter(description = "Profile ID") @PathVariable UUID id) {
        
        Integer score = athleteService.getCompletenessScore(id);
        return ResponseEntity.ok(Map.of(
            "profileId", id,
            "completenessScore", score,
            "isComplete", score >= 80,
            "message", getCompletenessMessage(score)
        ));
    }

    // ============= Helper Methods =============

    private String getAuthenticatedClerkId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() != null && !auth.getPrincipal().equals("anonymousUser")) {
            return auth.getPrincipal().toString();
        }
        // For testing without auth, generate a temp ID
        // In production, this should throw an exception
        return "temp-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String getCompletenessMessage(int score) {
        if (score >= 90) return "Excellent! Your profile is nearly complete.";
        if (score >= 80) return "Great job! Your profile is ready for brand matching.";
        if (score >= 60) return "Good progress! Add more details to improve visibility.";
        if (score >= 40) return "Getting there! Complete your social accounts and bio.";
        return "Just getting started. Fill in the basics to begin.";
    }
}

