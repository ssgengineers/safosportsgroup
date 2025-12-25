# Complete RDS Migration Checklist ✅

## Status: What's Done ✅

1. ✅ **Password Retrieved** - You've already got it from Secrets Manager
2. ✅ **New Database Created** - CDK-managed RDS instance is running
3. ✅ **Connection Info Documented** - All details in `RDS_CONNECTION_INFO.md`

## What Still Needs To Be Done ❌

### Task 1: Update Spring Boot Application ✅ (Just set environment variables)

Your Spring Boot app already uses environment variables, so you just need to set them:

**Option A: Create `.env` file (for local development)**

Create `backend/nil-api/.env`:
```bash
DB_HOST=ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=nil_db
DB_USERNAME=nil_admin
DB_PASSWORD="|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a"
SPRING_PROFILES_ACTIVE=prod
```

**Option B: Export environment variables (for running locally)**

```bash
export DB_HOST=ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=nil_db
export DB_USERNAME=nil_admin
export DB_PASSWORD="|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a"
export SPRING_PROFILES_ACTIVE=prod

# Then run your Spring Boot app
cd backend/nil-api
./mvnw spring-boot:run
```

**Option C: Test the connection**

```bash
# Test database connection
psql -h ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com \
     -p 5432 \
     -U nil_admin \
     -d nil_db

# Enter password: |8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a
```

### Task 2: Verify Application Works with New Database

1. **Start your Spring Boot app** with the new environment variables
2. **Check health endpoint**: `http://localhost:8080/actuator/health`
3. **Verify database connection** in logs
4. **Test API endpoints** to ensure everything works

### Task 3: Delete Old Database ⚠️ (IMPORTANT - Do this last!)

**⚠️ WARNING: Only delete the old database AFTER you've verified everything works with the new one!**

**Step 1: Verify new database is working**
- ✅ Application connects successfully
- ✅ All data is accessible
- ✅ All API endpoints work
- ✅ No errors in logs

**Step 2: Create final snapshot of old database (safety backup)**
```bash
aws rds create-db-snapshot \
  --db-instance-identifier nil-database \
  --db-snapshot-identifier nil-database-final-backup-$(date +%Y%m%d) \
  --region us-east-2
```

**Step 3: Wait for snapshot to complete**
```bash
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier nil-database-final-backup-$(date +%Y%m%d) \
  --region us-east-2
```

**Step 4: Delete old database**
```bash
# Option A: Delete with final snapshot (recommended)
aws rds delete-db-instance \
  --db-instance-identifier nil-database \
  --final-db-snapshot-identifier nil-database-final-$(date +%Y%m%d) \
  --region us-east-2

# Option B: Delete without snapshot (faster, but no backup)
aws rds delete-db-instance \
  --db-instance-identifier nil-database \
  --skip-final-snapshot \
  --region us-east-2
```

**Step 5: Verify deletion**
```bash
aws rds describe-db-instances \
  --db-instance-identifier nil-database \
  --region us-east-2
# Should return: DBInstanceNotFound
```

## Quick Commands Summary

### Set Environment Variables
```bash
export DB_HOST=ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=nil_db
export DB_USERNAME=nil_admin
export DB_PASSWORD="|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a"
```

### Test Connection
```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME
```

### Delete Old Database (after verification)
```bash
aws rds delete-db-instance \
  --db-instance-identifier nil-database \
  --final-db-snapshot-identifier nil-database-final-$(date +%Y%m%d) \
  --region us-east-2
```

## Cost Savings

**Current:** Paying for 2 databases
- Old: `nil-database` (~$15-20/month)
- New: `ssgrdsstack-databaseb269d8bb-kskuapfdvihs` (~$15-20/month)
- **Total: ~$30-40/month**

**After deletion:** Only paying for 1 database
- New: `ssgrdsstack-databaseb269d8bb-kskuapfdvihs` (~$15-20/month)
- **Total: ~$15-20/month**
- **Savings: ~$15-20/month**

## Troubleshooting

### Can't connect to new database?
1. Check security group allows your IP (if connecting from outside VPC)
2. Verify endpoint is correct
3. Check password (escape special characters in shell)
4. Verify database is in "available" state:
   ```bash
   aws rds describe-db-instances \
     --db-instance-identifier ssgrdsstack-databaseb269d8bb-kskuapfdvihs \
     --query 'DBInstances[0].DBInstanceStatus' \
     --region us-east-2
   ```

### Application won't start?
1. Check environment variables are set correctly
2. Verify Spring Boot can reach the database (network/VPC)
3. Check application logs for connection errors
4. Verify database credentials in Secrets Manager

## Next Steps After Migration

Once everything is working:
1. ✅ Update any CI/CD pipelines with new database endpoint
2. ✅ Update documentation
3. ✅ Set up monitoring/alerts for new database
4. ✅ Delete old database to save costs
5. ✅ Continue with Phase 4: ECR Stack

