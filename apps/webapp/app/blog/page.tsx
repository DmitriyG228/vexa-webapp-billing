import { Metadata } from 'next';
import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import { BlogRefreshButton } from './blog-refresh-button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: 'Blog | Vexa',
  description: 'Latest thinking from the Vexa team on meeting intelligence, APIs, and open source. Tutorials, comparisons, and product updates.',
  alternates: {
    canonical: 'https://vexa.ai/blog',
  },
  openGraph: {
    title: 'Blog | Vexa',
    description: 'Latest thinking from the Vexa team on meeting intelligence, APIs, and open source.',
    url: 'https://vexa.ai/blog',
    siteName: 'Vexa',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Vexa',
    description: 'Latest thinking from the Vexa team on meeting intelligence, APIs, and open source.',
  },
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default async function BlogIndex() {
  const allPostsData = await getSortedPostsData();

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="relative text-center mb-10">
          <BlogRefreshButton />
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-[11.5px] text-gray-500 dark:text-gray-400 font-medium shadow-sm mb-4">
            Blog
          </span>
          <h1 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950 dark:text-gray-50">
            Insights &amp;&nbsp;
            <em className="not-italic font-light text-gray-400 dark:text-gray-500">updates</em>
          </h1>
          <p className="mt-4 text-[15.5px] text-gray-500 dark:text-gray-400 leading-[1.7] max-w-lg mx-auto">
            Latest thinking from the Vexa team on meeting intelligence, APIs, and open source.
          </p>
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPostsData.map(({ slug, date, title, summary, author, authorImage }: PostData, index: number) => (
            <Link
              href={`/blog/${slug}`}
              key={`${slug}-${index}`}
              className="group flex flex-col rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-7 hover:border-gray-300 dark:hover:border-neutral-700 transition-all shadow-sm dark:shadow-none min-h-[280px]"
            >
              {/* Date top-right style */}
              <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-4">
                {formatDate(date)}
              </p>

              {/* Title */}
              <h2 className="text-[18px] font-semibold text-gray-950 dark:text-gray-50 leading-snug mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                {title}
              </h2>

              {/* Summary */}
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-[1.6] line-clamp-3 flex-1">
                {summary}
              </p>

              {/* Author badge */}
              {author && (
                <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <Avatar className="h-6 w-6">
                    {authorImage && <AvatarImage src={authorImage} alt={author} />}
                    <AvatarFallback className="text-[9px] bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400">
                      {getInitials(author)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] text-gray-600 dark:text-gray-400 font-medium">
                    {author}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {allPostsData.length === 0 && (
          <p className="text-center text-[15px] text-gray-400 dark:text-gray-500 mt-8">
            No blog posts yet. Check back soon!
          </p>
        )}
      </div>
    </section>
  );
}

// Add revalidate for Incremental Static Regeneration (ISR)
// Using 0 for development-like behavior (always revalidate on each request)
export const revalidate = 0;
