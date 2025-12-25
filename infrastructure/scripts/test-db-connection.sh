#!/bin/bash

# Test connection to new RDS database using AWS RDS Data API or direct connection test

set -e

DB_HOST="ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="nil_db"
DB_USERNAME="nil_admin"
DB_PASSWORD='|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a'

echo "Testing connection to new RDS database..."
echo "Host: $DB_HOST"
echo ""

# Check if database is available
echo "1. Checking database status..."
STATUS=$(aws rds describe-db-instances \
  --db-instance-identifier ssgrdsstack-databaseb269d8bb-kskuapfdvihs \
  --region us-east-2 \
  --query 'DBInstances[0].DBInstanceStatus' \
  --output text)

if [ "$STATUS" = "available" ]; then
  echo "✅ Database is available"
else
  echo "❌ Database status: $STATUS"
  exit 1
fi

echo ""
echo "2. Database connection details:"
echo "   Endpoint: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USERNAME"
echo ""

# Test with psql if available
if command -v psql &> /dev/null; then
  echo "3. Testing connection with psql..."
  export PGPASSWORD='|8z7:ByM*H:k$Xa]mFq2S3y&+$(_Zy%a'
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT version();" &> /dev/null; then
    echo "✅ Connection successful!"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -d "$DB_NAME" -c "SELECT version();"
  else
    echo "❌ Connection failed"
    exit 1
  fi
else
  echo "3. psql not installed. Skipping direct connection test."
  echo "   Install PostgreSQL client to test: brew install postgresql"
  echo ""
  echo "   Or test with Spring Boot application instead."
fi

echo ""
echo "✅ Database connection test complete!"
echo ""
echo "Next steps:"
echo "  1. Run Spring Boot app: cd backend/nil-api && ./run-with-new-db.sh"
echo "  2. Check health endpoint: http://localhost:8080/actuator/health"
echo "  3. Once verified, delete old database to save costs"

