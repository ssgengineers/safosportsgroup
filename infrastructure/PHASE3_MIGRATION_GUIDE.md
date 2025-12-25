# Phase 3: RDS Migration Guide - Full CDK Management

## Overview

To fully manage your RDS instance with CDK, you need to migrate from the existing RDS instance (`nil-database`) to a new CDK-managed instance in the new VPC. This guide walks you through the process.

## Migration Strategy

The migration process:
1. **Create snapshot** of existing RDS
2. **Deploy new RDS stack** that restores from snapshot
3. **Verify data** in new instance
4. **Update application** to use new endpoint
5. **Delete old instance** after verification

## Prerequisites

- ✅ VPC stack deployed (`SSGVpcStack`)
- ✅ AWS CLI configured with proper permissions
- ✅ Existing RDS instance accessible
- ⚠️ **Downtime expected**: ~15-30 minutes during migration

## Step-by-Step Migration

### Step 1: Create Snapshot of Existing RDS

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier nil-database \
  --db-snapshot-identifier nil-database-migration-$(date +%Y%m%d) \
  --region us-east-2

# Wait for snapshot to complete (this takes 5-15 minutes)
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier nil-database-migration-$(date +%Y%m%d) \
  --region us-east-2
```

**Note the snapshot identifier** - you'll need it in the next step.

### Step 2: Update RDS Stack to Restore from Snapshot

Edit `infrastructure/bin/infrastructure.ts` to pass the snapshot identifier:

```typescript
// Phase 3: RDS Stack (depends on VPC Stack)
new RdsStack(app, 'SSGRdsStack', {
  env,
  vpcStack,
  snapshotIdentifier: 'nil-database-migration-YYYYMMDD', // Add your snapshot ID here
  createNewInstance: true, // This creates a new CDK-managed instance
});
```

### Step 3: Deploy RDS Stack

```bash
cd infrastructure

# Build
npm run build

# Deploy (this will create the new RDS instance from snapshot)
npx cdk deploy SSGRdsStack
```

**This will take 10-15 minutes** as RDS restores from the snapshot.

### Step 4: Get New Database Credentials

The new RDS instance uses AWS Secrets Manager for credentials:

```bash
# Get the secret ARN from stack outputs
SECRET_ARN=$(aws cloudformation describe-stacks \
  --stack-name SSGRdsStack \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue" \
  --output text \
  --region us-east-2)

# Get the password
aws secretsmanager get-secret-value \
  --secret-id ${SECRET_ARN} \
  --query SecretString \
  --output text | jq -r .password
```

**Username:** `nil_admin` (or as configured)

### Step 5: Verify Data Migration

Connect to the new database and verify data:

```bash
# Get new endpoint
NEW_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name SSGRdsStack \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" \
  --output text \
  --region us-east-2)

# Connect using psql (if installed)
psql -h ${NEW_ENDPOINT} -p 5432 -U nil_admin -d nil_db

# Or use AWS RDS Query Editor in console
```

**Verify:**
- All tables exist
- Data is present
- Row counts match

### Step 6: Update Application Configuration

Update your application to use the new database endpoint:

**Option A: Environment Variables**
```bash
export DB_HOST=<new-endpoint-from-stack-output>
export DB_USERNAME=nil_admin
export DB_PASSWORD=<password-from-secrets-manager>
```

**Option B: Update ECS Task Definition** (when deploying ECS)
- Update `DB_HOST` environment variable
- Update `DB_PASSWORD` to use Secrets Manager ARN

### Step 7: Test Application

1. Deploy application with new database endpoint
2. Test all critical functionality
3. Monitor logs for database connection issues
4. Verify data integrity

### Step 8: Delete Old RDS Instance

**⚠️ Only after full verification!**

```bash
# Delete old instance (creates final snapshot automatically)
aws rds delete-db-instance \
  --db-instance-identifier nil-database \
  --skip-final-snapshot \
  --region us-east-2
```

Or keep the final snapshot:
```bash
aws rds delete-db-instance \
  --db-instance-identifier nil-database \
  --final-db-snapshot-identifier nil-database-final-$(date +%Y%m%d) \
  --region us-east-2
```

## Automated Migration Script

Use the provided script for automated migration:

```bash
cd infrastructure/scripts
./migrate-rds.sh
```

**Note:** You'll need to update the script with the actual new instance ID after deployment.

## Rollback Plan

If something goes wrong:

1. **Keep old instance running** until migration is verified
2. **Update application** to point back to old endpoint
3. **Delete new instance** if needed:
   ```bash
   aws rds delete-db-instance \
     --db-instance-identifier <new-instance-id> \
     --skip-final-snapshot
   ```

## Post-Migration

After successful migration:

1. ✅ Update RDS stack to remove `snapshotIdentifier` (for future deployments)
2. ✅ Update application configuration permanently
3. ✅ Monitor new instance performance
4. ✅ Set up CloudWatch alarms (Phase 9)
5. ✅ Delete old instance and snapshots (after 30 days)

## Cost Considerations

- **New RDS Instance:** ~$15-20/month (db.t4g.micro)
- **Storage:** ~$0.115/GB/month
- **Backups:** 7 days retention (included)
- **Snapshot Storage:** ~$0.095/GB/month (until deleted)

## Troubleshooting

### Snapshot Restore Fails
- Check snapshot status: `aws rds describe-db-snapshots --db-snapshot-identifier <id>`
- Verify snapshot is in same region
- Check VPC and subnet configuration

### Connection Issues
- Verify security group allows traffic from ECS
- Check VPC routing
- Verify endpoint is correct

### Data Mismatch
- Compare row counts: `SELECT COUNT(*) FROM <table>`
- Check application logs for errors
- Verify all migrations ran successfully

## Next Steps

After migration:
- **Phase 4:** ECR Stack (container registry)
- **Phase 5:** ECS Stack (deploy application)
- **Phase 6:** ElastiCache Stack (Redis)
- **Phase 7:** S3 Stack (media storage)

