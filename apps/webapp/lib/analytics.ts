/**
 * Google Analytics utility functions with improved reliability
 */

/**
 * Helper function to format timestamp for logs
 */
function getLogTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  });
}

/**
 * Enhanced console log for GA events with better visibility
 */
function logGAEvent(eventName: string, eventParams?: Record<string, string | number | boolean>, method?: string): void {
  const timestamp = getLogTimestamp();
  const methodLabel = method ? ` [${method}]` : '';
  const paramsStr = eventParams ? `\n   Params: ${JSON.stringify(eventParams, null, 2)}` : '';
  
  console.log(
    `%c📊 GA Event${methodLabel} [${timestamp}]`,
    'color: #4285f4; font-weight: bold; font-size: 12px;',
    `\n   Event: ${eventName}${paramsStr}`
  );
}

/**
 * Track a custom event in Google Analytics
 * @param eventName The name of the event to track
 * @param eventParams Optional parameters for the event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void {
  try {
    // Check if gtag is available
    if (typeof window !== 'undefined') {
      // If gtag is directly available
      if (window.gtag) {
        logGAEvent(eventName, eventParams, 'gtag');
        window.gtag('event', eventName, eventParams);
      } 
      // If dataLayer is available, use it (alternative approach)
      else if (window.dataLayer) {
        logGAEvent(eventName, eventParams, 'dataLayer');
        window.dataLayer.push({
          event: eventName,
          ...eventParams
        });
      } 
      // No tracking available - only warn in production, silent in dev
      else {
        if (process.env.NODE_ENV === 'production') {
          console.warn(
            `%c📊 GA not loaded [${getLogTimestamp()}]`,
            'color: #ea4335; font-weight: bold;',
            `\n   Would track: ${eventName}`,
            eventParams ? `\n   Params: ${JSON.stringify(eventParams, null, 2)}` : ''
          );
        }
      }
    } else {
      console.log(
        `%c📊 Server-side [${getLogTimestamp()}]`,
        'color: #9aa0a6; font-weight: bold;',
        `\n   Would track: ${eventName}`,
        eventParams ? `\n   Params: ${JSON.stringify(eventParams, null, 2)}` : ''
      );
    }
  } catch (error) {
    console.error(
      `%c❌ GA Error [${getLogTimestamp()}]`,
      'color: #ea4335; font-weight: bold;',
      `\n   Event: ${eventName}`,
      `\n   Error:`,
      error
    );
  }
}

/**
 * Track a click event with enhanced logging
 * This is a convenience wrapper around trackEvent specifically for click tracking
 * @param clickTarget The target of the click (e.g., 'signup_button', 'discord_link')
 * @param location Optional location context (e.g., 'home_cta', 'pricing_page')
 * @param additionalParams Optional additional parameters
 */
export function trackClick(
  clickTarget: string,
  location?: string,
  additionalParams?: Record<string, string | number | boolean>
): void {
  const clickParams: Record<string, string | number | boolean> = {
    event_category: 'click',
    event_label: clickTarget,
    ...(location && { location }),
    ...additionalParams
  };
  
  const timestamp = getLogTimestamp();
  console.log(
    `%c🖱️  Click Tracked [${timestamp}]`,
    'color: #34a853; font-weight: bold; font-size: 12px;',
    `\n   Target: ${clickTarget}${location ? `\n   Location: ${location}` : ''}${additionalParams ? `\n   Additional: ${JSON.stringify(additionalParams, null, 2)}` : ''}`
  );
  
  trackEvent('click', clickParams);
}

/**
 * Track a page view in Google Analytics
 * @param path The path of the page
 * @param title The title of the page
 */
export function trackPageView(path: string, title?: string): void {
  try {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    
    if (!measurementId || measurementId === 'G-MEASUREMENT_ID') {
      console.warn('GA Measurement ID not set - skipping page view tracking');
      return;
    }
    
    if (typeof window !== 'undefined' && window.gtag) {
      const timestamp = getLogTimestamp();
      console.log(
        `%c📊 GA Page View [${timestamp}]`,
        'color: #4285f4; font-weight: bold; font-size: 12px;',
        `\n   Path: ${path}${title ? `\n   Title: ${title}` : ''}`
      );
      window.gtag('config', measurementId, {
        page_path: path,
        page_title: title
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Global types are defined in types/global.d.ts

/**
 * Track specific goal completions (both GA and Umami)
 */

// Goal: User confirms they see transcripts (green "Yes" button)
export function trackTranscriptConfirmation(): void {
  const timestamp = getLogTimestamp();
  console.log(
    `%c🎯 Goal Completion [${timestamp}]`,
    'color: #fbbc04; font-weight: bold; font-size: 12px;',
    '\n   Goal: User confirms they see transcripts'
  );

  // Google Analytics goal tracking
  trackEvent('goal_completion', {
    goal_name: 'transcript_confirmation',
    goal_id: 'transcript_verification',
    value: 1,
    button_type: 'yes_i_see_transcripts'
  });

  // Umami goal tracking
  trackUmamiEvent('transcript_confirmation', {
    goal: 'transcript_verification',
    result: 'confirmed',
    button: 'yes_i_see_transcripts'
  });
}

// Goal: User reports they don't see transcripts (red "No" button)
export function trackTranscriptNotVisible(): void {
  const timestamp = getLogTimestamp();
  console.log(
    `%c🎯 Goal Completion [${timestamp}]`,
    'color: #fbbc04; font-weight: bold; font-size: 12px;',
    '\n   Goal: User reports they don\'t see transcripts'
  );

  // Google Analytics goal tracking
  trackEvent('goal_completion', {
    goal_name: 'transcript_not_visible',
    goal_id: 'transcript_verification',
    value: 0,
    button_type: 'no_dont_see_transcripts'
  });

  // Umami goal tracking
  trackUmamiEvent('transcript_not_visible', {
    goal: 'transcript_verification',
    result: 'not_visible',
    button: 'no_dont_see_transcripts'
  });
}

// Goal: API key creation
export function trackApiKeyCreation(): void {
  const timestamp = getLogTimestamp();
  console.log(
    `%c🎯 Goal Completion [${timestamp}]`,
    'color: #fbbc04; font-weight: bold; font-size: 12px;',
    '\n   Goal: API key creation'
  );

  // Google Analytics goal tracking
  trackEvent('goal_completion', {
    goal_name: 'api_key_created',
    goal_id: 'api_key_creation',
    value: 1,
    button_type: 'create_api_key'
  });

  // Umami goal tracking
  trackUmamiEvent('api_key_created', {
    goal: 'api_key_creation',
    button: 'create_api_key'
  });
}

/**
 * Track a page view in Umami
 * @param path The path of the page
 * @param title The title of the page
 */
export function trackUmamiPageView(path: string, title?: string): void {
  try {
    const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

    if (!websiteId || websiteId === 'umami-website-id') {
      console.warn('Umami Website ID not set - skipping page view tracking');
      return;
    }

    if (typeof window !== 'undefined' && window.umami) {
      console.log(`📊 Umami: Tracking page view: ${path}`);
      window.umami.track('pageview', {
        url: path,
        title: title || document.title
      });
    }
  } catch (error) {
    console.error('Error tracking Umami page view:', error);
  }
}

/**
 * Track a custom event in Umami
 * @param eventName The name of the event to track
 * @param eventData Optional data for the event
 */
export function trackUmamiEvent(eventName: string, eventData?: Record<string, any>): void {
  try {
    const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

    if (!websiteId || websiteId === 'umami-website-id') {
      console.warn('Umami Website ID not set - skipping event tracking');
      return;
    }

    if (typeof window !== 'undefined' && window.umami) {
      console.log(`📊 Umami: Tracking event: ${eventName}`, eventData);
      window.umami.track(eventName, eventData);
    }
  } catch (error) {
    console.error('Error tracking Umami event:', error);
  }
}

// Global types are defined in types/global.d.ts

/**
 * Examples usage:
 *
 * // Track a sign up event
 * trackEvent('sign_up', { method: 'email' });
 *
 * // Track a button click
 * trackEvent('button_click', { button_id: 'submit_form' });
 *
 * // Track goal completions
 * trackTranscriptConfirmation();  // Green "Yes, I see my transcripts" button
 * trackTranscriptNotVisible();    // Red "No, I don't see transcripts" button
 * trackApiKeyCreation();         // "Create API key" button
 */ 