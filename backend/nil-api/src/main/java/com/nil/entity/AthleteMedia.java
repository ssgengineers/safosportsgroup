package com.nil.entity;

import com.nil.entity.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Athlete Media - Photos, videos, and other media assets.
 * Used for profile display and brand review.
 */
@Entity
@Table(name = "athlete_media", indexes = {
    @Index(name = "idx_media_athlete", columnList = "athlete_profile_id"),
    @Index(name = "idx_media_type", columnList = "media_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteMedia extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_profile_id", nullable = false)
    private AthleteProfile athleteProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 30)
    private MediaType mediaType;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * URL to the media file (S3 or CDN).
     */
    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    /**
     * Thumbnail URL for videos.
     */
    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    /**
     * Original filename.
     */
    @Column(name = "filename", length = 255)
    private String filename;

    /**
     * MIME type (image/jpeg, video/mp4, etc.).
     */
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    /**
     * File size in bytes.
     */
    @Column(name = "file_size")
    private Long fileSize;

    /**
     * Video duration in seconds.
     */
    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    /**
     * Image/video width in pixels.
     */
    @Column(name = "width")
    private Integer width;

    /**
     * Image/video height in pixels.
     */
    @Column(name = "height")
    private Integer height;

    /**
     * Display order for gallery view.
     */
    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Is this the primary/featured media?
     */
    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    /**
     * Is this media visible to brands?
     */
    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    /**
     * S3 bucket key for deletion.
     */
    @Column(name = "storage_key", length = 500)
    private String storageKey;
}

