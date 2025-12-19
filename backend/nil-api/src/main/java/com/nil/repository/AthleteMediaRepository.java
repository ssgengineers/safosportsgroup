package com.nil.repository;

import com.nil.entity.AthleteMedia;
import com.nil.entity.enums.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for AthleteMedia entity operations.
 */
@Repository
public interface AthleteMediaRepository extends JpaRepository<AthleteMedia, UUID> {

    /**
     * Find all media for an athlete.
     */
    List<AthleteMedia> findByAthleteProfileIdOrderByDisplayOrderAsc(UUID athleteProfileId);

    /**
     * Find media by type for athlete.
     */
    List<AthleteMedia> findByAthleteProfileIdAndMediaType(UUID athleteProfileId, MediaType mediaType);

    /**
     * Find primary media for athlete.
     */
    Optional<AthleteMedia> findByAthleteProfileIdAndIsPrimary(UUID athleteProfileId, Boolean isPrimary);

    /**
     * Find public media for athlete.
     */
    List<AthleteMedia> findByAthleteProfileIdAndIsPublicOrderByDisplayOrderAsc(UUID athleteProfileId, Boolean isPublic);

    /**
     * Count media for athlete.
     */
    long countByAthleteProfileId(UUID athleteProfileId);

    /**
     * Count media by type for athlete.
     */
    long countByAthleteProfileIdAndMediaType(UUID athleteProfileId, MediaType mediaType);

    /**
     * Delete all media for athlete.
     */
    void deleteByAthleteProfileId(UUID athleteProfileId);

    /**
     * Find media by storage key (for S3 operations).
     */
    Optional<AthleteMedia> findByStorageKey(String storageKey);
}

