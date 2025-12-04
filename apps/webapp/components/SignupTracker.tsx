'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'

/**
 * Component that tracks signup events when a new user successfully signs up
 * This component should be placed in the root layout to monitor all session changes
 */
export function SignupTracker() {
  const { data: session, status } = useSession()
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    // Only track if session is authenticated and we haven't tracked this session yet
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any
      
      // Check if this is a new user and we haven't tracked it yet
      if (user.isNewUser && !hasTrackedRef.current) {
        // Track signup event
        trackEvent('signup', {
          event_category: 'conversion',
          event_label: 'developer_signup',
          value: 1
        })
        
        // Mark as tracked to prevent duplicate events
        hasTrackedRef.current = true
        
        console.log('📊 Tracked signup event for new user:', user.email)
      }
    }
    
    // Reset tracking flag when session changes (user logs out)
    if (status === 'unauthenticated') {
      hasTrackedRef.current = false
    }
  }, [session, status])

  // This component doesn't render anything
  return null
}











