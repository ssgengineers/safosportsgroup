package com.nil.service;

import com.nil.dto.*;
import com.nil.entity.*;
import com.nil.entity.enums.RoleType;
import com.nil.exception.BadRequestException;
import com.nil.exception.ResourceNotFoundException;
import com.nil.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing athlete profiles.
 */
@Service
public class AthleteService {

    private static final Logger log = LoggerFactory.getLogger(AthleteService.class);

    private final AthleteProfileRepository athleteProfileRepository;
    private final AthleteSocialAccountRepository socialAccountRepository;
    private final AthleteMediaRepository mediaRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AthleteService(AthleteProfileRepository athleteProfileRepository,
                          AthleteSocialAccountRepository socialAccountRepository,
                          AthleteMediaRepository mediaRepository,
                          UserRepository userRepository,
                          RoleRepository roleRepository) {
        this.athleteProfileRepository = athleteProfileRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    /**
     * Create a new athlete profile linked to a Clerk user.
     */
    @Transactional
    public AthleteProfileResponse createProfile(String clerkId, AthleteProfileRequest request) {
        // Get or create user
        User user = userRepository.findByClerkId(clerkId)
                .orElseGet(() -> createNewUser(clerkId, request));

        // Check if profile already exists
        if (athleteProfileRepository.existsByUserId(user.getId())) {
            throw new BadRequestException("Athlete profile already exists for this user");
        }

        // Create profile
        AthleteProfile profile = new AthleteProfile();
        profile.setUser(user);
        mapRequestToProfile(request, profile);

        // Add social accounts if provided
        if (request.getSocialAccounts() != null) {
            for (SocialAccountRequest socialReq : request.getSocialAccounts()) {
                AthleteSocialAccount social = new AthleteSocialAccount();
                social.setAthleteProfile(profile);
                social.setPlatform(socialReq.getPlatform());
                social.setHandle(socialReq.getHandle());
                social.setProfileUrl(socialReq.getProfileUrl());
                profile.getSocialAccounts().add(social);
            }
        }

        // Calculate completeness score
        profile.setProfileCompletenessScore(calculateCompleteness(profile));

        AthleteProfile saved = athleteProfileRepository.save(profile);
        log.info("Created athlete profile for user: {}", clerkId);

        return mapProfileToResponse(saved);
    }

    /**
     * Get athlete profile by ID.
     */
    public AthleteProfileResponse getProfile(UUID id) {
        AthleteProfile profile = athleteProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete profile not found: " + id));
        return mapProfileToResponse(profile);
    }

    /**
     * Get athlete profile by Clerk user ID.
     */
    public AthleteProfileResponse getProfileByClerkId(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + clerkId));
        
        AthleteProfile profile = athleteProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Athlete profile not found for user: " + clerkId));
        
        return mapProfileToResponse(profile);
    }

    /**
     * Update an athlete profile.
     */
    @Transactional
    public AthleteProfileResponse updateProfile(UUID id, AthleteProfileRequest request) {
        AthleteProfile profile = athleteProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete profile not found: " + id));

        mapRequestToProfile(request, profile);
        profile.setProfileCompletenessScore(calculateCompleteness(profile));

        AthleteProfile saved = athleteProfileRepository.save(profile);
        log.info("Updated athlete profile: {}", id);

        return mapProfileToResponse(saved);
    }

    /**
     * Delete an athlete profile.
     */
    @Transactional
    public void deleteProfile(UUID id) {
        if (!athleteProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Athlete profile not found: " + id);
        }
        athleteProfileRepository.deleteById(id);
        log.info("Deleted athlete profile: {}", id);
    }

    /**
     * Get all athlete profiles with pagination.
     */
    public Page<AthleteProfileResponse> getAllProfiles(Pageable pageable) {
        return athleteProfileRepository.findAll(pageable)
                .map(this::mapProfileToResponse);
    }

    /**
     * Add a social account to an athlete profile.
     */
    @Transactional
    public SocialAccountResponse addSocialAccount(UUID profileId, SocialAccountRequest request) {
        AthleteProfile profile = athleteProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete profile not found: " + profileId));

        // Check if account already exists for this platform
        boolean exists = profile.getSocialAccounts().stream()
                .anyMatch(s -> s.getPlatform() == request.getPlatform());
        if (exists) {
            throw new BadRequestException("Social account for " + request.getPlatform() + " already exists");
        }

        AthleteSocialAccount social = new AthleteSocialAccount();
        social.setAthleteProfile(profile);
        social.setPlatform(request.getPlatform());
        social.setHandle(request.getHandle());
        social.setProfileUrl(request.getProfileUrl());

        // Set initial metrics if provided
        if (request.getFollowerCount() != null) {
            social.setFollowers(request.getFollowerCount());
        }

        AthleteSocialAccount saved = socialAccountRepository.save(social);

        // Update completeness score
        profile.setProfileCompletenessScore(calculateCompleteness(profile));
        athleteProfileRepository.save(profile);

        log.info("Added {} social account to profile: {}", request.getPlatform(), profileId);
        return mapSocialToResponse(saved);
    }

    /**
     * Delete a social account.
     */
    @Transactional
    public void deleteSocialAccount(UUID profileId, UUID socialId) {
        AthleteProfile profile = athleteProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete profile not found: " + profileId));

        AthleteSocialAccount social = socialAccountRepository.findById(socialId)
                .orElseThrow(() -> new ResourceNotFoundException("Social account not found: " + socialId));

        if (!social.getAthleteProfile().getId().equals(profileId)) {
            throw new BadRequestException("Social account does not belong to this profile");
        }

        socialAccountRepository.delete(social);

        // Update completeness score
        profile.setProfileCompletenessScore(calculateCompleteness(profile));
        athleteProfileRepository.save(profile);

        log.info("Deleted social account {} from profile: {}", socialId, profileId);
    }

    /**
     * Get profile completeness score.
     */
    public Integer getCompletenessScore(UUID profileId) {
        AthleteProfile profile = athleteProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete profile not found: " + profileId));
        return calculateCompleteness(profile);
    }

    // ============= Helper Methods =============

    private User createNewUser(String clerkId, AthleteProfileRequest request) {
        User user = new User();
        user.setClerkId(clerkId);
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setStatus("ACTIVE");

        // Add ATHLETE role
        Role athleteRole = roleRepository.findByName(RoleType.ATHLETE)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleType.ATHLETE);
                    role.setDescription("Athlete user role");
                    return roleRepository.save(role);
                });
        user.getRoles().add(athleteRole);

        return userRepository.save(user);
    }

    private void mapRequestToProfile(AthleteProfileRequest request, AthleteProfile profile) {
        if (request.getSport() != null) profile.setSport(request.getSport());
        if (request.getPosition() != null) profile.setPosition(request.getPosition());
        if (request.getSchoolName() != null) profile.setSchool(request.getSchoolName());
        if (request.getConference() != null) profile.setConference(request.getConference());
        if (request.getClassYear() != null) profile.setClassYear(request.getClassYear());
        if (request.getJerseyNumber() != null) profile.setJerseyNumber(request.getJerseyNumber());
        if (request.getHeight() != null) profile.setDisplayName(request.getHeight()); // Map height to display name temp
        // Note: height/weight not in current entity - would need migration
        if (request.getCity() != null) profile.setHometown(request.getCity());
        if (request.getState() != null) profile.setHomeState(request.getState());
        if (request.getHometown() != null) profile.setHometown(request.getHometown());
        if (request.getBio() != null) profile.setBio(request.getBio());
        // Note: headshotUrl stored in media collection
        if (request.getRequestedRate() != null) profile.setMinimumDealValue(request.getRequestedRate().doubleValue());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) profile.setGender(request.getGender());
    }

    private AthleteProfileResponse mapProfileToResponse(AthleteProfile profile) {
        User user = profile.getUser();
        
        List<SocialAccountResponse> socialResponses = profile.getSocialAccounts().stream()
                .map(this::mapSocialToResponse)
                .collect(Collectors.toList());

        List<AthleteMediaResponse> mediaResponses = profile.getMedia().stream()
                .map(this::mapMediaToResponse)
                .collect(Collectors.toList());

        // Find headshot from media
        String headshotUrl = profile.getMedia().stream()
                .filter(m -> m.getIsPrimary() != null && m.getIsPrimary())
                .map(AthleteMedia::getUrl)
                .findFirst()
                .orElse(null);

        return AthleteProfileResponse.builder()
                .id(profile.getId())
                .userId(user.getId())
                .clerkId(user.getClerkId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .sport(profile.getSport())
                .position(profile.getPosition())
                .schoolName(profile.getSchool())
                .conference(profile.getConference())
                .classYear(profile.getClassYear())
                .jerseyNumber(profile.getJerseyNumber())
                .height(null) // Not in current entity
                .weight(null) // Not in current entity
                .city(profile.getHometown())
                .state(profile.getHomeState())
                .hometown(profile.getHometown())
                .bio(profile.getBio())
                .headshotUrl(headshotUrl)
                .requestedRate(profile.getMinimumDealValue() != null ? 
                    java.math.BigDecimal.valueOf(profile.getMinimumDealValue()) : null)
                .nilReady(profile.getIsAcceptingDeals())
                .completenessScore(profile.getProfileCompletenessScore())
                .isVerified(profile.getIsVerified())
                .status(profile.getIsActive() ? "ACTIVE" : "INACTIVE")
                .socialAccounts(socialResponses)
                .media(mediaResponses)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private SocialAccountResponse mapSocialToResponse(AthleteSocialAccount social) {
        return SocialAccountResponse.builder()
                .id(social.getId())
                .platform(social.getPlatform())
                .handle(social.getHandle())
                .profileUrl(social.getProfileUrl())
                .isVerified(social.getIsVerified())
                .isConnected(social.getIsConnected())
                .followerCount(social.getFollowers())
                .engagementRate(social.getEngagementRate())
                .lastSyncedAt(social.getUpdatedAt()) // Use updatedAt as proxy for last sync
                .createdAt(social.getCreatedAt())
                .build();
    }

    private AthleteMediaResponse mapMediaToResponse(AthleteMedia media) {
        return AthleteMediaResponse.builder()
                .id(media.getId())
                .mediaType(media.getMediaType())
                .url(media.getUrl())
                .thumbnailUrl(media.getThumbnailUrl())
                .title(media.getTitle())
                .description(media.getDescription())
                .isPrimary(media.getIsPrimary())
                .displayOrder(media.getDisplayOrder())
                .createdAt(media.getCreatedAt())
                .build();
    }

    /**
     * Calculate profile completeness score (0-100).
     * 
     * Scoring breakdown:
     * - Required fields (40%): sport, school, position, name
     * - Social accounts connected (25%): at least 1 platform
     * - Media uploaded (15%): at least 1 headshot
     * - Preferences set (20%): bio, rate, etc.
     */
    private Integer calculateCompleteness(AthleteProfile profile) {
        int score = 0;
        User user = profile.getUser();

        // Required fields (40 points)
        if (profile.getSport() != null) score += 10;
        if (profile.getSchool() != null && !profile.getSchool().isEmpty()) score += 10;
        if (profile.getPosition() != null && !profile.getPosition().isEmpty()) score += 10;
        if (user.getFirstName() != null && user.getLastName() != null) score += 10;

        // Social accounts (25 points)
        int socialCount = profile.getSocialAccounts().size();
        if (socialCount >= 1) score += 10;
        if (socialCount >= 2) score += 10;
        if (socialCount >= 3) score += 5;

        // Media (15 points)
        boolean hasHeadshot = profile.getMedia().stream()
                .anyMatch(m -> m.getIsPrimary() != null && m.getIsPrimary());
        if (hasHeadshot) score += 10;
        if (!profile.getMedia().isEmpty()) score += 5;

        // Preferences/Additional info (20 points)
        if (profile.getBio() != null && profile.getBio().length() > 20) score += 5;
        if (profile.getMinimumDealValue() != null) score += 5;
        if (profile.getConference() != null) score += 5;
        if (profile.getClassYear() != null && !profile.getClassYear().isEmpty()) score += 5;

        return Math.min(score, 100);
    }
}

