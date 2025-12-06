'use client'

import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

interface GitHubStarLinkProps {
  className?: string
  children: React.ReactNode
}

export function GitHubStarLink({ className, children }: GitHubStarLinkProps) {
  const handleClick = () => {
    // Track GitHub star click event with enhanced logging
    console.log('🖱️  [CLICK] GitHub star link clicked');
    trackEvent('github_star_click', {
      event_category: 'engagement',
      event_label: 'github_star',
      value: 1
    })
  }

  return (
    <Link 
      href="https://github.com/Vexa-ai/vexa" 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}











