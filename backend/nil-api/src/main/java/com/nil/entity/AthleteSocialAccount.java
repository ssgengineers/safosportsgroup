package com.nil.entity;

import com.nil.entity.enums.SocialPlatform;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Athlete Social Account - Connected social media platforms.
 * Tracks platform, handle, URL, and links to time-stamped snapshots.
 */
@Entity
@Table(name = "athlete_social_accounts", indexes = {
    @Index(name = "idx_social_athlete", columnList = "athlete_profile_id"),
    @Index(name = "idx_social_platform", columnList = "platform")
}, uniqueConstraints = {
    @UniqueConstraint(
        name = "uk_athlete_platform",
        columnNames = {"athlete_profile_id", "platform"}
    )
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteSocialAccount extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_profile_id", nullable = false)
    private AthleteProfile athleteProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 30)
    private SocialPlatform platform;

    @Column(name = "handle", nullable = false, length = 100)
    private String handle; // @username

    @Column(name = "profile_url", length = 500)
    private String profileUrl;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_connected")
    @Builder.Default
    private Boolean isConnected = false; // OAuth connected for API access

    @Column(name = "access_token", length = 500)
    private String accessToken; // Encrypted OAuth token

    @Column(name = "refresh_token", length = 500)
    private String refreshToken;

    // ==================== Current Metrics (Latest Snapshot) ====================
    
    @Column(name = "followers")
    private Long followers;

    @Column(name = "following")
    private Long following;

    @Column(name = "posts_count")
    private Long postsCount;

    @Column(name = "engagement_rate")
    private Double engagementRate; // As percentage (e.g., 4.5 = 4.5%)

    @Column(name = "avg_likes")
    private Long avgLikes;

    @Column(name = "avg_comments")
    private Long avgComments;

    @Column(name = "avg_views")
    private Long avgViews; // For video platforms

    // ==================== Snapshots ====================
    
    @OneToMany(mappedBy = "socialAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AthleteSocialSnapshot> snapshots = new ArrayList<>();

    // Helper method
    public void addSnapshot(AthleteSocialSnapshot snapshot) {
        snapshots.add(snapshot);
        snapshot.setSocialAccount(this);
    }
}

