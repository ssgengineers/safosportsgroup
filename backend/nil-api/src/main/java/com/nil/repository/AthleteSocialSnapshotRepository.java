package com.nil.repository;

import com.nil.entity.AthleteSocialSnapshot;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for AthleteSocialSnapshot entity operations.
 */
@Repository
public interface AthleteSocialSnapshotRepository extends JpaRepository<AthleteSocialSnapshot, UUID> {

    /**
     * Find all snapshots for a social account.
     */
    List<AthleteSocialSnapshot> findBySocialAccountIdOrderBySnapshotTimestampDesc(UUID socialAccountId);

    /**
     * Find latest snapshot for a social account.
     */
    Optional<AthleteSocialSnapshot> findFirstBySocialAccountIdOrderBySnapshotTimestampDesc(UUID socialAccountId);

    /**
     * Find snapshots within a date range.
     */
    @Query("SELECT s FROM AthleteSocialSnapshot s " +
           "WHERE s.socialAccount.id = :accountId " +
           "AND s.snapshotTimestamp BETWEEN :startDate AND :endDate " +
           "ORDER BY s.snapshotTimestamp DESC")
    List<AthleteSocialSnapshot> findByAccountAndDateRange(
            @Param("accountId") UUID accountId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Find snapshot closest to a specific timestamp (for deal reference).
     */
    @Query("SELECT s FROM AthleteSocialSnapshot s " +
           "WHERE s.socialAccount.id = :accountId " +
           "AND s.snapshotTimestamp <= :timestamp " +
           "ORDER BY s.snapshotTimestamp DESC")
    List<AthleteSocialSnapshot> findClosestSnapshot(
            @Param("accountId") UUID accountId,
            @Param("timestamp") Instant timestamp,
            Pageable pageable
    );

    /**
     * Get latest snapshots for all accounts of an athlete.
     */
    @Query("SELECT s FROM AthleteSocialSnapshot s " +
           "WHERE s.socialAccount.athleteProfile.id = :athleteId " +
           "AND s.snapshotTimestamp = (" +
           "  SELECT MAX(s2.snapshotTimestamp) FROM AthleteSocialSnapshot s2 " +
           "  WHERE s2.socialAccount.id = s.socialAccount.id" +
           ")")
    List<AthleteSocialSnapshot> findLatestSnapshotsForAthlete(@Param("athleteId") UUID athleteId);

    /**
     * Delete old snapshots (for cleanup).
     */
    void deleteBySocialAccountIdAndSnapshotTimestampBefore(UUID socialAccountId, Instant before);
}

