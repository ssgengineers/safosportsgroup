package com.nil.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Normalized sport types for consistent categorization.
 * Supports multiple input formats (e.g., "Basketball", "BASKETBALL", "mens_basketball").
 */
public enum Sport {
    // ==================== Football ====================
    FOOTBALL("Football", "football", "fb", "ncaa football"),
    
    // ==================== Basketball ====================
    BASKETBALL("Basketball", "basketball", "bball", "hoops"),
    MENS_BASKETBALL("Men's Basketball", "mens basketball", "men's basketball", "mbb"),
    WOMENS_BASKETBALL("Women's Basketball", "womens basketball", "women's basketball", "wbb"),
    
    // ==================== Baseball & Softball ====================
    BASEBALL("Baseball", "baseball", "mlb"),
    SOFTBALL("Softball", "softball"),
    
    // ==================== Soccer ====================
    SOCCER("Soccer", "soccer", "futbol", "fútbol"),
    MENS_SOCCER("Men's Soccer", "mens soccer", "men's soccer"),
    WOMENS_SOCCER("Women's Soccer", "womens soccer", "women's soccer"),
    
    // ==================== Volleyball ====================
    VOLLEYBALL("Volleyball", "volleyball", "vball"),
    MENS_VOLLEYBALL("Men's Volleyball", "mens volleyball", "men's volleyball"),
    WOMENS_VOLLEYBALL("Women's Volleyball", "womens volleyball", "women's volleyball"),
    
    // ==================== Track & Field ====================
    TRACK_AND_FIELD("Track and Field", "track and field", "track", "field", "track & field"),
    CROSS_COUNTRY("Cross Country", "cross country", "xc", "cc"),
    INDOOR_TRACK("Indoor Track", "indoor track", "indoor track and field"),
    OUTDOOR_TRACK("Outdoor Track", "outdoor track", "outdoor track and field"),
    
    // ==================== Swimming & Diving ====================
    SWIMMING("Swimming", "swimming", "swim"),
    DIVING("Diving", "diving", "dive"),
    SWIMMING_DIVING("Swimming & Diving", "swimming and diving", "swim and dive"),
    
    // ==================== Tennis ====================
    TENNIS("Tennis", "tennis"),
    MENS_TENNIS("Men's Tennis", "mens tennis", "men's tennis"),
    WOMENS_TENNIS("Women's Tennis", "womens tennis", "women's tennis"),
    
    // ==================== Golf ====================
    GOLF("Golf", "golf"),
    MENS_GOLF("Men's Golf", "mens golf", "men's golf"),
    WOMENS_GOLF("Women's Golf", "womens golf", "women's golf"),
    
    // ==================== Wrestling ====================
    WRESTLING("Wrestling", "wrestling"),
    
    // ==================== Gymnastics ====================
    GYMNASTICS("Gymnastics", "gymnastics"),
    MENS_GYMNASTICS("Men's Gymnastics", "mens gymnastics", "men's gymnastics"),
    WOMENS_GYMNASTICS("Women's Gymnastics", "womens gymnastics", "women's gymnastics"),
    
    // ==================== Lacrosse ====================
    LACROSSE("Lacrosse", "lacrosse", "lax"),
    MENS_LACROSSE("Men's Lacrosse", "mens lacrosse", "men's lacrosse"),
    WOMENS_LACROSSE("Women's Lacrosse", "womens lacrosse", "women's lacrosse"),
    
    // ==================== Hockey ====================
    ICE_HOCKEY("Ice Hockey", "ice hockey", "hockey"),
    FIELD_HOCKEY("Field Hockey", "field hockey"),
    
    // ==================== Rowing ====================
    ROWING("Rowing", "rowing", "crew"),
    
    // ==================== Water Sports ====================
    WATER_POLO("Water Polo", "water polo", "waterpolo"),
    
    // ==================== Combat Sports ====================
    BOXING("Boxing", "boxing"),
    FENCING("Fencing", "fencing"),
    
    // ==================== Equestrian ====================
    EQUESTRIAN("Equestrian", "equestrian", "horse"),
    
    // ==================== Winter Sports ====================
    SKIING("Skiing", "skiing", "ski"),
    SNOWBOARDING("Snowboarding", "snowboarding", "snowboard"),
    
    // ==================== Beach Sports ====================
    BEACH_VOLLEYBALL("Beach Volleyball", "beach volleyball", "sand volleyball"),
    
    // ==================== Racquet Sports ====================
    BADMINTON("Badminton", "badminton"),
    SQUASH("Squash", "squash"),
    RACQUETBALL("Racquetball", "racquetball"),
    
    // ==================== Team Sports ====================
    RUGBY("Rugby", "rugby"),
    CRICKET("Cricket", "cricket"),
    ULTIMATE_FRISBEE("Ultimate Frisbee", "ultimate frisbee", "ultimate", "frisbee"),
    
    // ==================== Individual Sports ====================
    BOWLING("Bowling", "bowling"),
    ARCHERY("Archery", "archery"),
    RIFLE("Rifle", "rifle", "shooting"),
    
    // ==================== Spirit & Dance ====================
    CHEERLEADING("Cheerleading", "cheerleading", "cheer"),
    DANCE("Dance", "dance", "dance team"),
    POMS("Poms", "poms", "pom squad"),
    
    // ==================== E-Sports ====================
    ESPORTS("Esports", "esports", "e-sports", "gaming", "video games"),
    
    // ==================== Other ====================
    TRIATHLON("Triathlon", "triathlon", "tri"),
    MARATHON("Marathon", "marathon", "running"),
    POWERLIFTING("Powerlifting", "powerlifting", "weightlifting"),
    BODYBUILDING("Bodybuilding", "bodybuilding"),
    MARTIAL_ARTS("Martial Arts", "martial arts", "mma", "judo", "karate", "taekwondo"),
    OTHER("Other", "other");

    private final String displayName;
    private final String[] aliases;

    Sport(String displayName, String... aliases) {
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
     * Handles: "Basketball", "BASKETBALL", "basketball", "bball", etc.
     */
    @JsonCreator
    public static Sport fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        
        String normalizedValue = value.trim().toLowerCase();
        
        // First, try exact enum name match
        for (Sport sport : Sport.values()) {
            if (sport.name().equalsIgnoreCase(value)) {
                return sport;
            }
        }
        
        // Then, try display name match
        for (Sport sport : Sport.values()) {
            if (sport.displayName.equalsIgnoreCase(value)) {
                return sport;
            }
        }
        
        // Finally, try alias match
        for (Sport sport : Sport.values()) {
            for (String alias : sport.aliases) {
                if (alias.equalsIgnoreCase(normalizedValue)) {
                    return sport;
                }
            }
        }
        
        // Default to OTHER if no match found
        return OTHER;
    }

    /**
     * Check if this is a gendered sport category.
     */
    public boolean isGendered() {
        String name = this.name();
        return name.startsWith("MENS_") || name.startsWith("WOMENS_");
    }

    /**
     * Get the base sport (without gender prefix).
     */
    public Sport getBaseSport() {
        String name = this.name();
        if (name.startsWith("MENS_")) {
            String baseName = name.substring(5); // Remove "MENS_"
            try {
                return Sport.valueOf(baseName);
            } catch (IllegalArgumentException e) {
                return this;
            }
        } else if (name.startsWith("WOMENS_")) {
            String baseName = name.substring(7); // Remove "WOMENS_"
            try {
                return Sport.valueOf(baseName);
            } catch (IllegalArgumentException e) {
                return this;
            }
        }
        return this;
    }
}
