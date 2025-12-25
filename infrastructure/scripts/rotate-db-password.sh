#!/bin/bash

# Script to rotate RDS database password after security exposure
# Run this immediately after password was exposed in git

set -e

REGION="us-east-2"
INSTANCE_ID="ssgrdsstack-databaseb269d8bb-kskuapfdvihs"

echo "⚠️  Rotating RDS database password..."
echo ""

# Get the secret ARN
echo "1. Getting Secrets Manager ARN..."
SECRET_ARN=$(aws cloudformation describe-stacks \
  --stack-name SSGRdsStack \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue" \
  --output text \
  --region ${REGION})

if [ -z "$SECRET_ARN" ]; then
  echo "❌ Error: Could not find secret ARN"
  exit 1
fi

echo "   Secret ARN: $SECRET_ARN"
echo ""

# Generate a new secure password
echo "2. Generating new password..."
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "   ✅ New password generated"
echo ""

# Update Secrets Manager
echo "3. Updating password in Secrets Manager..."
aws secretsmanager update-secret \
  --secret-id "$SECRET_ARN" \
  --secret-string "{\"username\":\"nil_admin\",\"password\":\"$NEW_PASSWORD\",\"dbname\":\"nil_db\",\"engine\":\"postgres\",\"port\":5432,\"dbInstanceIdentifier\":\"$INSTANCE_ID\",\"host\":\"$INSTANCE_ID.chae2y8a6x43.us-east-2.rds.amazonaws.com\"}" \
  --region ${REGION} > /dev/null

echo "   ✅ Secrets Manager updated"
echo ""

# Update RDS master password
echo "4. Updating RDS master password..."
aws rds modify-db-instance \
  --db-instance-identifier "$INSTANCE_ID" \
  --master-user-password "$NEW_PASSWORD" \
  --apply-immediately \
  --region ${REGION} > /dev/null

echo "   ✅ RDS password update initiated"
echo ""

echo "⏳ Waiting for RDS modification to complete (this may take 5-10 minutes)..."
aws rds wait db-instance-available \
  --db-instance-identifier "$INSTANCE_ID" \
  --region ${REGION}

echo ""
echo "✅ Password rotation complete!"
echo ""
echo "New password has been:"
echo "  - Updated in AWS Secrets Manager"
echo "  - Updated in RDS instance"
echo ""
echo "⚠️  Important:"
echo "  - Update any applications using the old password"
echo "  - All scripts now automatically use Secrets Manager"
echo "  - Consider cleaning git history (see SECURITY_ROTATE_PASSWORD.md)"

