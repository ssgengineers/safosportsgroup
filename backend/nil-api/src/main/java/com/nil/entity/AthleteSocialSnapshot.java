package com.nil.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Athlete Social Snapshot - Time-stamped social media metrics.
 * 
 * CRITICAL for NIL value modeling:
 * - Captures "point in time" metrics for deals
 * - Enables tracking growth over time
 * - Required for accurate ML training data
 */
@Entity
@Table(name = "athlete_social_snapshots", indexes = {
    @Index(name = "idx_snapshot_account", columnList = "social_account_id"),
    @Index(name = "idx_snapshot_timestamp", columnList = "snapshot_timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteSocialSnapshot extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "social_account_id", nullable = false)
    private AthleteSocialAccount socialAccount;

    @Column(name = "snapshot_timestamp", nullable = false)
    private Instant snapshotTimestamp;

    // ==================== Core Metrics ====================
    
    @Column(name = "followers")
    private Long followers;

    @Column(name = "following")
    private Long following;

    @Column(name = "posts_count")
    private Long postsCount;

    // ==================== Engagement Metrics ====================
    
    @Column(name = "engagement_rate")
    private Double engagementRate;

    @Column(name = "avg_likes")
    private Long avgLikes;

    @Column(name = "avg_comments")
    private Long avgComments;

    @Column(name = "avg_views")
    private Long avgViews;

    @Column(name = "avg_shares")
    private Long avgShares;

    @Column(name = "avg_saves")
    private Long avgSaves;

    // ==================== Audience Demographics ====================
    
    /**
     * Audience age distribution as JSON.
     * Example: {"13-17": 5, "18-24": 45, "25-34": 35, "35-44": 10, "45+": 5}
     */
    @Column(name = "audience_age_distribution", columnDefinition = "TEXT")
    private String audienceAgeDistribution;

    /**
     * Audience gender distribution as JSON.
     * Example: {"male": 60, "female": 38, "other": 2}
     */
    @Column(name = "audience_gender_distribution", columnDefinition = "TEXT")
    private String audienceGenderDistribution;

    /**
     * Top audience locations as JSON.
     * Example: [{"city": "New York", "percentage": 15}, {"city": "Los Angeles", "percentage": 12}]
     */
    @Column(name = "audience_top_locations", columnDefinition = "TEXT")
    private String audienceTopLocations;

    /**
     * Top audience countries as JSON.
     */
    @Column(name = "audience_top_countries", columnDefinition = "TEXT")
    private String audienceTopCountries;

    // ==================== Content Performance ====================
    
    /**
     * Top performing content IDs/URLs as JSON.
     */
    @Column(name = "top_content", columnDefinition = "TEXT")
    private String topContent;

    /**
     * Posting frequency (posts per week).
     */
    @Column(name = "posting_frequency")
    private Double postingFrequency;

    // ==================== Metadata ====================
    
    /**
     * Source of the snapshot (API, MANUAL, SCRAPE).
     */
    @Column(name = "source", length = 50)
    private String source;

    /**
     * Raw API response for debugging/auditing.
     */
    @Column(name = "raw_data", columnDefinition = "TEXT")
    private String rawData;
}

