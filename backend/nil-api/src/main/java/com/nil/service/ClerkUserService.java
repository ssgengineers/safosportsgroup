package com.nil.service;

import com.nil.entity.Role;
import com.nil.entity.User;
import com.nil.entity.enums.RoleType;
import com.nil.repository.RoleRepository;
import com.nil.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public ClerkUserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
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
            
            log.debug("Updated existing user: {} ({})", clerkId, email);
            return userRepository.save(user);
        }

        // Create new user
        User newUser = new User();
        newUser.setClerkId(clerkId);
        newUser.setEmail(email);
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setStatus("ACTIVE");

        // Assign default ATHLETE role (most common user type)
        Role athleteRole = roleRepository.findByName(RoleType.ATHLETE)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleType.ATHLETE);
                    role.setDescription("Athlete user role");
                    return roleRepository.save(role);
                });

        newUser.getRoles().add(athleteRole);

        User savedUser = userRepository.save(newUser);
        log.info("Created new user from Clerk: {} ({})", clerkId, email);
        
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
}
