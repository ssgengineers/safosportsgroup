package com.nil.repository;

import com.nil.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for AuditLog entity operations.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    /**
     * Find audit logs for a specific entity.
     */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, UUID entityId);

    /**
     * Find audit logs by user.
     */
    Page<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId, Pageable pageable);

    /**
     * Find audit logs by action.
     */
    List<AuditLog> findByActionOrderByTimestampDesc(String action);

    /**
     * Find audit logs within a date range.
     */
    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
            Instant startDate,
            Instant endDate,
            Pageable pageable
    );

    /**
     * Find audit logs by entity type.
     */
    Page<AuditLog> findByEntityTypeOrderByTimestampDesc(String entityType, Pageable pageable);

    /**
     * Delete old audit logs (for GDPR compliance if needed).
     */
    void deleteByTimestampBefore(Instant before);
}

