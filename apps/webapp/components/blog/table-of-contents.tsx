'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    
    // Wait for content to be rendered
    const timer = setTimeout(() => {
      // Find all headings in the actual document and ensure they have IDs
      const actualHeadings = document.querySelectorAll('article h2, article h3, article h4');
      const extractedHeadings: Heading[] = [];
      
      actualHeadings.forEach((heading) => {
        let id = heading.id;
        if (!id && heading.textContent) {
          // Generate ID from text content
          id = heading.textContent
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          
          // Ensure uniqueness
          let uniqueId = id;
          let counter = 1;
          while (document.getElementById(uniqueId)) {
            uniqueId = `${id}-${counter}`;
            counter++;
          }
          
          heading.id = uniqueId;
          id = uniqueId;
        }
        
        if (id) {
          extractedHeadings.push({
            id,
            text: heading.textContent || '',
            level: parseInt(heading.tagName.charAt(1)),
          });
        }
      });

      setHeadings(extractedHeadings);

      // Set up intersection observer for active heading
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id) {
              setActiveId(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-20% 0% -35% 0%',
          threshold: 0,
        }
      );

      actualHeadings.forEach((heading) => observer?.observe(heading));
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) {
        const headings = document.querySelectorAll('article h2, article h3, article h4');
        headings.forEach((heading) => observer?.unobserve(heading));
      }
    };
  }, [content]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="border-l-2 border-muted pl-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">On this page</h3>
          <nav className="space-y-2">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  'block text-left text-sm transition-colors hover:text-foreground w-full',
                  heading.level === 2 && 'pl-0 font-medium',
                  heading.level === 3 && 'pl-4 text-muted-foreground',
                  heading.level === 4 && 'pl-8 text-muted-foreground',
                  activeId === heading.id
                    ? 'text-foreground font-medium border-l-2 border-primary -ml-4 pl-3'
                    : 'text-muted-foreground'
                )}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

