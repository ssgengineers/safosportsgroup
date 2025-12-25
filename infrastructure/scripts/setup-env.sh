#!/bin/bash

# Setup Environment Variables for New RDS Database
# Run this script to set up your environment for the new CDK-managed RDS instance

set -e

echo "Setting up environment variables for new RDS database..."

# New RDS Connection Details
export DB_HOST=ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=nil_db
export DB_USERNAME=nil_admin
# Get password from Secrets Manager
SECRET_ARN=$(aws cloudformation describe-stacks \
  --stack-name SSGRdsStack \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue" \
  --output text \
  --region us-east-2)

export DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ARN" \
  --query SecretString \
  --output text | jq -r .password)

# Spring Profile
export SPRING_PROFILES_ACTIVE=prod

# Clerk (if needed)
export CLERK_ISSUER=https://usable-kite-59.clerk.accounts.dev
export CLERK_JWKS_URL=https://usable-kite-59.clerk.accounts.dev/.well-known/jwks.json

echo "✅ Environment variables set!"
echo ""
echo "Database Host: $DB_HOST"
echo "Database Name: $DB_NAME"
echo "Username: $DB_USERNAME"
echo ""
echo "To test connection:"
echo "  psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USERNAME -d \$DB_NAME"
echo ""
echo "To run Spring Boot app:"
echo "  cd backend/nil-api && ./mvnw spring-boot:run"
echo ""
echo "Note: These variables are set for this shell session only."
echo "To make them permanent, add them to your ~/.bashrc or ~/.zshrc"

