package com.nil.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Organization entity for brands and agencies.
 * Allows multiple users to belong to one organization.
 */
@Entity
@Table(name = "organizations", indexes = {
    @Index(name = "idx_org_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "type", length = 50)
    private String type; // BRAND, AGENCY

    @Column(name = "website", length = 500)
    private String website;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<User> members = new HashSet<>();
}

