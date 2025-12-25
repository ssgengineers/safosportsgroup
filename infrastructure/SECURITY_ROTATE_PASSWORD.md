# ⚠️ URGENT: Rotate Database Password

## Issue
The database password was accidentally committed to the git repository in commit `d49828b`. While we've removed it from the current files, **it still exists in git history**.

## Immediate Action Required

### Step 1: Rotate the Database Password

The current password needs to be rotated immediately. Here's how:

```bash
# 1. Get the secret ARN
SECRET_ARN=$(aws cloudformation describe-stacks \
  --stack-name SSGRdsStack \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseSecretArn'].OutputValue" \
  --output text \
  --region us-east-2)

# 2. Generate a new password
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# 3. Update the secret in Secrets Manager
aws secretsmanager update-secret \
  --secret-id "$SECRET_ARN" \
  --secret-string "{\"username\":\"nil_admin\",\"password\":\"$NEW_PASSWORD\"}" \
  --region us-east-2

# 4. Update RDS master password
aws rds modify-db-instance \
  --db-instance-identifier ssgrdsstack-databaseb269d8bb-kskuapfdvihs \
  --master-user-password "$NEW_PASSWORD" \
  --apply-immediately \
  --region us-east-2
```

### Step 2: Update Application Configuration

After rotating the password, update your application to use the new password from Secrets Manager (the scripts already do this automatically).

### Step 3: Remove from Git History (Optional but Recommended)

If this is a private repository, you may want to remove the password from git history:

```bash
# WARNING: This rewrites git history. Only do this if:
# 1. Repository is private
# 2. You coordinate with your team
# 3. Everyone needs to re-clone after this

git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch infrastructure/ENV_VARIABLES.md backend/nil-api/run-with-new-db.sh DATABASE_QUERY_GUIDE.md infrastructure/scripts/test-db-connection.sh infrastructure/scripts/setup-env.sh" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team first!)
git push origin --force --all
```

**OR** if using BFG Repo-Cleaner (safer):
```bash
# Install BFG: brew install bfg
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 4: Verify

1. Test database connection with new password
2. Verify application works with new password
3. Check that no passwords are in current files

## Prevention

Going forward:
- ✅ All scripts now use Secrets Manager
- ✅ Sensitive files are in .gitignore
- ✅ Documentation references Secrets Manager instead of hardcoded values

## Current Status

- ✅ Passwords removed from current files
- ✅ Scripts updated to use Secrets Manager
- ✅ .gitignore updated
- ⚠️ **Password rotation required**
- ⚠️ **Git history cleanup recommended (if private repo)**

