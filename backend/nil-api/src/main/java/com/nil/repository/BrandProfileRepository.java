package com.nil.repository;

import com.nil.entity.BrandProfile;
import com.nil.entity.enums.BrandCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for BrandProfile entity operations.
 */
@Repository
public interface BrandProfileRepository extends JpaRepository<BrandProfile, UUID> {

    /**
     * Find brand profile by user ID.
     */
    Optional<BrandProfile> findByUserId(UUID userId);

    /**
     * Check if profile exists for user.
     */
    boolean existsByUserId(UUID userId);

    /**
     * Find brand profile by user's Clerk ID.
     */
    @Query("SELECT bp FROM BrandProfile bp WHERE bp.user.clerkId = :clerkId")
    Optional<BrandProfile> findByUserClerkId(@Param("clerkId") String clerkId);

    /**
     * Find brands by industry.
     */
    List<BrandProfile> findByIndustry(String industry);

    /**
     * Find brands by brand category.
     */
    List<BrandProfile> findByBrandCategory(BrandCategory brandCategory);

    /**
     * Find active brands accepting applications.
     */
    List<BrandProfile> findByIsActiveAndIsAcceptingApplications(Boolean isActive, Boolean isAcceptingApplications);

    /**
     * Find brands by industry with pagination.
     */
    Page<BrandProfile> findByIndustry(String industry, Pageable pageable);

    /**
     * Search brands by company name (case-insensitive).
     */
    @Query("SELECT bp FROM BrandProfile bp WHERE LOWER(bp.companyName) LIKE LOWER(CONCAT('%', :companyName, '%'))")
    List<BrandProfile> searchByCompanyName(@Param("companyName") String companyName);

    /**
     * Find brands with minimum profile completeness score.
     */
    List<BrandProfile> findByProfileCompletenessScoreGreaterThanEqual(Integer minScore);

    /**
     * Find verified brands.
     */
    List<BrandProfile> findByIsVerified(Boolean isVerified);
}

