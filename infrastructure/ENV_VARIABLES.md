# Environment Variables for Application

## Database Configuration (CDK-Managed RDS)

```bash
# RDS Connection
export DB_HOST=ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com
export DB_PORT=5432
export DB_NAME=nil_db
export DB_USERNAME=nil_admin
export DB_PASSWORD="<GET_FROM_SECRETS_MANAGER>"
```

**Get password from Secrets Manager:**
```bash
aws secretsmanager get-secret-value \
  --secret-id <SECRET_ARN> \
  --query SecretString \
  --output text | jq -r .password
```

## Clerk Authentication

```bash
export CLERK_ISSUER=https://usable-kite-59.clerk.accounts.dev
export CLERK_JWKS_URL=https://usable-kite-59.clerk.accounts.dev/.well-known/jwks.json
```

## Spring Profile

```bash
export SPRING_PROFILES_ACTIVE=prod
```

## For ECS Task Definition

When deploying to ECS, use AWS Secrets Manager instead of hardcoding:

```json
{
  "environment": [
    {
      "name": "DB_HOST",
      "value": "ssgrdsstack-databaseb269d8bb-kskuapfdvihs.chae2y8a6x43.us-east-2.rds.amazonaws.com"
    },
    {
      "name": "DB_PORT",
      "value": "5432"
    },
    {
      "name": "DB_NAME",
      "value": "nil_db"
    },
    {
      "name": "DB_USERNAME",
      "value": "nil_admin"
    }
  ],
  "secrets": [
    {
      "name": "DB_PASSWORD",
      "valueFrom": "<SECRET_ARN>:password::"
    }
  ]
}
```

Get the secret ARN:
```bash
aws cloudformation describe-stacks \
  --stack-name SSGRdsStack \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue" \
  --output text \
  --region us-east-2
```

## Security Note

⚠️ **Important:** 
- Never commit `.env` files with real credentials
- Use AWS Secrets Manager for production
- Rotate passwords regularly
- See `RDS_CONNECTION_INFO.md` for full connection details

