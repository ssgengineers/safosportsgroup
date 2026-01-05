package com.nil.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * NCAA athletic conferences for athlete categorization.
 * Supports multiple input formats (e.g., "Big Ten", "BIG_TEN", "Big 10").
 */
public enum Conference {
    // Power Five
    SEC("SEC", "Southeastern Conference", "southeastern"),
    BIG_TEN("Big Ten", "Big 10", "B1G", "bigten"),
    BIG_12("Big 12", "Big XII", "Big XII", "big12"),
    ACC("ACC", "Atlantic Coast Conference", "atlantic coast"),
    PAC_12("Pac-12", "PAC-12", "Pac 12", "Pac12", "Pacific-12", "Pacific 12"),
    
    // Group of Five
    AAC("AAC", "American Athletic Conference", "american athletic"),
    MOUNTAIN_WEST("Mountain West", "MWC", "Mountain West Conference", "mountainwest"),
    MAC("MAC", "Mid-American Conference", "mid-american", "mid american"),
    SUN_BELT("Sun Belt", "Sun Belt Conference", "sunbelt"),
    CONFERENCE_USA("Conference USA", "C-USA", "CUSA", "Conference-USA"),
    
    // FCS Conferences
    BIG_SKY("Big Sky", "Big Sky Conference", "bigsky"),
    CAA("CAA", "Colonial Athletic Association", "colonial"),
    IVY_LEAGUE("Ivy League", "Ivy", "ivy"),
    MEAC("MEAC", "Mid-Eastern Athletic Conference", "mid-eastern"),
    MISSOURI_VALLEY("Missouri Valley", "MVC", "Missouri Valley Conference", "missourivalley"),
    OHIO_VALLEY("Ohio Valley", "OVC", "Ohio Valley Conference", "ohiovalley"),
    PATRIOT_LEAGUE("Patriot League", "Patriot", "patriot"),
    PIONEER("Pioneer", "Pioneer Football League", "pioneer"),
    SOUTHERN("Southern", "SoCon", "Southern Conference", "socon"),
    SOUTHLAND("Southland", "Southland Conference", "southland"),
    SWAC("SWAC", "Southwestern Athletic Conference", "southwestern"),
    
    // Division II/III
    DIVISION_II("Division II", "DII", "D2", "Division 2", "division2"),
    DIVISION_III("Division III", "DIII", "D3", "Division 3", "division3"),
    
    // Other
    INDEPENDENT("Independent", "Indy", "independent"),
    NAIA("NAIA", "National Association of Intercollegiate Athletics", "naia"),
    JUCO("JUCO", "Junior College", "juco", "junior college"),
    OTHER("Other", "other");

    private final String displayName;
    private final String[] aliases;

    Conference(String displayName, String... aliases) {
        this.displayName = displayName;
        this.aliases = aliases;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public String[] getAliases() {
        return aliases;
    }

    /**
     * Custom JSON deserializer that accepts multiple input formats.
     * Handles: "Big Ten", "BIG_TEN", "Big 10", "B1G", etc.
     */
    @JsonCreator
    public static Conference fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        String normalizedValue = value.trim();
        String normalizedLower = normalizedValue.toLowerCase();
        
        // First, try exact enum name match
        for (Conference conference : Conference.values()) {
            if (conference.name().equalsIgnoreCase(normalizedValue)) {
                return conference;
            }
        }
        
        // Then, try display name match
        for (Conference conference : Conference.values()) {
            if (conference.displayName.equalsIgnoreCase(normalizedValue)) {
                return conference;
            }
        }
        
        // Finally, try alias match
        for (Conference conference : Conference.values()) {
            for (String alias : conference.aliases) {
                if (alias.equalsIgnoreCase(normalizedValue) || alias.toLowerCase().equals(normalizedLower)) {
                    return conference;
                }
            }
        }
        
        // Special handling for common variations
        if (normalizedLower.contains("big") && (normalizedLower.contains("ten") || normalizedLower.contains("10"))) {
            return BIG_TEN;
        }
        if (normalizedLower.contains("big") && (normalizedLower.contains("twelve") || normalizedLower.contains("12"))) {
            return BIG_12;
        }
        if (normalizedLower.contains("pac") || normalizedLower.contains("pacific")) {
            return PAC_12;
        }
        if (normalizedLower.contains("mountain") && normalizedLower.contains("west")) {
            return MOUNTAIN_WEST;
        }
        if (normalizedLower.contains("sun") && normalizedLower.contains("belt")) {
            return SUN_BELT;
        }
        if (normalizedLower.contains("conference") && normalizedLower.contains("usa")) {
            return CONFERENCE_USA;
        }
        if (normalizedLower.contains("ivy")) {
            return IVY_LEAGUE;
        }
        if (normalizedLower.contains("patriot")) {
            return PATRIOT_LEAGUE;
        }
        if (normalizedLower.contains("missouri") && normalizedLower.contains("valley")) {
            return MISSOURI_VALLEY;
        }
        if (normalizedLower.contains("ohio") && normalizedLower.contains("valley")) {
            return OHIO_VALLEY;
        }
        if (normalizedLower.contains("big") && normalizedLower.contains("sky")) {
            return BIG_SKY;
        }
        if (normalizedLower.contains("southern") && !normalizedLower.contains("athletic")) {
            return SOUTHERN;
        }
        if (normalizedLower.contains("southland")) {
            return SOUTHLAND;
        }
        if (normalizedLower.contains("southwestern") || normalizedLower.equals("swac")) {
            return SWAC;
        }
        if (normalizedLower.contains("division") && (normalizedLower.contains("ii") || normalizedLower.contains("2"))) {
            return DIVISION_II;
        }
        if (normalizedLower.contains("division") && (normalizedLower.contains("iii") || normalizedLower.contains("3"))) {
            return DIVISION_III;
        }
        
        // Default to OTHER if no match found
        return OTHER;
    }
}

