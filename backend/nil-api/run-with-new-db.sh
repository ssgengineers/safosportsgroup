#!/bin/bash

# Run Spring Boot with new CDK-managed RDS database

export DB_HOST=ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=nil_db
export DB_USERNAME=nil_admin
export DB_PASSWORD="|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a"
export SPRING_PROFILES_ACTIVE=prod
export CLERK_ISSUER=https://usable-kite-59.clerk.accounts.dev
export CLERK_JWKS_URL=https://usable-kite-59.clerk.accounts.dev/.well-known/jwks.json

echo "✅ Environment variables set for new RDS database"
echo "Database: $DB_HOST"
echo ""
echo "Starting Spring Boot application..."
echo ""

./mvnw spring-boot:run

