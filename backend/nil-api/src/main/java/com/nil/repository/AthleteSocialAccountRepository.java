package com.nil.repository;

import com.nil.entity.AthleteSocialAccount;
import com.nil.entity.enums.SocialPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for AthleteSocialAccount entity operations.
 */
@Repository
public interface AthleteSocialAccountRepository extends JpaRepository<AthleteSocialAccount, UUID> {

    /**
     * Find all social accounts for an athlete.
     */
    List<AthleteSocialAccount> findByAthleteProfileId(UUID athleteProfileId);

    /**
     * Find specific platform account for athlete.
     */
    Optional<AthleteSocialAccount> findByAthleteProfileIdAndPlatform(UUID athleteProfileId, SocialPlatform platform);

    /**
     * Find accounts by platform.
     */
    List<AthleteSocialAccount> findByPlatform(SocialPlatform platform);

    /**
     * Find connected accounts (with OAuth).
     */
    List<AthleteSocialAccount> findByAthleteProfileIdAndIsConnected(UUID athleteProfileId, Boolean isConnected);

    /**
     * Find accounts with high engagement.
     */
    @Query("SELECT sa FROM AthleteSocialAccount sa WHERE sa.engagementRate >= :minRate")
    List<AthleteSocialAccount> findByMinEngagementRate(@Param("minRate") Double minRate);

    /**
     * Find accounts with minimum followers.
     */
    @Query("SELECT sa FROM AthleteSocialAccount sa WHERE sa.followers >= :minFollowers")
    List<AthleteSocialAccount> findByMinFollowers(@Param("minFollowers") Long minFollowers);

    /**
     * Check if athlete has a specific platform.
     */
    boolean existsByAthleteProfileIdAndPlatform(UUID athleteProfileId, SocialPlatform platform);

    /**
     * Delete all social accounts for an athlete.
     */
    void deleteByAthleteProfileId(UUID athleteProfileId);
}

