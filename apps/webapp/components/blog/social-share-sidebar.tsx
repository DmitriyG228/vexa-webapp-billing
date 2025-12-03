'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { absoluteUrl } from '@/lib/utils';

interface SocialShareSidebarProps {
  url: string;
  title: string;
  description?: string;
}

export function SocialShareSidebar({ url, title, description }: SocialShareSidebarProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = absoluteUrl(url);

  const shareToTwitter = () => {
    const text = encodeURIComponent(title);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="hidden lg:block">
      <div className="sticky top-24">
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={shareToTwitter}
            className="w-12 h-12"
            aria-label="Share on Twitter"
          >
            <Twitter className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={shareToLinkedIn}
            className="w-12 h-12"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={copyLink}
            className="w-12 h-12"
            aria-label="Copy link"
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Link2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}







