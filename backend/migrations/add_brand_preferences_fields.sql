-- Migration: Add AI Matching Preferences fields to brand_profiles table
-- Date: 2024
-- Description: Adds fields for storing brand's AI matching preferences

-- Add new columns for AI matching preferences
ALTER TABLE brand_profiles
ADD COLUMN IF NOT EXISTS preferred_sports TEXT,
ADD COLUMN IF NOT EXISTS preferred_conferences TEXT,
ADD COLUMN IF NOT EXISTS min_followers VARCHAR(50),
ADD COLUMN IF NOT EXISTS max_followers VARCHAR(50),
ADD COLUMN IF NOT EXISTS interest_alignment TEXT,
ADD COLUMN IF NOT EXISTS content_preferences TEXT,
ADD COLUMN IF NOT EXISTS budget_per_athlete VARCHAR(100),
ADD COLUMN IF NOT EXISTS deal_duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS matching_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN brand_profiles.preferred_sports IS 'JSON array of preferred sports';
COMMENT ON COLUMN brand_profiles.preferred_conferences IS 'JSON array of preferred conferences';
COMMENT ON COLUMN brand_profiles.min_followers IS 'Minimum follower count (e.g., "50K")';
COMMENT ON COLUMN brand_profiles.max_followers IS 'Maximum follower count (e.g., "500K")';
COMMENT ON COLUMN brand_profiles.interest_alignment IS 'JSON array of interest categories';
COMMENT ON COLUMN brand_profiles.content_preferences IS 'JSON array of preferred content types';
COMMENT ON COLUMN brand_profiles.budget_per_athlete IS 'Budget range per athlete (e.g., "$5,000 - $15,000")';
COMMENT ON COLUMN brand_profiles.deal_duration IS 'Preferred deal duration (e.g., "3-6 months")';
COMMENT ON COLUMN brand_profiles.matching_notes IS 'Additional notes for AI matching';

