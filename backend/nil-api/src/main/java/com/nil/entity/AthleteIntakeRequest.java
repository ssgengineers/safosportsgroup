package com.nil.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity for storing athlete signup/intake form submissions.
 * These are pending applications that need to be reviewed before 
 * becoming full AthleteProfile records.
 */
@Entity
@Table(name = "athlete_intake_requests", indexes = {
    @Index(name = "idx_athlete_intake_email", columnList = "email"),
    @Index(name = "idx_athlete_intake_status", columnList = "status"),
    @Index(name = "idx_athlete_intake_school", columnList = "school")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteIntakeRequest extends BaseEntity {

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "date_of_birth", length = 20)
    private String dateOfBirth;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "school", length = 200)
    private String school;

    @Column(name = "sport", length = 100)
    private String sport;

    @Column(name = "position", length = 100)
    private String position;

    @Column(name = "primary_social_platform", length = 50)
    private String primarySocialPlatform;

    @Column(name = "primary_social_handle", length = 200)
    private String primarySocialHandle;

    @Column(name = "additional_socials", columnDefinition = "TEXT")
    private String additionalSocials;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "goals", columnDefinition = "TEXT")
    private String goals;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "reviewed_by", length = 255)
    private String reviewedBy;
}

