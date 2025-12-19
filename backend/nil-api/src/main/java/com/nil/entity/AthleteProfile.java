package com.nil.entity;

import com.nil.entity.enums.Conference;
import com.nil.entity.enums.Sport;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Athlete Profile - Core athlete data for matching and NIL deals.
 * This is the primary intake entity capturing all athlete information.
 */
@Entity
@Table(name = "athlete_profiles", indexes = {
    @Index(name = "idx_athlete_user", columnList = "user_id"),
    @Index(name = "idx_athlete_school", columnList = "school"),
    @Index(name = "idx_athlete_sport", columnList = "sport"),
    @Index(name = "idx_athlete_conference", columnList = "conference")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteProfile extends BaseEntity {

    // ==================== User Relationship ====================
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ==================== Identity & Demographics ====================
    
    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "ethnicity", length = 50)
    private String ethnicity; // Optional

    @Column(name = "hometown", length = 100)
    private String hometown;

    @Column(name = "home_state", length = 50)
    private String homeState;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    // ==================== Athletic Background ====================
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sport", length = 50)
    private Sport sport;

    @Column(name = "position", length = 50)
    private String position;

    @Column(name = "jersey_number", length = 10)
    private String jerseyNumber;

    @Column(name = "school", length = 200)
    private String school;

    @Enumerated(EnumType.STRING)
    @Column(name = "conference", length = 50)
    private Conference conference;

    @Column(name = "class_year", length = 20)
    private String classYear; // Freshman, Sophomore, Junior, Senior, Graduate

    @Column(name = "eligibility_year")
    private Integer eligibilityYear; // Years of eligibility remaining

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "major", length = 100)
    private String major;

    // ==================== Performance & Recognition ====================
    
    @Column(name = "team_ranking")
    private Integer teamRanking;

    @Column(name = "stats_summary", columnDefinition = "TEXT")
    private String statsSummary; // JSON or formatted string

    @Column(name = "awards", columnDefinition = "TEXT")
    private String awards; // JSON array of awards

    @Column(name = "achievements", columnDefinition = "TEXT")
    private String achievements;

    // ==================== NIL & Contract Information ====================
    
    @Column(name = "has_existing_deals")
    @Builder.Default
    private Boolean hasExistingDeals = false;

    @Column(name = "existing_deals_summary", columnDefinition = "TEXT")
    private String existingDealsSummary;

    @Column(name = "minimum_deal_value")
    private Double minimumDealValue; // Minimum $ they'll accept

    @Column(name = "preferred_deal_types", columnDefinition = "TEXT")
    private String preferredDealTypes; // JSON array

    @Column(name = "exclusivity_restrictions", columnDefinition = "TEXT")
    private String exclusivityRestrictions;

    // ==================== Contact Information ====================
    
    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_person_name", length = 100)
    private String contactPersonName; // If agent/parent

    @Column(name = "contact_person_type", length = 50)
    private String contactPersonType; // SELF, PARENT, AGENT

    // ==================== Profile Status ====================
    
    @Column(name = "profile_completeness_score")
    @Builder.Default
    private Integer profileCompletenessScore = 0;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_accepting_deals")
    @Builder.Default
    private Boolean isAcceptingDeals = true;

    // ==================== Relationships ====================
    
    @OneToOne(mappedBy = "athleteProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AthletePreferences preferences;

    @OneToMany(mappedBy = "athleteProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AthleteSocialAccount> socialAccounts = new ArrayList<>();

    @OneToMany(mappedBy = "athleteProfile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AthleteMedia> media = new ArrayList<>();

    // ==================== Helper Methods ====================
    
    public int getAge() {
        if (dateOfBirth == null) return 0;
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }

    public void addSocialAccount(AthleteSocialAccount account) {
        socialAccounts.add(account);
        account.setAthleteProfile(this);
    }

    public void addMedia(AthleteMedia mediaItem) {
        media.add(mediaItem);
        mediaItem.setAthleteProfile(this);
    }
}

