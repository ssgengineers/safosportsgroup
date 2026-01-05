package com.nil.controller;

import com.nil.dto.BrandProfileRequest;
import com.nil.dto.BrandProfileResponse;
import com.nil.dto.SocialAccountRequest;
import com.nil.dto.SocialAccountResponse;
import com.nil.service.BrandService;
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
 * REST Controller for brand profile management.
 * Handles CRUD operations for brand profiles and social accounts.
 */
@RestController
@RequestMapping("/api/v1/brands")
@Tag(name = "Brands", description = "Brand profile management endpoints")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    // ============= Profile CRUD =============

    @PostMapping
    @Operation(
        summary = "Create brand profile",
        description = "Creates a new brand profile for the authenticated user"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<BrandProfileResponse> createProfile(
            @RequestBody BrandProfileRequest request) {
        
        String clerkId = getAuthenticatedClerkId();
        BrandProfileResponse response = brandService.createProfile(clerkId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand profile by ID")
    public ResponseEntity<BrandProfileResponse> getProfile(
            @Parameter(description = "Profile ID") @PathVariable UUID id) {
        
        BrandProfileResponse response = brandService.getProfile(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(
        summary = "Get current user's brand profile",
        description = "Returns the brand profile for the authenticated user"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<BrandProfileResponse> getMyProfile() {
        String clerkId = getAuthenticatedClerkId();
        BrandProfileResponse response = brandService.getProfileByClerkId(clerkId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List all brand profiles with pagination")
    public ResponseEntity<Page<BrandProfileResponse>> listProfiles(
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<BrandProfileResponse> profiles = brandService.getAllProfiles(pageable);
        return ResponseEntity.ok(profiles);
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Update brand profile",
        description = "Updates an existing brand profile"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<BrandProfileResponse> updateProfile(
            @Parameter(description = "Profile ID") @PathVariable UUID id,
            @RequestBody BrandProfileRequest request) {
        
        BrandProfileResponse response = brandService.updateProfile(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete brand profile")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<Void> deleteProfile(
            @Parameter(description = "Profile ID") @PathVariable UUID id) {
        
        brandService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }

    // ============= Social Accounts =============

    @PostMapping("/{id}/socials")
    @Operation(
        summary = "Add social account",
        description = "Adds a new social media account to the brand profile"
    )
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<SocialAccountResponse> addSocialAccount(
            @Parameter(description = "Profile ID") @PathVariable UUID id,
            @RequestBody SocialAccountRequest request) {
        
        SocialAccountResponse response = brandService.addSocialAccount(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{profileId}/socials/{socialId}")
    @Operation(summary = "Remove social account")
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<Void> removeSocialAccount(
            @Parameter(description = "Profile ID") @PathVariable UUID profileId,
            @Parameter(description = "Social Account ID") @PathVariable UUID socialId) {
        
        brandService.deleteSocialAccount(profileId, socialId);
        return ResponseEntity.noContent().build();
    }

    // ============= Profile Completeness =============

    @GetMapping("/{id}/completeness")
    @Operation(
        summary = "Get profile completeness score",
        description = "Returns a 0-100 score indicating how complete the brand profile is"
    )
    public ResponseEntity<Map<String, Object>> getCompleteness(
            @Parameter(description = "Profile ID") @PathVariable UUID id) {
        
        Integer score = brandService.getCompletenessScore(id);
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
        throw new RuntimeException("User not authenticated");
    }

    private String getCompletenessMessage(int score) {
        if (score >= 90) return "Excellent! Your profile is nearly complete.";
        if (score >= 80) return "Great job! Your profile is ready for athlete matching.";
        if (score >= 60) return "Good progress! Add more details to improve visibility.";
        if (score >= 40) return "Getting there! Complete your company info and goals.";
        return "Just getting started. Fill in the basics to begin.";
    }
}

