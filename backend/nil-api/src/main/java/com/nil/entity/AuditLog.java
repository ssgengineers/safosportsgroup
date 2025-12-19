package com.nil.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Audit Log - Tracks all significant changes for compliance and dispute resolution.
 * 
 * Required for:
 * - Deal term modifications
 * - Payment changes
 * - Permission updates
 * - Profile edits
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_user", columnList = "user_id"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_action", columnList = "action")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Type of entity being audited.
     * Example: ATHLETE_PROFILE, DEAL, DEAL_TERMS, USER, PAYMENT
     */
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    /**
     * ID of the entity being audited.
     */
    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    /**
     * Action performed.
     * Example: CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVAL
     */
    @Column(name = "action", nullable = false, length = 50)
    private String action;

    /**
     * User who performed the action.
     */
    @Column(name = "user_id")
    private UUID userId;

    /**
     * Clerk ID of the user (for external reference).
     */
    @Column(name = "user_clerk_id", length = 100)
    private String userClerkId;

    /**
     * IP address of the request.
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * User agent string.
     */
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /**
     * Previous values as JSON (for updates).
     */
    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;

    /**
     * New values as JSON.
     */
    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;

    /**
     * List of changed field names.
     */
    @Column(name = "changed_fields", columnDefinition = "TEXT")
    private String changedFields;

    /**
     * Optional description or reason for the change.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Timestamp of the action.
     */
    @Column(name = "timestamp", nullable = false)
    @Builder.Default
    private Instant timestamp = Instant.now();

    /**
     * Request ID for tracing.
     */
    @Column(name = "request_id", length = 100)
    private String requestId;
}

