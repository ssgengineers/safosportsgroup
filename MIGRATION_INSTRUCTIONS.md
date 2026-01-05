# Fix: Add Brand Preferences Fields to Database

## Problem
The new AI matching preferences fields were added to the `BrandProfile` entity, but the database columns don't exist yet, causing a 500 error when trying to load/save brand profiles.

## Solution Options

### Option 1: Restart Backend (Easiest - Recommended)
Hibernate is configured with `ddl-auto: update`, so it will automatically add the new columns when the backend restarts.

**Steps:**
1. Stop your backend (if running)
2. Restart the backend
3. Hibernate will detect the new fields and add them to the database automatically

### Option 2: Run SQL Migration Manually
If you prefer to add the columns manually, run the migration script:

**Using Docker:**
```bash
# Connect to PostgreSQL container
docker exec -it nil-postgres psql -U nil_user -d nil_db

# Then run the migration
\i /path/to/backend/migrations/add_brand_preferences_fields.sql
```

**Or using psql directly:**
```bash
psql -h localhost -p 5432 -U nil_user -d nil_db -f backend/migrations/add_brand_preferences_fields.sql
```

**Or copy-paste the SQL:**
```sql
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
```

## Verify
After running the migration or restarting the backend, verify the columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'brand_profiles' 
AND column_name IN (
  'preferred_sports', 
  'preferred_conferences', 
  'min_followers', 
  'max_followers',
  'interest_alignment',
  'content_preferences',
  'budget_per_athlete',
  'deal_duration',
  'matching_notes'
);
```

You should see all 9 columns listed.

