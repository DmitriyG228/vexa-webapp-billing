# User Auto-Creation Flow

## How It Works

### Step-by-Step Flow:

1. **User signs in via NextAuth** (Google OAuth) in the webapp
   - User visits `/dashboard/transcription`
   - NextAuth session provides: `email` and optionally `name`

2. **Frontend calls Next.js API route** (`/api/transcription/api-key`)
   - Route: `apps/webapp/app/api/transcription/api-key/route.ts`
   - Gets authenticated session from NextAuth
   - Extracts `email` and `name` from session

3. **Next.js API route calls Transcription Gateway**
   - Function: `getOrCreateApiToken()` in `lib/transcription-client.ts`
   - Makes GET request to: `https://transcription.vexa.ai/admin/user-token?email=...&name=...`
   - Includes header: `X-Admin-Key: <TRANSCRIPTION_ADMIN_API_KEY>`

4. **Transcription Gateway endpoint** (`/admin/user-token`)
   - Location: `vexa-transcription-gateway/main.py` lines 325-410
   - **Verifies admin key** via `verify_admin_key()` dependency
   - **Checks if user exists** by email:
     ```python
     result = await db.execute(select(User).where(User.email == email))
     user = result.scalar_one_or_none()
     ```
   
5. **Auto-Creation Logic** (if user doesn't exist):
   ```python
   if not user:
       # Create new user
       user = User(email=email, name=name)
       db.add(user)
       await db.flush()  # Gets user.id without committing
       
       # Add free minutes
       free_minutes = await add_free_minutes(user.id, db)
       
       # Create API token (this also commits the user)
       api_token = APIToken(token=token, user_id=user.id)
       db.add(api_token)
       await db.commit()  # Commits both user and token
   ```

6. **Returns user data** including:
   - `user_id`
   - `email`
   - `name`
   - `api_token`
   - `balance_minutes`
   - `token_created_at`
   - `is_active`

## Potential Issues

### Issue 1: Production Code Not Updated
The error message `"User with email '2280905@gmail.com' not found"` **does not exist** in the current codebase. This suggests:
- Production server at `https://transcription.vexa.ai` may be running **old code** that doesn't have auto-creation
- The endpoint might be returning 404 from a different code path

### Issue 2: Database Commit Timing
The current code uses `flush()` to get the user ID, then commits later. This should work, but if `add_free_minutes()` needs the user to be committed, there could be an issue.

### Issue 3: Admin Key Verification
If the `X-Admin-Key` header is missing or incorrect, the endpoint returns 403, not 404. So the 404 suggests the endpoint is being reached but returning a different error.

## How to Verify

1. **Check production logs** at `https://transcription.vexa.ai` to see:
   - Is the `/admin/user-token` endpoint being called?
   - What error is actually being returned?
   - Is the admin key being verified?

2. **Test the endpoint directly**:
   ```bash
   curl -X GET "https://transcription.vexa.ai/admin/user-token?email=test@example.com" \
     -H "X-Admin-Key: <YOUR_ADMIN_KEY>"
   ```

3. **Verify deployment**: Ensure the latest code with auto-creation logic (lines 352-361) is deployed to production.

## Expected Behavior

When a new user (not in the database) calls the endpoint:
- ✅ User should be **automatically created**
- ✅ Free minutes should be **added**
- ✅ API token should be **generated**
- ✅ User data should be **returned** (not 404)

The 404 error suggests the production server doesn't have this auto-creation logic deployed yet.
