package com.nil.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * User entity - synced from Clerk authentication.
 * This is the core identity table for all platform users.
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_clerk_id", columnList = "clerk_id", unique = true),
    @Index(name = "idx_user_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    /**
     * Clerk user ID - primary external identifier
     */
    @Column(name = "clerk_id", nullable = false, unique = true, length = 100)
    private String clerkId;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "email_verified")
    private Boolean emailVerified;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "phone_verified")
    private Boolean phoneVerified;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "last_sign_in_at")
    private Instant lastSignInAt;

    /**
     * User's roles (ATHLETE, BRAND, ADMIN, etc.)
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    /**
     * Organization the user belongs to (for brands/agencies)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    /**
     * One-to-one relationship with athlete profile (if user is an athlete)
     */
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AthleteProfile athleteProfile;

    // Helper methods
    public String getFullName() {
        if (firstName == null && lastName == null) return null;
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }

    public boolean hasRole(String roleName) {
        return roles.stream().anyMatch(r -> r.getName().name().equalsIgnoreCase(roleName));
    }
}

