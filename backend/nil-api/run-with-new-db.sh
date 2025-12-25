#!/bin/bash

# Run Spring Boot with new CDK-managed RDS database

# Get password from Secrets Manager
SECRET_ARN=$(aws cloudformation describe-stacks \
  --stack-name SSGRdsStack \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue" \
  --output text \
  --region us-east-2)

export DB_HOST=ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=nil_db
export DB_USERNAME=nil_admin
export DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ARN" \
  --query SecretString \
  --output text | jq -r .password)
export SPRING_PROFILES_ACTIVE=prod
export CLERK_ISSUER=https://usable-kite-59.clerk.accounts.dev
export CLERK_JWKS_URL=https://usable-kite-59.clerk.accounts.dev/.well-known/jwks.json

echo "✅ Environment variables set for new RDS database"
echo "Database: $DB_HOST"
echo ""
echo "Starting Spring Boot application..."
echo ""

./mvnw spring-boot:run

