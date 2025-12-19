package com.nil.repository;

import com.nil.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Organization entity operations.
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    /**
     * Find organization by name.
     */
    Optional<Organization> findByName(String name);

    /**
     * Find organizations by type (BRAND, AGENCY).
     */
    List<Organization> findByType(String type);

    /**
     * Find active organizations.
     */
    List<Organization> findByStatus(String status);

    /**
     * Find organizations by industry.
     */
    List<Organization> findByIndustry(String industry);

    /**
     * Check if organization exists by name.
     */
    boolean existsByName(String name);
}

