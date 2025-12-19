package com.nil.entity;

import com.nil.entity.enums.RoleType;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Role entity for RBAC (Role-Based Access Control).
 * Defines what actions users can perform in the system.
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false, unique = true, length = 50)
    private RoleType name;

    @Column(name = "description", length = 255)
    private String description;

    /**
     * Permissions associated with this role (JSON array or comma-separated)
     */
    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    @ManyToMany(mappedBy = "roles")
    @Builder.Default
    private Set<User> users = new HashSet<>();

    // Convenience constructor
    public Role(RoleType name, String description) {
        this.name = name;
        this.description = description;
    }
}

