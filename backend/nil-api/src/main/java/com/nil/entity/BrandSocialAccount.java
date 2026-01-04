package com.nil.entity;

import com.nil.entity.enums.SocialPlatform;
import jakarta.persistence.*;
import lombok.*;

/**
 * Brand Social Media Account - Links brand profiles to their social media presence.
 */
@Entity
@Table(name = "brand_social_accounts", indexes = {
    @Index(name = "idx_brand_social_profile", columnList = "brand_profile_id"),
    @Index(name = "idx_brand_social_platform", columnList = "platform")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandSocialAccount extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_profile_id", nullable = false)
    private BrandProfile brandProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 50)
    private SocialPlatform platform;

    @Column(name = "handle", nullable = false, length = 200)
    private String handle;

    @Column(name = "profile_url", length = 500)
    private String profileUrl;

    @Column(name = "followers")
    private Long followers;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_connected")
    @Builder.Default
    private Boolean isConnected = true;
}

