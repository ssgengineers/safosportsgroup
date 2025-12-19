package com.nil.repository;

import com.nil.entity.AthletePreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for AthletePreferences entity operations.
 */
@Repository
public interface AthletePreferencesRepository extends JpaRepository<AthletePreferences, UUID> {

    /**
     * Find preferences by athlete profile ID.
     */
    Optional<AthletePreferences> findByAthleteProfileId(UUID athleteProfileId);

    /**
     * Check if preferences exist for athlete.
     */
    boolean existsByAthleteProfileId(UUID athleteProfileId);
}

