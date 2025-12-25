#!/bin/bash

# Script to safely delete the old RDS database
# ⚠️ WARNING: This will delete the old database. Only run after verifying new database works!

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

OLD_INSTANCE_ID="nil-database"
REGION="us-east-2"
SNAPSHOT_ID="nil-database-final-backup-$(date +%Y%m%d)"

echo -e "${YELLOW}⚠️  WARNING: This will delete the old RDS database!${NC}"
echo ""
echo "Old Instance: ${OLD_INSTANCE_ID}"
echo "Final Snapshot: ${SNAPSHOT_ID}"
echo ""
read -p "Have you verified the new database works? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Aborted. Please verify the new database works first.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Creating final snapshot...${NC}"
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

echo -e "${YELLOW}Step 2: Deleting old database instance...${NC}"
read -p "Delete with final snapshot? (yes/no): " delete_confirm

if [ "$delete_confirm" == "yes" ]; then
    aws rds delete-db-instance \
      --db-instance-identifier ${OLD_INSTANCE_ID} \
      --final-db-snapshot-identifier ${SNAPSHOT_ID} \
      --region ${REGION}
else
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Deletion initiated!${NC}"
echo ""
echo "The database will be deleted. This may take a few minutes."
echo "You can check status with:"
echo "  aws rds describe-db-instances --db-instance-identifier ${OLD_INSTANCE_ID} --region ${REGION}"
echo ""
echo -e "${GREEN}Cost savings: ~\$15-20/month${NC}"

