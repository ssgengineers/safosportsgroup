package com.nil.repository;

import com.nil.entity.AthleteProfile;
import com.nil.entity.enums.Conference;
import com.nil.entity.enums.Sport;
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
 * Repository for AthleteProfile entity operations.
 */
@Repository
public interface AthleteProfileRepository extends JpaRepository<AthleteProfile, UUID> {

    /**
     * Find athlete profile by user ID.
     */
    Optional<AthleteProfile> findByUserId(UUID userId);

    /**
     * Check if profile exists for user.
     */
    boolean existsByUserId(UUID userId);

    /**
     * Find athlete profile by user's Clerk ID.
     */
    @Query("SELECT ap FROM AthleteProfile ap WHERE ap.user.clerkId = :clerkId")
    Optional<AthleteProfile> findByUserClerkId(@Param("clerkId") String clerkId);

    /**
     * Find athletes by sport.
     */
    List<AthleteProfile> findBySport(Sport sport);

    /**
     * Find athletes by school.
     */
    List<AthleteProfile> findBySchool(String school);

    /**
     * Find athletes by conference.
     */
    List<AthleteProfile> findByConference(Conference conference);

    /**
     * Find active athletes accepting deals.
     */
    List<AthleteProfile> findByIsActiveAndIsAcceptingDeals(Boolean isActive, Boolean isAcceptingDeals);

    /**
     * Find athletes by sport with pagination.
     */
    Page<AthleteProfile> findBySport(Sport sport, Pageable pageable);

    /**
     * Find athletes by sport and conference.
     */
    List<AthleteProfile> findBySportAndConference(Sport sport, Conference conference);

    /**
     * Search athletes by school name (case-insensitive).
     */
    @Query("SELECT ap FROM AthleteProfile ap WHERE LOWER(ap.school) LIKE LOWER(CONCAT('%', :school, '%'))")
    List<AthleteProfile> searchBySchool(@Param("school") String school);

    /**
     * Find athletes with minimum profile completeness score.
     */
    List<AthleteProfile> findByProfileCompletenessScoreGreaterThanEqual(Integer minScore);

    /**
     * Find verified athletes.
     */
    List<AthleteProfile> findByIsVerified(Boolean isVerified);

    /**
     * Count athletes by sport.
     */
    long countBySport(Sport sport);

    /**
     * Count athletes by school.
     */
    long countBySchool(String school);

    /**
     * Complex search query for matching.
     */
    @Query("SELECT ap FROM AthleteProfile ap " +
           "WHERE ap.isActive = true " +
           "AND ap.isAcceptingDeals = true " +
           "AND (:sport IS NULL OR ap.sport = :sport) " +
           "AND (:conference IS NULL OR ap.conference = :conference) " +
           "AND (:school IS NULL OR ap.school = :school) " +
           "AND (:minCompleteness IS NULL OR ap.profileCompletenessScore >= :minCompleteness)")
    Page<AthleteProfile> findMatchCandidates(
            @Param("sport") Sport sport,
            @Param("conference") Conference conference,
            @Param("school") String school,
            @Param("minCompleteness") Integer minCompleteness,
            Pageable pageable
    );
}

