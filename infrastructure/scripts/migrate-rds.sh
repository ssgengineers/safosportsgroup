#!/bin/bash

# RDS Migration Script
# This script migrates data from existing RDS instance to new CDK-managed instance

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
OLD_INSTANCE_ID="nil-database"
NEW_INSTANCE_ID="ssgrdsstack-database"  # Will be updated after deployment
REGION="us-east-2"
SNAPSHOT_ID="${OLD_INSTANCE_ID}-migration-$(date +%Y%m%d-%H%M%S)"

echo -e "${GREEN}=== RDS Migration Script ===${NC}"
echo ""

# Step 1: Create snapshot of existing RDS
echo -e "${YELLOW}Step 1: Creating snapshot of existing RDS instance...${NC}"
echo "Snapshot ID: ${SNAPSHOT_ID}"

aws rds create-db-snapshot \
  --db-instance-identifier ${OLD_INSTANCE_ID} \
  --db-snapshot-identifier ${SNAPSHOT_ID} \
  --region ${REGION}

echo -e "${GREEN}Snapshot creation initiated. Waiting for completion...${NC}"
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier ${SNAPSHOT_ID} \
  --region ${REGION}

echo -e "${GREEN}✓ Snapshot created successfully!${NC}"
echo ""

# Step 2: Get VPC and subnet information
echo -e "${YELLOW}Step 2: Getting VPC and subnet information...${NC}"

VPC_ID=$(aws cloudformation describe-stacks \
  --stack-name SSGVpcStack \
  --query "Stacks[0].Outputs[?OutputKey=='VpcId'].OutputValue" \
  --output text \
  --region ${REGION})

PRIVATE_SUBNET_IDS=$(aws cloudformation describe-stacks \
  --stack-name SSGVpcStack \
  --query "Stacks[0].Outputs[?OutputKey=='PrivateSubnetIds'].OutputValue" \
  --output text \
  --region ${REGION})

SECURITY_GROUP_ID=$(aws cloudformation describe-stacks \
  --stack-name SSGVpcStack \
  --query "Stacks[0].Outputs[?OutputKey=='RdsSecurityGroupId'].OutputValue" \
  --output text \
  --region ${REGION})

echo "VPC ID: ${VPC_ID}"
echo "Private Subnet IDs: ${PRIVATE_SUBNET_IDS}"
echo "Security Group ID: ${SECURITY_GROUP_ID}"
echo ""

# Step 3: Deploy new RDS stack with snapshot
echo -e "${YELLOW}Step 3: Deploying new RDS stack with snapshot restore...${NC}"
echo -e "${YELLOW}Note: Update infrastructure/bin/infrastructure.ts to pass snapshotIdentifier${NC}"
echo ""

# Step 4: Wait for new instance to be available
echo -e "${YELLOW}Step 4: Waiting for new RDS instance to be available...${NC}"
echo "This may take 10-15 minutes..."

NEW_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name SSGRdsStack \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" \
  --output text \
  --region ${REGION} 2>/dev/null || echo "")

if [ -z "$NEW_ENDPOINT" ]; then
  echo -e "${RED}Error: New RDS instance not found. Please deploy SSGRdsStack first.${NC}"
  exit 1
fi

aws rds wait db-instance-available \
  --db-instance-identifier ${NEW_INSTANCE_ID} \
  --region ${REGION}

echo -e "${GREEN}✓ New RDS instance is available!${NC}"
echo "New endpoint: ${NEW_ENDPOINT}"
echo ""

# Step 5: Verify data
echo -e "${YELLOW}Step 5: Verification${NC}"
echo "Please verify the data in the new instance:"
echo "  - Connect to: ${NEW_ENDPOINT}"
echo "  - Database: nil_db"
echo "  - Username: nil_admin"
echo "  - Password: Check AWS Secrets Manager"
echo ""

# Step 6: Update application configuration
echo -e "${YELLOW}Step 6: Update Application Configuration${NC}"
echo "Update your application's DB_HOST environment variable to:"
echo "  ${NEW_ENDPOINT}"
echo ""

# Step 7: Final instructions
echo -e "${GREEN}=== Migration Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Verify data integrity in new instance"
echo "2. Update application DB_HOST to: ${NEW_ENDPOINT}"
echo "3. Test application with new database"
echo "4. Once verified, delete old RDS instance:"
echo "   aws rds delete-db-instance --db-instance-identifier ${OLD_INSTANCE_ID} --skip-final-snapshot"
echo ""

