# Sign-Up Workflow Plan & Local Testing Guide

## Workflow Review & Feedback

### Your Proposed Workflow ✅
1. Athlete/Brand fills intake form → Saved as `PENDING`
2. Admin reviews in admin portal → Can accept/deny
3. If accepted → Clerk sends email invitation
4. User signs in via Clerk → User created in DB
5. User shows up as athlete/brand → Redirected to respective dashboard

### Feedback & Improvements

**✅ Good Plan Overall!** Here are some refinements:

1. **Clerk Email Invitations**: Clerk doesn't automatically send emails when you create a user. You'll need to:
   - Use Clerk's API to create an invitation (`POST /v1/invitations`)
   - Store the invitation ID/link in your intake request
   - Track invitation status (sent, accepted, expired)

2. **Linking Intake to User**: When a user signs up via Clerk invitation:
   - Match by email address
   - Link the `AthleteIntakeRequest` or `BrandIntakeRequest` to the new `User`
   - Create `AthleteProfile` or `BrandProfile` from intake data
   - Assign appropriate role (ATHLETE or BRAND)

3. **Status Flow**:
   ```
   PENDING → APPROVED → INVITED → ACCEPTED → ACTIVE
                ↓
            REJECTED
   ```

4. **Dashboard Routing**: After sign-in, check user's role:
   - If `hasRole("ATHLETE")` → `/athlete-dashboard`
   - If `hasRole("BRAND")` → `/brand-dashboard`
   - If `hasRole("ADMIN")` → `/admin`

---

## Local Testing Setup

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for Spring Boot)
- Node.js 18+ (for frontend)
- Clerk account with API keys

### Database Strategy: Local First, RDS Later

**✅ Recommended Approach**: Start with **local PostgreSQL** (Docker Compose)

**Why Local First?**
- ✅ Faster development & testing
- ✅ No network/security issues (RDS is in private subnet)
- ✅ Can test everything without AWS costs
- ✅ Easy to reset/wipe data during development
- ✅ Your `application.yml` already defaults to `localhost`

**When to Switch to RDS?**
- When you're ready to deploy to production
- When you need to test with production-like data
- When multiple developers need shared database

### Step 1: Start Local Database

```bash
cd backend
docker-compose up -d postgres
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `nil_db`
- User: `nil_user`
- Password: `nil_password`

**Verify it's running:**
```bash
docker ps  # Should see nil-postgres container
docker logs nil-postgres  # Check for any errors
```

### Step 2: Configure Environment Variables

Your Spring Boot app already defaults to `localhost`, so you can either:

**Option A: Use Defaults (Easiest)**
Just start the database - Spring Boot will connect automatically with defaults:
- `DB_HOST=localhost` (default)
- `DB_PORT=5432` (default)
- `DB_NAME=nil_db` (default)
- `DB_USERNAME=nil_user` (default - matches docker-compose ✅)
- `DB_PASSWORD=nil_password` (default - matches docker-compose ✅)

**Option B: Create `.env` file (Recommended)**

Create `backend/nil-api/.env`:
```env
# Database (matches docker-compose.yml)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nil_db
DB_USERNAME=nil_user
DB_PASSWORD=nil_password

# Clerk
CLERK_ISSUER=https://your-clerk-instance.clerk.accounts.dev
CLERK_JWKS_URL=https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json
CLERK_SECRET_KEY=sk_test_... # From Clerk Dashboard

# Server
SERVER_PORT=8080
```

**Note**: Spring Boot doesn't automatically load `.env` files. You can:
- Use environment variables: `export DB_USERNAME=nil_user`
- Use IDE run configuration to set env vars
- Or update `application.yml` defaults to match docker-compose

**Frontend** (`.env.local`):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Switching to RDS Later

When ready to use RDS, just change environment variables:
```env
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=nil_db
DB_USERNAME=your_rds_user
DB_PASSWORD=your_rds_password
```

No code changes needed! 🎉

### Step 3: Run Backend

```bash
cd backend/nil-api
./mvnw spring-boot:run
```

Or if using IntelliJ/Eclipse, run the main class.

### Step 4: Run Frontend

```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Phased Implementation Plan

### Phase 1: Admin Approval Flow ✅ (Start Here)

**Goal**: Admin can approve/reject intake requests

**Tasks**:
1. ✅ Admin portal already shows intake requests
2. ✅ Add approve/reject buttons in modals
3. ✅ Update status via API (`PUT /api/v1/admin/intake/athletes/{id}/status`)
4. ✅ Test: Submit intake → Admin approves → Status changes to "APPROVED"

**Files to Modify**:
- `src/pages/Admin.tsx` - Add approve/reject handlers
- `src/services/api.ts` - Add status update functions
- `backend/nil-api/src/main/java/com/nil/controller/AdminController.java` - Already has endpoint

**Test Checklist**:
- [ ] Submit athlete intake form
- [ ] See request in admin portal
- [ ] Click approve → Status changes to "APPROVED"
- [ ] Click reject → Status changes to "REJECTED"

---

### Phase 2: Clerk Invitation Integration

**Goal**: When admin approves, send Clerk invitation email

**Tasks**:
1. Add Clerk SDK dependency to backend
2. Create `ClerkInvitationService` to send invitations
3. Update admin approval endpoint to send invitation
4. Store invitation ID in intake request
5. Track invitation status

**New Files**:
- `backend/nil-api/src/main/java/com/nil/service/ClerkInvitationService.java`

**Dependencies**:
```xml
<dependency>
    <groupId>com.clerk</groupId>
    <artifactId>clerk-java</artifactId>
    <version>0.1.0</version>
</dependency>
```

**Implementation**:
```java
@Service
public class ClerkInvitationService {
    private final ClerkApiClient clerkClient;
    
    public String sendInvitation(String email, String firstName, String lastName) {
        // Create invitation via Clerk API
        // Return invitation ID
    }
}
```

**Test Checklist**:
- [ ] Admin approves request
- [ ] Invitation email sent to user
- [ ] Invitation ID stored in intake request
- [ ] Status updated to "INVITED"

---

### Phase 3: User Sign-Up & Profile Creation ✅ COMPLETE

**Goal**: When user accepts invitation and signs in, create profile

**Implementation**:
1. ✅ Updated `ClerkUserService.syncClerkUser()` to process intake requests on new user creation
2. ✅ Added `processIntakeRequests()` method that:
   - Checks for approved/invited athlete intake requests matching email
   - Checks for approved/invited brand intake requests matching email
   - Creates `AthleteProfile` from intake data if athlete found
   - Assigns correct role (ATHLETE or BRAND)
   - Updates intake status to "ACCEPTED"
3. ✅ Added `createAthleteProfileFromIntake()` method that maps intake data to profile:
   - Maps sport, position, school, bio, location, date of birth
   - Creates social account from primary social platform
   - Calculates initial profile completeness score
   - Sets defaults (isActive=true, isAcceptingDeals=true)

**Files Modified**:
- ✅ `backend/nil-api/src/main/java/com/nil/service/ClerkUserService.java`
  - Added intake request repositories
  - Added `processIntakeRequests()` method
  - Added `createAthleteProfileFromIntake()` method
  - Added `calculateInitialCompleteness()` helper
  - Added `convertToSocialPlatform()` helper

**Test Checklist**:
- [ ] User receives invitation email (Phase 2 ✅)
- [ ] User clicks link and signs up
- [ ] User profile created from intake data
- [ ] User assigned correct role
- [ ] Intake request status updated to "ACCEPTED"

---

### Phase 4: Dashboard Routing

**Goal**: Redirect users to correct dashboard after sign-in

**Tasks**:
1. Create route guard component
2. Check user role after Clerk authentication
3. Redirect based on role:
   - ATHLETE → `/athlete-dashboard`
   - BRAND → `/brand-dashboard`
   - ADMIN → `/admin`

**Files to Create/Modify**:
- `src/components/ProtectedRoute.tsx` (or enhance existing)
- `src/App.tsx` - Add routing logic
- `src/pages/AthleteDashboard.tsx` (if doesn't exist)

**Test Checklist**:
- [ ] Athlete signs in → Redirected to athlete dashboard
- [ ] Brand signs in → Redirected to brand dashboard
- [ ] Admin signs in → Redirected to admin portal

---

## Database Schema Considerations

### New Fields Needed

**AthleteIntakeRequest**:
```sql
ALTER TABLE athlete_intake_requests 
ADD COLUMN clerk_invitation_id VARCHAR(255),
ADD COLUMN invitation_sent_at TIMESTAMP,
ADD COLUMN user_id UUID REFERENCES users(id);
```

**BrandIntakeRequest**:
```sql
ALTER TABLE brand_intake_requests 
ADD COLUMN clerk_invitation_id VARCHAR(255),
ADD COLUMN invitation_sent_at TIMESTAMP,
ADD COLUMN user_id UUID REFERENCES users(id);
```

---

## API Endpoints Summary

### Existing (✅ Already Implemented)
- `POST /api/v1/intake/athlete` - Submit athlete intake
- `POST /api/v1/intake/brand` - Submit brand intake
- `GET /api/v1/admin/intake/athletes` - Get athlete requests
- `GET /api/v1/admin/intake/brands` - Get brand requests
- `PUT /api/v1/admin/intake/athletes/{id}/status` - Update status

### New (🔨 To Implement)
- `POST /api/v1/admin/intake/athletes/{id}/approve` - Approve & send invitation
- `POST /api/v1/admin/intake/brands/{id}/approve` - Approve & send invitation
- `GET /api/v1/user/me` - Get current user with role
- `GET /api/v1/athlete/profile` - Get athlete profile (if exists)
- `GET /api/v1/brand/profile` - Get brand profile (if exists)

---

## Testing Workflow

### End-to-End Test Scenario

1. **Submit Intake**:
   ```
   POST /api/v1/intake/athlete
   → Status: PENDING
   ```

2. **Admin Approves**:
   ```
   PUT /api/v1/admin/intake/athletes/{id}/status
   Body: { "status": "APPROVED" }
   → Clerk invitation sent
   → Status: INVITED
   ```

3. **User Signs Up**:
   ```
   User clicks invitation link
   → Creates Clerk account
   → First API call with JWT
   → Backend creates User + AthleteProfile
   → Status: ACCEPTED
   ```

4. **User Signs In**:
   ```
   User signs in via Clerk
   → JWT contains user info
   → Frontend checks role
   → Redirects to /athlete-dashboard
   ```

---

## Next Steps

1. **Start with Phase 1** - Get admin approval working locally
2. **Test thoroughly** - Submit forms, approve, verify status changes
3. **Move to Phase 2** - Add Clerk invitation integration
4. **Continue incrementally** - One phase at a time, test before moving on

---

## Troubleshooting

### Database Connection Issues
- Check Docker container is running: `docker ps`
- Verify credentials in `.env` match `docker-compose.yml`
- Check logs: `docker logs nil-postgres`

### Clerk Issues
- Verify API keys are correct
- Check Clerk dashboard for invitation status
- Ensure webhook URLs are configured (if using webhooks)

### CORS Issues
- Backend CORS config should allow `http://localhost:5173`
- Check `SecurityConfig.java` for allowed origins

---

## Questions?

If you encounter issues:
1. Check logs (backend and frontend)
2. Verify environment variables
3. Test API endpoints with Postman/curl
4. Check database directly via pgAdmin (port 5050)

