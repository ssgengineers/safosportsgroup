package com.nil.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nil.entity.*;
import com.nil.entity.enums.RoleType;
import com.nil.entity.enums.Sport;
import com.nil.entity.enums.SocialPlatform;
import com.nil.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Service for syncing Clerk users with local database.
 * Creates or updates user records based on Clerk JWT claims.
 */
@Service
public class ClerkUserService {

    private static final Logger log = LoggerFactory.getLogger(ClerkUserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AthleteIntakeRequestRepository athleteIntakeRepo;
    private final BrandIntakeRequestRepository brandIntakeRepo;
    private final AthleteProfileRepository athleteProfileRepo;
    private final BrandProfileRepository brandProfileRepo;
    private final String clerkSecretKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private static final String CLERK_API_BASE = "https://api.clerk.com/v1";

    public ClerkUserService(
            UserRepository userRepository, 
            RoleRepository roleRepository,
            AthleteIntakeRequestRepository athleteIntakeRepo,
            BrandIntakeRequestRepository brandIntakeRepo,
            AthleteProfileRepository athleteProfileRepo,
            BrandProfileRepository brandProfileRepo,
            @Value("${clerk.secret-key:}") String clerkSecretKey) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.athleteIntakeRepo = athleteIntakeRepo;
        this.brandIntakeRepo = brandIntakeRepo;
        this.athleteProfileRepo = athleteProfileRepo;
        this.brandProfileRepo = brandProfileRepo;
        this.clerkSecretKey = clerkSecretKey;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Sync a Clerk user to the local database.
     * Creates a new user if they don't exist, or updates existing user info.
     *
     * @param clerkId The Clerk user ID (sub claim from JWT)
     * @param email User's email address
     * @param firstName User's first name
     * @param lastName User's last name
     * @return The synced User entity
     */
    @Transactional
    public User syncClerkUser(String clerkId, String email, String firstName, String lastName) {
        // Validate required fields
        if (clerkId == null || clerkId.isEmpty()) {
            throw new IllegalArgumentException("clerkId cannot be null or empty");
        }
        
        if (email == null || email.isEmpty()) {
            log.error("Cannot sync user {}: email is required but was null or empty", clerkId);
            throw new IllegalArgumentException("email cannot be null or empty when syncing user");
        }
        
        Optional<User> existingUser = userRepository.findByClerkId(clerkId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Update email if changed
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
            }
            
            // Update name if changed
            if (firstName != null) {
                user.setFirstName(firstName);
            }
            if (lastName != null) {
                user.setLastName(lastName);
            }
            
            User savedUser = userRepository.save(user);
            log.debug("Updated existing user: {} ({})", clerkId, email);
            
            // Check if user has a profile - if not, try to create from intake request
            // This handles cases where user signed up before intake was approved
            boolean hasAthleteProfile = athleteProfileRepo.existsByUserId(savedUser.getId());
            boolean hasBrandProfile = brandProfileRepo.existsByUserId(savedUser.getId());
            
            if (!hasAthleteProfile && !hasBrandProfile) {
                log.info("Existing user {} has no profile. Checking for intake requests...", clerkId);
                processIntakeRequests(savedUser, email);
            }
            
            return savedUser;
        }

        // Create new user
        User newUser = new User();
        newUser.setClerkId(clerkId);
        newUser.setEmail(email);
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setStatus("ACTIVE");

        User savedUser = userRepository.save(newUser);
        log.info("Created new user from Clerk: {} ({})", clerkId, email);
        
        // Check for matching intake requests and create profile
        processIntakeRequests(savedUser, email);
        
        return savedUser;
    }

    /**
     * Get a user by their Clerk user ID.
     *
     * @param clerkId The Clerk user ID
     * @return Optional containing the user if found
     */
    public Optional<User> getUserByClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId);
    }

    /**
     * Assign a role to a user.
     *
     * @param clerkId The Clerk user ID
     * @param roleType The role to assign
     * @return The updated user
     */
    @Transactional
    public User assignRole(String clerkId, RoleType roleType) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new RuntimeException("User not found: " + clerkId));

        Role role = roleRepository.findByName(roleType)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleType);
                    newRole.setDescription(roleType.name() + " role");
                    return roleRepository.save(newRole);
                });

        user.getRoles().add(role);
        log.info("Assigned role {} to user {}", roleType, clerkId);
        
        return userRepository.save(user);
    }

    /**
     * Process intake requests for a user.
     * Checks for approved intake requests matching the email and creates profiles.
     * Can be called for both new and existing users who don't have profiles yet.
     * 
     * @param user The user (new or existing)
     * @param email The user's email address
     */
    @Transactional
    public void processIntakeRequests(User user, String email) {
        log.info("Processing intake requests for user: {} with email: {}", user.getClerkId(), email);
        
        // Check for invited/approved athlete intake request
        Optional<AthleteIntakeRequest> athleteIntake = athleteIntakeRepo.findByEmail(email);
        if (athleteIntake.isPresent()) {
            AthleteIntakeRequest intake = athleteIntake.get();
            String status = intake.getStatus();
            log.info("Found athlete intake request for email: {}, status: {}", email, status);
            
            if ("INVITED".equalsIgnoreCase(status) || "APPROVED".equalsIgnoreCase(status)) {
                try {
                    log.info("Creating athlete profile for user: {} from intake request: {}", user.getClerkId(), intake.getId());
                    createAthleteProfileFromIntake(user, intake);
                    assignRole(user.getClerkId(), RoleType.ATHLETE);
                    
                    // Update intake status to ACCEPTED
                    intake.setStatus("ACCEPTED");
                    athleteIntakeRepo.save(intake);
                    
                    log.info("Successfully created athlete profile from intake request for user: {} ({})", user.getClerkId(), email);
                } catch (Exception e) {
                    log.error("Failed to create athlete profile from intake for user {}: {}", user.getClerkId(), e.getMessage(), e);
                }
                return; // Don't check brand if athlete found
            } else {
                log.debug("Athlete intake request found but status is '{}', not APPROVED or INVITED. Skipping profile creation.", status);
            }
        } else {
            log.debug("No athlete intake request found for email: {}", email);
        }

        // Check for invited/approved brand intake request
        Optional<BrandIntakeRequest> brandIntake = brandIntakeRepo.findByEmail(email);
        if (brandIntake.isPresent()) {
            BrandIntakeRequest intake = brandIntake.get();
            String status = intake.getStatus();
            log.info("Found brand intake request for email: {}, status: {}", email, status);
            
            if ("INVITED".equalsIgnoreCase(status) || "APPROVED".equalsIgnoreCase(status)) {
                try {
                    log.info("Creating brand profile for user: {} from intake request: {}", user.getClerkId(), intake.getId());
                    createBrandProfileFromIntake(user, intake);
                    assignRole(user.getClerkId(), RoleType.BRAND);
                    
                    // Update intake status to ACCEPTED
                    intake.setStatus("ACCEPTED");
                    brandIntakeRepo.save(intake);
                    
                    log.info("Successfully created brand profile from intake request for user: {} ({})", user.getClerkId(), email);
                } catch (Exception e) {
                    log.error("Failed to create brand profile from intake for user {}: {}", user.getClerkId(), e.getMessage(), e);
                }
                return;
            } else {
                log.debug("Brand intake request found but status is '{}', not APPROVED or INVITED. Skipping profile creation.", status);
            }
        } else {
            log.debug("No brand intake request found for email: {}", email);
        }

        // No matching intake request - assign default ATHLETE role
        log.debug("No matching intake request found for {}. Assigning default ATHLETE role.", email);
        assignRole(user.getClerkId(), RoleType.ATHLETE);
    }

    /**
     * Create an AthleteProfile from an AthleteIntakeRequest.
     */
    @Transactional
    private void createAthleteProfileFromIntake(User user, AthleteIntakeRequest intake) {
        // Check if profile already exists
        if (athleteProfileRepo.existsByUserId(user.getId())) {
            log.debug("Athlete profile already exists for user: {}", user.getClerkId());
            return;
        }

        AthleteProfile profile = new AthleteProfile();
        profile.setUser(user);
        
        // Map basic info
        if (intake.getBio() != null) {
            profile.setBio(intake.getBio());
        }
        
        // Map sport (try to convert string to enum)
        if (intake.getSport() != null) {
            try {
                profile.setSport(Sport.fromString(intake.getSport()));
            } catch (Exception e) {
                log.warn("Could not parse sport '{}' for user {}", intake.getSport(), user.getClerkId());
            }
        }
        
        // Map position
        if (intake.getPosition() != null) {
            profile.setPosition(intake.getPosition());
        }
        
        // Map school
        if (intake.getSchool() != null) {
            profile.setSchool(intake.getSchool());
        }
        
        // Map location to hometown
        if (intake.getLocation() != null) {
            profile.setHometown(intake.getLocation());
        }
        
        // Map date of birth
        if (intake.getDateOfBirth() != null) {
            try {
                profile.setDateOfBirth(LocalDate.parse(intake.getDateOfBirth(), DateTimeFormatter.ISO_DATE));
            } catch (Exception e) {
                log.warn("Could not parse date of birth '{}' for user {}", intake.getDateOfBirth(), user.getClerkId());
            }
        }
        
        // Add primary social account if provided
        if (intake.getPrimarySocialPlatform() != null && intake.getPrimarySocialHandle() != null) {
            try {
                AthleteSocialAccount social = new AthleteSocialAccount();
                social.setAthleteProfile(profile);
                // Try to convert platform string to enum
                SocialPlatform platform = convertToSocialPlatform(intake.getPrimarySocialPlatform());
                if (platform != null) {
                    social.setPlatform(platform);
                    social.setHandle(intake.getPrimarySocialHandle());
                    profile.getSocialAccounts().add(social);
                }
            } catch (Exception e) {
                log.warn("Could not add social account for user {}: {}", user.getClerkId(), e.getMessage());
            }
        }
        
        // Set defaults
        profile.setIsActive(true);
        profile.setIsAcceptingDeals(true);
        profile.setProfileCompletenessScore(calculateInitialCompleteness(profile));
        
        athleteProfileRepo.save(profile);
        log.info("Created athlete profile from intake request for user: {}", user.getClerkId());
    }

    /**
     * Calculate initial profile completeness score.
     */
    private Integer calculateInitialCompleteness(AthleteProfile profile) {
        int score = 0;
        if (profile.getSport() != null) score += 15;
        if (profile.getPosition() != null) score += 10;
        if (profile.getSchool() != null) score += 15;
        if (profile.getBio() != null && !profile.getBio().isEmpty()) score += 20;
        if (profile.getHometown() != null) score += 10;
        if (profile.getDateOfBirth() != null) score += 10;
        if (profile.getSocialAccounts() != null && !profile.getSocialAccounts().isEmpty()) score += 20;
        return Math.min(score, 100);
    }

    /**
     * Create a BrandProfile from a BrandIntakeRequest.
     */
    @Transactional
    private void createBrandProfileFromIntake(User user, BrandIntakeRequest intake) {
        // Check if profile already exists
        if (brandProfileRepo.existsByUserId(user.getId())) {
            log.debug("Brand profile already exists for user: {}", user.getClerkId());
            return;
        }

        BrandProfile profile = new BrandProfile();
        profile.setUser(user);
        
        // Map company info
        if (intake.getCompany() != null) {
            profile.setCompanyName(intake.getCompany());
        }
        if (intake.getIndustry() != null) {
            profile.setIndustry(intake.getIndustry());
        }
        if (intake.getCompanySize() != null) {
            profile.setCompanySize(intake.getCompanySize());
        }
        if (intake.getWebsite() != null) {
            profile.setWebsite(intake.getWebsite());
        }
        if (intake.getDescription() != null) {
            profile.setDescription(intake.getDescription());
        }
        
        // Map contact info
        if (intake.getContactFirstName() != null) {
            profile.setContactFirstName(intake.getContactFirstName());
        }
        if (intake.getContactLastName() != null) {
            profile.setContactLastName(intake.getContactLastName());
        }
        if (intake.getContactTitle() != null) {
            profile.setContactTitle(intake.getContactTitle());
        }
        if (intake.getEmail() != null) {
            profile.setContactEmail(intake.getEmail());
        }
        if (intake.getPhone() != null) {
            profile.setContactPhone(intake.getPhone());
        }
        
        // Map marketing info
        if (intake.getTargetAudience() != null) {
            profile.setTargetAudience(intake.getTargetAudience());
        }
        if (intake.getGoals() != null) {
            profile.setMarketingGoals(intake.getGoals());
        }
        if (intake.getBudget() != null) {
            profile.setBudgetRange(intake.getBudget());
        }
        if (intake.getTimeline() != null) {
            profile.setPreferredTimeline(intake.getTimeline());
        }
        if (intake.getAthletePreferences() != null) {
            profile.setAthletePreferences(intake.getAthletePreferences());
        }
        
        // Set defaults
        profile.setIsActive(true);
        profile.setIsAcceptingApplications(true);
        profile.setProfileCompletenessScore(calculateInitialBrandCompleteness(profile));
        
        brandProfileRepo.save(profile);
        log.info("Created brand profile from intake request for user: {}", user.getClerkId());
    }

    /**
     * Calculate initial brand profile completeness score.
     */
    private Integer calculateInitialBrandCompleteness(BrandProfile profile) {
        int score = 0;
        if (profile.getCompanyName() != null && !profile.getCompanyName().isEmpty()) score += 15;
        if (profile.getIndustry() != null && !profile.getIndustry().isEmpty()) score += 15;
        if (profile.getWebsite() != null && !profile.getWebsite().isEmpty()) score += 10;
        if (profile.getDescription() != null && !profile.getDescription().isEmpty()) score += 15;
        if (profile.getContactEmail() != null && !profile.getContactEmail().isEmpty()) score += 10;
        if (profile.getContactPhone() != null && !profile.getContactPhone().isEmpty()) score += 10;
        if (profile.getTargetAudience() != null && !profile.getTargetAudience().isEmpty()) score += 10;
        if (profile.getMarketingGoals() != null && !profile.getMarketingGoals().isEmpty()) score += 10;
        if (profile.getBudgetRange() != null && !profile.getBudgetRange().isEmpty()) score += 5;
        return Math.min(score, 100);
    }

    /**
     * Convert platform string to SocialPlatform enum.
     */
    private SocialPlatform convertToSocialPlatform(String platform) {
        if (platform == null) return null;
        return SocialPlatform.fromString(platform);
    }

    /**
     * Fetch user details from Clerk API when email is missing from JWT.
     * 
     * @param clerkId The Clerk user ID
     * @return UserInfo containing email, firstName, lastName, or null if fetch fails
     */
    public UserInfo fetchUserFromClerkApi(String clerkId) {
        if (clerkSecretKey == null || clerkSecretKey.isEmpty()) {
            log.warn("Clerk secret key not configured. Cannot fetch user from API.");
            return null;
        }

        try {
            String url = CLERK_API_BASE + "/users/" + clerkId;
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + clerkSecretKey)
                    .header("Content-Type", "application/json")
                    .GET()
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode userData = objectMapper.readTree(response.body());
                
                String email = null;
                String firstName = null;
                String lastName = null;
                
                // Get primary email address
                JsonNode emailAddresses = userData.get("email_addresses");
                if (emailAddresses != null && emailAddresses.isArray() && emailAddresses.size() > 0) {
                    for (JsonNode emailAddr : emailAddresses) {
                        if (emailAddr.get("id").asText().equals(userData.get("primary_email_address_id").asText())) {
                            email = emailAddr.get("email_address").asText();
                            break;
                        }
                    }
                    // If no primary found, use first one
                    if (email == null && emailAddresses.size() > 0) {
                        email = emailAddresses.get(0).get("email_address").asText();
                    }
                }
                
                // Get first and last name
                firstName = userData.has("first_name") ? userData.get("first_name").asText(null) : null;
                lastName = userData.has("last_name") ? userData.get("last_name").asText(null) : null;
                
                log.info("Fetched user from Clerk API: {} - email: {}", clerkId, email);
                return new UserInfo(email, firstName, lastName);
            } else {
                log.warn("Failed to fetch user from Clerk API. Status: {}, Response: {}", response.statusCode(), response.body());
                return null;
            }
        } catch (Exception e) {
            log.error("Error fetching user from Clerk API for {}: {}", clerkId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Delete a user from Clerk.
     * 
     * @param clerkId The Clerk user ID to delete
     * @return true if successful, false otherwise
     */
    public boolean deleteUserFromClerk(String clerkId) {
        if (clerkSecretKey == null || clerkSecretKey.isEmpty()) {
            log.warn("Clerk secret key not configured. Skipping deletion from Clerk for: {}", clerkId);
            return false;
        }

        if (clerkId == null || clerkId.isEmpty()) {
            log.warn("Cannot delete user from Clerk: clerkId is null or empty");
            return false;
        }

        try {
            String url = CLERK_API_BASE + "/users/" + clerkId;
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + clerkSecretKey)
                    .header("Content-Type", "application/json")
                    .DELETE()
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 204) {
                log.info("Successfully deleted user from Clerk: {}", clerkId);
                return true;
            } else {
                log.error("Failed to delete user from Clerk. Status: {}, Response: {}", 
                        response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("Error deleting user from Clerk for {}: {}", clerkId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Simple data class to hold user info from Clerk API.
     */
    public static class UserInfo {
        public final String email;
        public final String firstName;
        public final String lastName;

        public UserInfo(String email, String firstName, String lastName) {
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
        }
    }
}
