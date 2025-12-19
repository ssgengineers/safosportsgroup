package com.nil.repository;

import com.nil.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by Clerk ID (primary lookup for auth).
     */
    Optional<User> findByClerkId(String clerkId);

    /**
     * Find user by email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by Clerk ID.
     */
    boolean existsByClerkId(String clerkId);

    /**
     * Check if user exists by email.
     */
    boolean existsByEmail(String email);

    /**
     * Find users by role name.
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    /**
     * Find users by organization.
     */
    List<User> findByOrganizationId(UUID organizationId);

    /**
     * Find active users.
     */
    List<User> findByStatus(String status);
}

