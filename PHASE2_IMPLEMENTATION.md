# Phase 2: Clerk Invitation Integration - COMPLETE ✅

## What Was Implemented

### 1. ClerkInvitationService ✅
- Created service to send email invitations via Clerk API
- Uses HTTP client to call Clerk's invitation endpoint
- Handles errors gracefully (logs warnings if secret key not configured)
- Returns invitation ID for tracking

**File**: `backend/nil-api/src/main/java/com/nil/service/ClerkInvitationService.java`

### 2. Database Schema Updates ✅
Added fields to track invitations:
- `clerk_invitation_id` - Stores the Clerk invitation ID
- `invitation_sent_at` - Timestamp when invitation was sent

**Updated Entities**:
- `AthleteIntakeRequest.java`
- `BrandIntakeRequest.java`

### 3. AdminController Integration ✅
- Updated `updateAthleteStatus()` to send invitation when status = "APPROVED"
- Updated `updateBrandStatus()` to send invitation when status = "APPROVED"
- Stores invitation ID and timestamp in database
- Logs invitation status for debugging

### 4. Configuration ✅
- Added `clerk.secret-key` to `application.yml`
- Reads from `CLERK_SECRET_KEY` environment variable

---

## Setup Required

### Add Clerk Secret Key

You need to add your Clerk secret key to your environment:

**Option 1: Environment Variable**
```bash
export CLERK_SECRET_KEY=sk_test_...
```

**Option 2: Add to .env file** (if using one)
```env
CLERK_SECRET_KEY=sk_test_...
```

**Option 3: Update application.yml directly** (for local testing only)
```yaml
clerk:
  secret-key: sk_test_...
```

**Where to find your Clerk Secret Key:**
1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to "API Keys" section
4. Copy the "Secret key" (starts with `sk_test_` or `sk_live_`)

---

## How It Works

### Flow:
1. Admin clicks "Approve" in admin portal
2. Frontend calls `PUT /api/v1/admin/intake/athletes/{id}/status` with `{"status": "APPROVED"}`
3. Backend:
   - Updates status to "APPROVED"
   - Calls `ClerkInvitationService.sendInvitation()`
   - Clerk API sends email invitation to user
   - Stores invitation ID in database
4. User receives email from Clerk
5. User clicks link and signs up
6. Status is now "APPROVED" with invitation tracked

---

## Testing

### Test Without Clerk Key (Safe Mode)
If `CLERK_SECRET_KEY` is not set:
- ✅ Status still updates to "APPROVED"
- ⚠️ Invitation is skipped (logged as warning)
- ✅ App continues to work normally

### Test With Clerk Key
1. Add `CLERK_SECRET_KEY` to environment
2. Restart Spring Boot
3. Approve a request in admin portal
4. Check logs for: `"Clerk invitation sent successfully"`
5. Check email inbox for invitation
6. Verify invitation ID is stored in database

---

## Database Migration

The new fields will be automatically created by Hibernate (`ddl-auto: update`).

If you want to manually verify:
```sql
-- Check athlete intake requests
SELECT id, email, status, clerk_invitation_id, invitation_sent_at 
FROM athlete_intake_requests 
WHERE status = 'APPROVED';

-- Check brand intake requests
SELECT id, email, status, clerk_invitation_id, invitation_sent_at 
FROM brand_intake_requests 
WHERE status = 'APPROVED';
```

---

## Next Steps: Phase 3

Phase 3 will handle:
- User sign-up after accepting invitation
- Linking intake request to User when they sign in
- Creating AthleteProfile/BrandProfile from intake data
- Assigning roles (ATHLETE/BRAND)

---

## Troubleshooting

### Invitation Not Sending?
1. Check `CLERK_SECRET_KEY` is set correctly
2. Check Spring Boot logs for errors
3. Verify Clerk API key has invitation permissions
4. Check email isn't in spam folder

### Status Updates But No Invitation?
- Check logs for: `"Clerk secret key not configured"`
- Add `CLERK_SECRET_KEY` environment variable
- Restart Spring Boot

### Database Fields Missing?
- Hibernate should auto-create them
- Check logs for table creation
- Or manually run migration if needed

