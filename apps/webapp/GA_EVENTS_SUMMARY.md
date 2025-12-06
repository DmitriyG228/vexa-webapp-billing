# Google Analytics Events Tracking Summary

This document lists all events tracked in the webapp for Google Analytics.

## Event Categories

### Conversion Events
These are high-value events that indicate user intent or completion:

1. **`signup`**
   - **Location**: `SignupTracker.tsx`
   - **Trigger**: When a new user successfully signs up
   - **Params**: 
     - `event_category: 'conversion'`
     - `event_label: 'developer_signup'`
     - `value: 1`

2. **`api_key_generated`**
   - **Location**: `app/dashboard/api-keys/page.tsx`
   - **Trigger**: When user creates a new API key
   - **Params**:
     - `event_category: 'conversion'`
     - `event_label: 'api_key'`
     - `value: 1`

3. **`enterprise_inquiry`**
   - **Location**: `app/pricing/components/GetStartedButton.tsx`
   - **Trigger**: When user clicks enterprise "Talk to Founder" button
   - **Params**:
     - `event_category: 'conversion'`
     - `event_label: 'enterprise_contact'`
     - `value: 100`

4. **`goal_completion`**
   - **Location**: `lib/analytics.ts` (helper functions)
   - **Sub-events**:
     - `goal_name: 'transcript_confirmation'` - User confirms they see transcripts
     - `goal_name: 'transcript_not_visible'` - User reports they don't see transcripts
     - `goal_name: 'api_key_created'` - API key creation (via helper function)

### Engagement Events
These track user interactions and engagement:

5. **`signup_button_click`**
   - **Location**: `app/page.tsx`
   - **Trigger**: When user clicks signup button on homepage
   - **Params**:
     - `location: 'home_cta'`

6. **`discord_join_click`**
   - **Location**: `app/page.tsx`, `app/verification-success/page.tsx`
   - **Trigger**: When user clicks Discord join link
   - **Params**:
     - `location: 'home_cta'` or `location: 'verification_success'`

7. **`github_star_click`**
   - **Location**: `components/GitHubStarLink.tsx`
   - **Trigger**: When user clicks GitHub star link
   - **Params**:
     - `event_category: 'engagement'`
     - `event_label: 'github_star'`
     - `value: 1`

8. **`email_verification_success`**
   - **Location**: `app/verification-success/page.tsx`
   - **Trigger**: When user successfully verifies email
   - **Params**: None

### Page View Events

9. **`page_view`**
   - **Location**: `app/page.tsx`, `components/analytics/PageViewTracker.tsx`
   - **Trigger**: When page loads or route changes
   - **Params**:
     - `page: 'home'` (on homepage)

### Test Events

10. **`ga_test_event`**
    - **Location**: `app/ga-test/page.tsx`
    - **Trigger**: Manual test button click
    - **Params**:
      - `test_value: 'test123'`

## Helper Functions

Located in `lib/analytics.ts`:

- `trackTranscriptConfirmation()` - Tracks when user confirms seeing transcripts
- `trackTranscriptNotVisible()` - Tracks when user reports not seeing transcripts
- `trackApiKeyCreation()` - Tracks API key creation (alternative to direct event)

## Logging

All events are logged to the browser console with enhanced visibility:

### Event Logging
- **📊 GA Event [timestamp]** - When event is successfully tracked via gtag or dataLayer
  - Color: Blue (#4285f4)
  - Includes: Event name, parameters, timestamp, and method used
- **📊 GA not loaded [timestamp]** - When GA is not available (warning)
  - Color: Red (#ea4335)
- **📊 Server-side [timestamp]** - When called server-side
  - Color: Gray (#9aa0a6)

### Click Logging
- **🖱️ [CLICK] {description}** - When clickable elements are interacted with
  - Added to all major click handlers for visibility
  - Logs appear before the GA event is tracked

### Goal Completion Logging
- **🎯 Goal Completion [timestamp]** - When goal completion functions are called
  - Color: Yellow (#fbbc04)
  - Includes: Goal description and timestamp

### Page View Logging
- **📊 GA Page View [timestamp]** - When page views are tracked
  - Color: Blue (#4285f4)
  - Includes: Path, title, and timestamp

### Error Logging
- **❌ GA Error [timestamp]** - When tracking errors occur
  - Color: Red (#ea4335)
  - Includes: Event name and error details

## Implementation Notes

- Events are tracked using `window.gtag()` when available
- Falls back to `window.dataLayer.push()` if gtag is not available
- All tracking is wrapped in try-catch to prevent errors from breaking the app
- Console logs are always emitted for debugging, even when GA is not loaded

