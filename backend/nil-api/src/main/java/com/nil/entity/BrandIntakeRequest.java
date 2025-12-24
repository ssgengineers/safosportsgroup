package com.nil.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity for storing brand partnership intake form submissions.
 * These are pending applications that need to be reviewed before
 * the brand gets access to the platform.
 */
@Entity
@Table(name = "brand_intake_requests", indexes = {
    @Index(name = "idx_brand_intake_email", columnList = "email"),
    @Index(name = "idx_brand_intake_status", columnList = "status"),
    @Index(name = "idx_brand_intake_company", columnList = "company")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandIntakeRequest extends BaseEntity {

    @Column(name = "company", nullable = false, length = 255)
    private String company;

    @Column(name = "contact_first_name", nullable = false, length = 100)
    private String contactFirstName;

    @Column(name = "contact_last_name", nullable = false, length = 100)
    private String contactLastName;

    @Column(name = "contact_title", length = 100)
    private String contactTitle;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "website", length = 500)
    private String website;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "company_size", length = 100)
    private String companySize;

    @Column(name = "budget", length = 100)
    private String budget;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "goals", columnDefinition = "TEXT")
    private String goals;

    @Column(name = "timeline", length = 100)
    private String timeline;

    @Column(name = "athlete_preferences", columnDefinition = "TEXT")
    private String athletePreferences;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "reviewed_by", length = 255)
    private String reviewedBy;
}

