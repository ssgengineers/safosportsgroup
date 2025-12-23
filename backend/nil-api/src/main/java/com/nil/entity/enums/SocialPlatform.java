package com.nil.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Normalized social media platforms.
 * Supports multiple input formats (e.g., "Instagram", "IG", "insta").
 */
public enum SocialPlatform {
    INSTAGRAM("Instagram", "instagram.com", "ig", "insta", "gram"),
    TIKTOK("TikTok", "tiktok.com", "tik tok", "tt"),
    YOUTUBE("YouTube", "youtube.com", "yt"),
    TWITTER("X (Twitter)", "x.com", "twitter", "x", "tweet"),
    TWITCH("Twitch", "twitch.tv"),
    FACEBOOK("Facebook", "facebook.com", "fb", "meta"),
    LINKEDIN("LinkedIn", "linkedin.com", "li"),
    SNAPCHAT("Snapchat", "snapchat.com", "snap", "sc"),
    THREADS("Threads", "threads.net"),
    PINTEREST("Pinterest", "pinterest.com", "pin"),
    DISCORD("Discord", "discord.com"),
    REDDIT("Reddit", "reddit.com"),
    BEREAL("BeReal", "bereal.com", "be real"),
    KICK("Kick", "kick.com"),
    RUMBLE("Rumble", "rumble.com"),
    OTHER("Other", "");

    private final String displayName;
    private final String domain;
    private final String[] aliases;

    SocialPlatform(String displayName, String domain, String... aliases) {
        this.displayName = displayName;
        this.domain = domain;
        this.aliases = aliases;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public String getDomain() {
        return domain;
    }

    public String[] getAliases() {
        return aliases;
    }

    /**
     * Custom JSON deserializer that accepts multiple input formats.
     * Handles: "Instagram", "INSTAGRAM", "ig", "insta", etc.
     */
    @JsonCreator
    public static SocialPlatform fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        String normalizedValue = value.trim().toLowerCase();
        
        // First, try exact enum name match
        for (SocialPlatform platform : SocialPlatform.values()) {
            if (platform.name().equalsIgnoreCase(value)) {
                return platform;
            }
        }
        
        // Then, try display name match
        for (SocialPlatform platform : SocialPlatform.values()) {
            if (platform.displayName.equalsIgnoreCase(value)) {
                return platform;
            }
        }
        
        // Finally, try alias match
        for (SocialPlatform platform : SocialPlatform.values()) {
            for (String alias : platform.aliases) {
                if (alias.equalsIgnoreCase(normalizedValue)) {
                    return platform;
                }
            }
        }
        
        // Check if value contains domain
        for (SocialPlatform platform : SocialPlatform.values()) {
            if (!platform.domain.isEmpty() && normalizedValue.contains(platform.domain)) {
                return platform;
            }
        }
        
        // Default to OTHER if no match found
        return OTHER;
    }
}
