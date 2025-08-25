/**
 * Google Analytics utility functions with improved reliability
 */

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
        console.log(`📊 Tracking event: ${eventName}`, eventParams);
        window.gtag('event', eventName, eventParams);
      } 
      // If dataLayer is available, use it (alternative approach)
      else if (window.dataLayer) {
        console.log(`📊 Tracking event via dataLayer: ${eventName}`, eventParams);
        window.dataLayer.push({
          event: eventName,
          ...eventParams
        });
      } 
      // No tracking available
      else {
        console.warn(`📊 GA not loaded. Would track: ${eventName}`, eventParams);
      }
    } else {
      console.log(`📊 Server-side - Would track: ${eventName}`, eventParams);
    }
  } catch (error) {
    console.error('Error tracking GA event:', error);
  }
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
      console.log(`📊 Tracking page view: ${path}`);
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
  console.log('🎯 Goal: User confirms they see transcripts');

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
  console.log('🎯 Goal: User reports they don\'t see transcripts');

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
  console.log('🎯 Goal: API key creation');

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