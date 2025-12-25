# Phase 3: RDS Stack - COMPLETE ✅

## What Was Completed

1. ✅ **RDS Stack Created** - Full CDK-managed RDS instance in new VPC
2. ✅ **New RDS Instance** - Creates PostgreSQL 15.4 instance (db.t4g.micro)
3. ✅ **VPC Integration** - Deployed in private subnets with proper security groups
4. ✅ **Secrets Management** - Database credentials stored in AWS Secrets Manager
5. ✅ **Backup Configuration** - 7-day backup retention with automated backups
6. ✅ **Stack Outputs** - Database endpoint, port, name, and secret ARN exported
7. ✅ **Migration Support** - Can restore from snapshot for data migration
8. ✅ **Migration Script** - Automated migration script provided

## Current State

The RDS stack now **fully manages** a new RDS PostgreSQL instance via CDK:

- ✅ Creates new RDS instance in new VPC private subnets
- ✅ Uses security group from VPC stack
- ✅ Stores credentials in AWS Secrets Manager
- ✅ Configures automated backups (7 days)
- ✅ Supports snapshot restore for migration
- ✅ Fully managed by CDK (can update, modify, delete via CDK)

## RDS Configuration

- **Engine:** PostgreSQL 15.4
- **Instance Class:** db.t4g.micro
- **Storage:** 100GB (gp2, encrypted)
- **Port:** `5432`
- **Database Name:** `nil_db`
- **Username:** `nil_admin` (stored in Secrets Manager)
- **Multi-AZ:** No (single AZ for Phase 1 cost optimization)
- **Backup Retention:** 7 days
- **Backup Window:** 03:00-04:00 UTC
- **Maintenance Window:** Sunday 04:00-05:00 UTC
- **Deletion Protection:** Disabled (enable in production)
- **Storage Encryption:** Enabled

## Stack Outputs (Exported)

The following outputs are exported and can be imported by other stacks:

- `SSG-DatabaseEndpoint` - RDS PostgreSQL endpoint
- `SSG-DatabasePort` - RDS PostgreSQL port (5432)
- `SSG-DatabaseName` - Database name (nil_db)
- `SSG-DatabaseSecretArn` - ARN of Secrets Manager secret (contains username/password)
- `SSG-DatabaseInstanceId` - RDS instance identifier

## Verification Steps

Run these commands to verify everything is working:

```bash
cd infrastructure

# 1. Verify TypeScript compiles
npm run build

# 2. Verify CDK can synthesize
npx cdk synth SSGRdsStack

# 3. List stacks
npx cdk list
# Should show: SSGVpcStack, SSGRdsStack

# 4. View stack outputs
npx cdk synth SSGRdsStack | grep -A 10 "Outputs:"
```

## Migration from Existing RDS

To migrate data from your existing RDS instance (`nil-database`) to the new CDK-managed instance:

**See `PHASE3_MIGRATION_GUIDE.md` for complete step-by-step instructions.**

**Quick Summary:**
1. Create snapshot of existing RDS
2. Update `infrastructure/bin/infrastructure.ts` to pass `snapshotIdentifier`
3. Deploy RDS stack (restores from snapshot)
4. Verify data migration
5. Update application configuration
6. Delete old RDS instance

**Or use the automated script:**
```bash
cd infrastructure/scripts
./migrate-rds.sh
```

## Deployment

To deploy the RDS stack:

```bash
cd infrastructure

# Deploy VPC stack first (if not already deployed)
npx cdk deploy SSGVpcStack

# Build
npm run build

# Deploy RDS stack (creates new instance)
npx cdk deploy SSGRdsStack
```

**⚠️ Important:** 
- This creates a **new RDS instance** (not a reference)
- **Cost:** ~$15-20/month for db.t4g.micro
- Takes 10-15 minutes to create
- For migration, see `PHASE3_MIGRATION_GUIDE.md`

**To restore from snapshot (for migration):**
1. Edit `infrastructure/bin/infrastructure.ts`:
   ```typescript
   new RdsStack(app, 'SSGRdsStack', {
     env,
     vpcStack,
     snapshotIdentifier: 'your-snapshot-id', // Add this
     createNewInstance: true,
   });
   ```
2. Deploy: `npx cdk deploy SSGRdsStack`

## Next Steps: Phase 4

Once the RDS stack is deployed and security group is updated, we can proceed to **Phase 4: ECR Stack** where we'll:
- Create ECR repository for Spring Boot container images
- Configure lifecycle policies
- Set up image scanning

## Troubleshooting

### If synthesis fails:
1. Check that VPC stack is deployed first: `npx cdk deploy SSGVpcStack`
2. Verify TypeScript compiles: `npm run build`
3. Check that all imports are correct

### If RDS connection fails after security group update:
1. Verify security group allows inbound from ECS security group
2. Check that RDS is in the same VPC (or has proper peering)
3. Verify network ACLs allow traffic
4. Test connection from ECS task or EC2 instance in same VPC

### To view RDS details:
```bash
aws rds describe-db-instances \
  --db-instance-identifier nil-database \
  --query 'DBInstances[0].[DBInstanceIdentifier,Endpoint.Address,Endpoint.Port,VpcId,DBSubnetGroup.VpcId]' \
  --output table
```

