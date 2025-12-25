# How to Query Your Database in AWS RDS PostgreSQL

## Current Database (CDK-Managed)

**Instance:** `ssgrdsstack-databaseb269d8bb-kskuapfdvihs`  
**Endpoint:** `ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com`  
**Database:** `nil_db`  
**Username:** `nil_admin`  
**Password:** `|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a`

## Option 1: Using AWS RDS Query Editor (Easiest)

1. **Navigate to RDS Query Editor:**
   - Go to AWS Console → RDS → Databases
   - Select your database: `ssgrdsstack-databaseb269d8bb-kskuapfdvihs`
   - Click on the **"Query Editor"** tab (or use the left navigation)

2. **Connect to Database:**
   - Database: `nil_db`
   - Username: `nil_admin`
   - Password: `|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a`
   - Click "Connect to database"

3. **Query Your Tables:**

   **View all athlete intake requests:**
   ```sql
   SELECT * FROM athlete_intake_requests ORDER BY created_at DESC;
   ```

   **View all brand intake requests:**
   ```sql
   SELECT * FROM brand_intake_requests ORDER BY created_at DESC;
   ```

   **View pending athlete requests:**
   ```sql
   SELECT * FROM athlete_intake_requests WHERE status = 'pending' ORDER BY created_at DESC;
   ```

   **View specific athlete by email:**
   ```sql
   SELECT * FROM athlete_intake_requests WHERE email = 'your-email@example.com';
   ```

   **Count requests by status:**
   ```sql
   SELECT status, COUNT(*) as count 
   FROM athlete_intake_requests 
   GROUP BY status;
   ```

## Option 2: Using pgAdmin or DBeaver (Desktop Tools)

1. **Connection Details:**
   - Host: `ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com`
   - Port: `5432`
   - Database: `nil_db`
   - Username: `nil_admin`
   - Password: `|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a`

2. **Connect and Query:**
   - Use the same SQL queries as above

## Option 3: Using psql (Command Line)

```bash
psql -h ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com \
     -p 5432 \
     -U nil_admin \
     -d nil_db
```

Then enter your password when prompted: `|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a`

**Or use PGPASSWORD environment variable:**
```bash
export PGPASSWORD="|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a"
psql -h ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com \
     -p 5432 \
     -U nil_admin \
     -d nil_db
```

## Common Queries

**List all tables:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**View table structure:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'athlete_intake_requests';
```

**Recent submissions (last 24 hours):**
```sql
SELECT first_name, last_name, email, school, sport, created_at
FROM athlete_intake_requests
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Update request status:**
```sql
UPDATE athlete_intake_requests 
SET status = 'approved', updated_at = NOW()
WHERE id = 'your-uuid-here';
```

## Important Notes

- The tables are automatically created by Hibernate when the Spring Boot app starts
- Table names use snake_case: `athlete_intake_requests`, `brand_intake_requests`
- All tables extend `BaseEntity`, so they have: `id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `version`
- Status values are typically: `pending`, `approved`, `rejected`

