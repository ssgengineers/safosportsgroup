package com.nil.repository;

import com.nil.entity.Role;
import com.nil.entity.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Role entity operations.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    /**
     * Find role by name.
     */
    Optional<Role> findByName(RoleType name);

    /**
     * Check if role exists by name.
     */
    boolean existsByName(RoleType name);
}

