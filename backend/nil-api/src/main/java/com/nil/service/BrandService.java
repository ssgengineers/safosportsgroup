package com.nil.service;

import com.nil.dto.*;
import com.nil.entity.*;
import com.nil.entity.enums.RoleType;
import com.nil.entity.enums.SocialPlatform;
import com.nil.exception.BadRequestException;
import com.nil.exception.ResourceNotFoundException;
import com.nil.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing brand profiles.
 */
@Service
public class BrandService {

    private static final Logger log = LoggerFactory.getLogger(BrandService.class);

    private final BrandProfileRepository brandProfileRepository;
    private final BrandSocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClerkUserService clerkUserService;

    public BrandService(BrandProfileRepository brandProfileRepository,
                        BrandSocialAccountRepository socialAccountRepository,
                        UserRepository userRepository,
                        RoleRepository roleRepository,
                        ClerkUserService clerkUserService) {
        this.brandProfileRepository = brandProfileRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.clerkUserService = clerkUserService;
    }

    /**
     * Create a new brand profile linked to a Clerk user.
     */
    @Transactional
    public BrandProfileResponse createProfile(String clerkId, BrandProfileRequest request) {
        // Get or create user
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + clerkId));

        // Check if profile already exists
        if (brandProfileRepository.existsByUserId(user.getId())) {
            throw new BadRequestException("Brand profile already exists for this user");
        }

        // Create profile
        BrandProfile profile = new BrandProfile();
        profile.setUser(user);
        mapRequestToProfile(request, profile);

        // Add social accounts if provided
        if (request.getSocialAccounts() != null) {
            for (SocialAccountRequest socialReq : request.getSocialAccounts()) {
                BrandSocialAccount social = new BrandSocialAccount();
                social.setBrandProfile(profile);
                social.setPlatform(socialReq.getPlatform());
                social.setHandle(socialReq.getHandle());
                social.setProfileUrl(socialReq.getProfileUrl());
                if (socialReq.getFollowerCount() != null) {
                    social.setFollowers(socialReq.getFollowerCount());
                }
                profile.getSocialAccounts().add(social);
            }
        }

        // Calculate completeness score
        profile.setProfileCompletenessScore(calculateCompleteness(profile));

        BrandProfile saved = brandProfileRepository.save(profile);
        log.info("Created brand profile for user: {}", clerkId);

        return mapProfileToResponse(saved);
    }

    /**
     * Get brand profile by ID.
     */
    @Cacheable(value = "brands", key = "#id")
    public BrandProfileResponse getProfile(UUID id) {
        log.debug("Fetching brand profile from database: {}", id);
        BrandProfile profile = brandProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand profile not found: " + id));
        return mapProfileToResponse(profile);
    }

    /**
     * Get brand profile by Clerk user ID.
     */
    public BrandProfileResponse getProfileByClerkId(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + clerkId));
        
        BrandProfile profile = brandProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand profile not found for user: " + clerkId));
        
        return mapProfileToResponse(profile);
    }

    /**
     * Update a brand profile.
     */
    @Transactional
    @CacheEvict(value = "brands", key = "#id")
    public BrandProfileResponse updateProfile(UUID id, BrandProfileRequest request) {
        BrandProfile profile = brandProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand profile not found: " + id));

        // Update user info if provided
        User user = profile.getUser();
        if (request.getContactFirstName() != null) {
            user.setFirstName(request.getContactFirstName());
        }
        if (request.getContactLastName() != null) {
            user.setLastName(request.getContactLastName());
        }
        if (request.getContactEmail() != null) {
            user.setEmail(request.getContactEmail());
        }
        if (request.getContactPhone() != null) {
            user.setPhone(request.getContactPhone());
        }
        userRepository.save(user);

        // Update profile fields
        mapRequestToProfile(request, profile);

        // Handle social accounts - update existing or create new ones
        if (request.getSocialAccounts() != null) {
            // Load existing social accounts
            List<BrandSocialAccount> existingAccounts = socialAccountRepository.findByBrandProfileId(id);
            
            // Track which platforms are in the request
            Set<SocialPlatform> requestedPlatforms = request.getSocialAccounts().stream()
                    .filter(sa -> sa.getPlatform() != null && sa.getHandle() != null && !sa.getHandle().trim().isEmpty())
                    .map(SocialAccountRequest::getPlatform)
                    .collect(Collectors.toSet());
            
            // Update or create social accounts from request
            for (SocialAccountRequest socialReq : request.getSocialAccounts()) {
                if (socialReq.getPlatform() != null && socialReq.getHandle() != null && !socialReq.getHandle().trim().isEmpty()) {
                    try {
                        // Check if account already exists for this platform
                        Optional<BrandSocialAccount> existingAccountOpt = existingAccounts.stream()
                                .filter(acc -> acc.getPlatform() == socialReq.getPlatform())
                                .findFirst();
                        
                        BrandSocialAccount social;
                        if (existingAccountOpt.isPresent()) {
                            // Update existing account
                            social = existingAccountOpt.get();
                            social.setHandle(socialReq.getHandle().trim());
                            if (socialReq.getProfileUrl() != null) {
                                social.setProfileUrl(socialReq.getProfileUrl().trim());
                            }
                            if (socialReq.getFollowerCount() != null) {
                                social.setFollowers(socialReq.getFollowerCount());
                            }
                            socialAccountRepository.save(social);
                        } else {
                            // Create new account
                            social = new BrandSocialAccount();
                            social.setBrandProfile(profile);
                            social.setPlatform(socialReq.getPlatform());
                            social.setHandle(socialReq.getHandle().trim());
                            if (socialReq.getProfileUrl() != null) {
                                social.setProfileUrl(socialReq.getProfileUrl().trim());
                            }
                            if (socialReq.getFollowerCount() != null) {
                                social.setFollowers(socialReq.getFollowerCount());
                            }
                            profile.getSocialAccounts().add(social);
                            socialAccountRepository.save(social);
                        }
                    } catch (Exception e) {
                        log.warn("Failed to add/update social account for platform {}: {}", socialReq.getPlatform(), e.getMessage());
                    }
                }
            }

            // Delete accounts that are not in the request
            for (BrandSocialAccount existing : existingAccounts) {
                if (!requestedPlatforms.contains(existing.getPlatform())) {
                    socialAccountRepository.delete(existing);
                    profile.getSocialAccounts().remove(existing);
                }
            }
        }

        profile.setProfileCompletenessScore(calculateCompleteness(profile));

        BrandProfile saved = brandProfileRepository.save(profile);
        log.info("Updated brand profile: {}", id);

        return mapProfileToResponse(saved);
    }

    /**
     * Delete a brand profile.
     * Also deletes the user from Clerk and the local database.
     */
    @Transactional
    @CacheEvict(value = "brands", key = "#id")
    public void deleteProfile(UUID id) {
        BrandProfile profile = brandProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand profile not found: " + id));
        
        // Get the user and clerkId before deleting
        User user = profile.getUser();
        String clerkId = user != null ? user.getClerkId() : null;
        
        // Delete the profile first
        brandProfileRepository.deleteById(id);
        log.info("Deleted brand profile: {}", id);
        
        // Delete from Clerk if we have a clerkId
        if (clerkId != null && !clerkId.isEmpty()) {
            boolean deletedFromClerk = clerkUserService.deleteUserFromClerk(clerkId);
            if (deletedFromClerk) {
                log.info("Successfully deleted user from Clerk: {}", clerkId);
            } else {
                log.error("⚠️ FAILED to delete user from Clerk: {}. User may still exist in Clerk. Check CLERK_SECRET_KEY configuration and backend logs.", clerkId);
                // Note: We continue with local deletion even if Clerk deletion fails
                // This prevents blocking the deletion if Clerk API is temporarily unavailable
            }
        } else {
            log.warn("Cannot delete from Clerk: clerkId is null or empty for brand profile: {}", id);
        }
        
        // Delete the user from local database if it exists
        if (user != null) {
            userRepository.delete(user);
            log.info("Deleted user from local database: {}", user.getId());
        }
    }

    /**
     * Get all brand profiles with pagination.
     */
    public Page<BrandProfileResponse> getAllProfiles(Pageable pageable) {
        return brandProfileRepository.findAll(pageable)
                .map(this::mapProfileToResponse);
    }

    /**
     * Add a social account to a brand profile.
     */
    @Transactional
    public SocialAccountResponse addSocialAccount(UUID profileId, SocialAccountRequest request) {
        BrandProfile profile = brandProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand profile not found: " + profileId));

        // Check if account already exists for this platform
        boolean exists = profile.getSocialAccounts().stream()
                .anyMatch(s -> s.getPlatform() == request.getPlatform());
        if (exists) {
            throw new BadRequestException("Social account for " + request.getPlatform() + " already exists");
        }

        BrandSocialAccount social = new BrandSocialAccount();
        social.setBrandProfile(profile);
        social.setPlatform(request.getPlatform());
        social.setHandle(request.getHandle());
        social.setProfileUrl(request.getProfileUrl());

        if (request.getFollowerCount() != null) {
            social.setFollowers(request.getFollowerCount());
        }

        BrandSocialAccount saved = socialAccountRepository.save(social);

        // Update completeness score
        profile.setProfileCompletenessScore(calculateCompleteness(profile));
        brandProfileRepository.save(profile);

        log.info("Added {} social account to profile: {}", request.getPlatform(), profileId);
        return mapSocialToResponse(saved);
    }

    /**
     * Delete a social account.
     */
    @Transactional
    public void deleteSocialAccount(UUID profileId, UUID socialId) {
        BrandProfile profile = brandProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand profile not found: " + profileId));

        BrandSocialAccount social = socialAccountRepository.findById(socialId)
                .orElseThrow(() -> new ResourceNotFoundException("Social account not found: " + socialId));

        if (!social.getBrandProfile().getId().equals(profileId)) {
            throw new BadRequestException("Social account does not belong to this profile");
        }

        socialAccountRepository.delete(social);

        // Update completeness score
        profile.setProfileCompletenessScore(calculateCompleteness(profile));
        brandProfileRepository.save(profile);

        log.info("Deleted social account {} from profile: {}", socialId, profileId);
    }

    /**
     * Get profile completeness score.
     */
    public Integer getCompletenessScore(UUID profileId) {
        BrandProfile profile = brandProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand profile not found: " + profileId));
        return calculateCompleteness(profile);
    }

    // ============= Helper Methods =============

    private void mapRequestToProfile(BrandProfileRequest request, BrandProfile profile) {
        if (request.getCompanyName() != null) profile.setCompanyName(request.getCompanyName());
        if (request.getIndustry() != null) profile.setIndustry(request.getIndustry());
        if (request.getBrandCategory() != null) profile.setBrandCategory(request.getBrandCategory());
        if (request.getCompanySize() != null) profile.setCompanySize(request.getCompanySize());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getLogoUrl() != null) profile.setLogoUrl(request.getLogoUrl());
        if (request.getDescription() != null) profile.setDescription(request.getDescription());
        if (request.getContactFirstName() != null) profile.setContactFirstName(request.getContactFirstName());
        if (request.getContactLastName() != null) profile.setContactLastName(request.getContactLastName());
        if (request.getContactTitle() != null) profile.setContactTitle(request.getContactTitle());
        if (request.getContactEmail() != null) profile.setContactEmail(request.getContactEmail());
        if (request.getContactPhone() != null) profile.setContactPhone(request.getContactPhone());
        if (request.getTargetAudience() != null) profile.setTargetAudience(request.getTargetAudience());
        if (request.getMarketingGoals() != null) profile.setMarketingGoals(request.getMarketingGoals());
        if (request.getBudgetRange() != null) profile.setBudgetRange(request.getBudgetRange());
        if (request.getPreferredTimeline() != null) profile.setPreferredTimeline(request.getPreferredTimeline());
        if (request.getAthletePreferences() != null) profile.setAthletePreferences(request.getAthletePreferences());
        if (request.getContentTypesInterested() != null) profile.setContentTypesInterested(request.getContentTypesInterested());
        if (request.getCampaignExamples() != null) profile.setCampaignExamples(request.getCampaignExamples());
        if (request.getMinimumBudget() != null) profile.setMinimumBudget(request.getMinimumBudget());
        if (request.getMaximumBudget() != null) profile.setMaximumBudget(request.getMaximumBudget());
        if (request.getPreferredDealTypes() != null) profile.setPreferredDealTypes(request.getPreferredDealTypes());
        if (request.getExclusivityRequirements() != null) profile.setExclusivityRequirements(request.getExclusivityRequirements());
        if (request.getIsAcceptingApplications() != null) profile.setIsAcceptingApplications(request.getIsAcceptingApplications());
        
        // AI Matching Preferences
        if (request.getPreferredSports() != null) profile.setPreferredSports(request.getPreferredSports());
        if (request.getPreferredConferences() != null) profile.setPreferredConferences(request.getPreferredConferences());
        if (request.getMinFollowers() != null) profile.setMinFollowers(request.getMinFollowers());
        if (request.getMaxFollowers() != null) profile.setMaxFollowers(request.getMaxFollowers());
        if (request.getInterestAlignment() != null) profile.setInterestAlignment(request.getInterestAlignment());
        if (request.getContentPreferences() != null) profile.setContentPreferences(request.getContentPreferences());
        if (request.getBudgetPerAthlete() != null) profile.setBudgetPerAthlete(request.getBudgetPerAthlete());
        if (request.getDealDuration() != null) profile.setDealDuration(request.getDealDuration());
        if (request.getMatchingNotes() != null) profile.setMatchingNotes(request.getMatchingNotes());
    }

    private BrandProfileResponse mapProfileToResponse(BrandProfile profile) {
        User user = profile.getUser();
        
        List<SocialAccountResponse> socialResponses = profile.getSocialAccounts().stream()
                .map(this::mapSocialToResponse)
                .collect(Collectors.toList());

        return BrandProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .clerkId(user.getClerkId())
                .companyName(profile.getCompanyName())
                .industry(profile.getIndustry())
                .brandCategory(profile.getBrandCategory())
                .companySize(profile.getCompanySize())
                .website(profile.getWebsite())
                .logoUrl(profile.getLogoUrl())
                .description(profile.getDescription())
                .contactFirstName(profile.getContactFirstName())
                .contactLastName(profile.getContactLastName())
                .contactTitle(profile.getContactTitle())
                .contactEmail(profile.getContactEmail())
                .contactPhone(profile.getContactPhone())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .targetAudience(profile.getTargetAudience())
                .marketingGoals(profile.getMarketingGoals())
                .budgetRange(profile.getBudgetRange())
                .preferredTimeline(profile.getPreferredTimeline())
                .athletePreferences(profile.getAthletePreferences())
                .contentTypesInterested(profile.getContentTypesInterested())
                .campaignExamples(profile.getCampaignExamples())
                .minimumBudget(profile.getMinimumBudget())
                .maximumBudget(profile.getMaximumBudget())
                .preferredDealTypes(profile.getPreferredDealTypes())
                .exclusivityRequirements(profile.getExclusivityRequirements())
                .isAcceptingApplications(profile.getIsAcceptingApplications())
                .preferredSports(profile.getPreferredSports())
                .preferredConferences(profile.getPreferredConferences())
                .minFollowers(profile.getMinFollowers())
                .maxFollowers(profile.getMaxFollowers())
                .interestAlignment(profile.getInterestAlignment())
                .contentPreferences(profile.getContentPreferences())
                .budgetPerAthlete(profile.getBudgetPerAthlete())
                .dealDuration(profile.getDealDuration())
                .matchingNotes(profile.getMatchingNotes())
                .profileCompletenessScore(profile.getProfileCompletenessScore())
                .completenessScore(profile.getProfileCompletenessScore()) // Alias
                .isActive(profile.getIsActive())
                .isVerified(profile.getIsVerified())
                .status(profile.getIsActive() ? "ACTIVE" : "INACTIVE")
                .socialAccounts(socialResponses)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private SocialAccountResponse mapSocialToResponse(BrandSocialAccount social) {
        return SocialAccountResponse.builder()
                .id(social.getId())
                .platform(social.getPlatform())
                .handle(social.getHandle())
                .profileUrl(social.getProfileUrl())
                .isVerified(social.getIsVerified())
                .isConnected(social.getIsConnected())
                .followerCount(social.getFollowers())
                .lastSyncedAt(social.getUpdatedAt())
                .createdAt(social.getCreatedAt())
                .build();
    }

    /**
     * Calculate profile completeness score (0-100).
     */
    private Integer calculateCompleteness(BrandProfile profile) {
        int score = 0;

        // Company info (40%)
        if (profile.getCompanyName() != null && !profile.getCompanyName().isEmpty()) score += 10;
        if (profile.getIndustry() != null && !profile.getIndustry().isEmpty()) score += 10;
        if (profile.getWebsite() != null && !profile.getWebsite().isEmpty()) score += 10;
        if (profile.getDescription() != null && !profile.getDescription().isEmpty()) score += 10;

        // Contact info (20%)
        if (profile.getContactEmail() != null && !profile.getContactEmail().isEmpty()) score += 10;
        if (profile.getContactPhone() != null && !profile.getContactPhone().isEmpty()) score += 10;

        // Marketing info (25%)
        if (profile.getTargetAudience() != null && !profile.getTargetAudience().isEmpty()) score += 10;
        if (profile.getMarketingGoals() != null && !profile.getMarketingGoals().isEmpty()) score += 10;
        if (profile.getBudgetRange() != null && !profile.getBudgetRange().isEmpty()) score += 5;

        // Social accounts (15%)
        if (profile.getSocialAccounts() != null && !profile.getSocialAccounts().isEmpty()) {
            score += 15;
        }

        return Math.min(score, 100);
    }
}

