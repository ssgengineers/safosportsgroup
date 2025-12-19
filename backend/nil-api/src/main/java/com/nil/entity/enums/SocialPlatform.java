package com.nil.entity.enums;

/**
 * Normalized social media platforms.
 * Ensures consistent platform identification across the system.
 */
public enum SocialPlatform {
    INSTAGRAM("Instagram", "instagram.com"),
    TIKTOK("TikTok", "tiktok.com"),
    YOUTUBE("YouTube", "youtube.com"),
    TWITTER("X (Twitter)", "x.com"),
    TWITCH("Twitch", "twitch.tv"),
    FACEBOOK("Facebook", "facebook.com"),
    LINKEDIN("LinkedIn", "linkedin.com"),
    SNAPCHAT("Snapchat", "snapchat.com"),
    THREADS("Threads", "threads.net");

    private final String displayName;
    private final String domain;

    SocialPlatform(String displayName, String domain) {
        this.displayName = displayName;
        this.domain = domain;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDomain() {
        return domain;
    }
}

