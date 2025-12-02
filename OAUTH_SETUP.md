# Google OAuth Setup Instructions

## OAuth Client Configuration

**Client ID**: `733104961366-n4c2v20o0ecieqnael49vh37uvaqhd6c.apps.googleusercontent.com`

✅ Already configured in `.env.dev` and Secret Manager

## Required: Add Redirect URI

You need to add the redirect URI for your deployed webapp to the OAuth client configuration.

### Redirect URI to Add:

```
https://dev-webapp-leav4o4omq-uc.a.run.app/api/auth/callback/google
```

### How to Add the Redirect URI:

1. **Find Your OAuth Client**:
   - The client ID `733104961366` suggests it might be in a different GCP project
   - Check which project owns this OAuth client
   
2. **Add the Redirect URI**:
   
   **Option A: If client is in the current project (spry-pipe-425611-c4)**
   - Visit: https://console.cloud.google.com/apis/credentials?project=spry-pipe-425611-c4
   - Click on the OAuth 2.0 Client ID
   - Under "Authorized redirect URIs", click "ADD URI"
   - Add: `https://dev-webapp-leav4o4omq-uc.a.run.app/api/auth/callback/google`
   - Click "SAVE"

   **Option B: If client is in a different project**
   - Go to the Google Cloud Console for that project
   - Navigate to APIs & Services → Credentials
   - Find the OAuth client (search for `733104961366`)
   - Add the redirect URI as above

3. **Verify Configuration**:
   ```bash
   # Test the auth flow
   open https://dev-webapp-leav4o4omq-uc.a.run.app
   
   # Try signing in with Google
   # It should redirect to Google login and back successfully
   ```

## Production Setup

When deploying to production, you'll need to add the production redirect URI:

```
https://PROD_WEBAPP_URL/api/auth/callback/google
```

Follow the same steps above with the production URL.

## Troubleshooting

### "Redirect URI mismatch" Error

This means the redirect URI isn't added to the OAuth client:
- Double-check the URI matches exactly (including https://)
- Ensure there are no trailing slashes
- Wait a few minutes after adding (can take time to propagate)

### "Access blocked" or "This app isn't verified"

For development:
- Click "Advanced" → "Go to [app name] (unsafe)"
- This is normal for OAuth apps in development

For production:
- Complete OAuth verification process in Google Cloud Console
- See: https://support.google.com/cloud/answer/9110914

### Can't Find OAuth Client

The client might be in a different GCP project:
- Check project `733104961366` (matches the client ID prefix)
- Ask team members which project contains the OAuth client
- Or create a new OAuth client in the current project

## Current Status

✅ OAuth credentials configured in secrets  
✅ Services deployed and running  
⏳ Need to add redirect URI to OAuth client  

Once the redirect URI is added, your Google Sign-In will work!

