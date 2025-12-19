-- NIL Platform Database Initialization Script
-- This script runs automatically when PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Insert default roles
INSERT INTO roles (id, name, description, created_at, version)
VALUES 
    (uuid_generate_v4(), 'ATHLETE', 'Athlete user who can create profiles and receive NIL deals', NOW(), 0),
    (uuid_generate_v4(), 'BRAND', 'Brand user who can create campaigns and match with athletes', NOW(), 0),
    (uuid_generate_v4(), 'AGENCY_ADMIN', 'Agency administrator with full access to manage athletes and brands', NOW(), 0),
    (uuid_generate_v4(), 'STAFF', 'Staff member with limited administrative access', NOW(), 0),
    (uuid_generate_v4(), 'SUPER_ADMIN', 'Super administrator with full system access', NOW(), 0)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance (JPA will create basic indexes, these are extras)
-- Note: These will be created after tables exist from JPA auto-creation

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'NIL Platform database initialized successfully!';
END $$;

