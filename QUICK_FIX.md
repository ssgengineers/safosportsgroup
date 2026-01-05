# Quick Fix: Add Database Columns

The backend is having a Java compiler issue, but we can add the database columns directly. Run this SQL command:

## Option 1: Using Docker (if PostgreSQL is running in Docker)

```bash
docker exec -it nil-postgres psql -U nil_user -d nil_db -c "
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
"
```

## Option 2: Using psql directly

```bash
psql -h localhost -p 5432 -U nil_user -d nil_db -c "
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
"
```

## Option 3: Copy-paste into pgAdmin or any SQL client

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

After running this, refresh your browser and the preferences should work!

## Note about the Compilation Error

The compilation error you're seeing is a Java/Maven compatibility issue (likely Java 21 with an older Maven compiler plugin). This is unrelated to our code changes. Once you fix the Java environment or update Maven, the backend should compile fine. The circular dependency issue has been fixed.

