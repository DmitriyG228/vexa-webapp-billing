import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import { BlogRefreshButton } from './blog-refresh-button';

export default async function BlogIndex() {
  const allPostsData = await getSortedPostsData();

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="relative text-center mb-10">
          <BlogRefreshButton />
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full border border-gray-200 bg-white text-[11.5px] text-gray-500 font-medium shadow-sm mb-4">
            Blog
          </span>
          <h1 className="text-[34px] sm:text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-950">
            Insights &amp;&nbsp;
            <em className="not-italic font-light text-gray-400">updates</em>
          </h1>
          <p className="mt-4 text-[15.5px] text-gray-500 leading-[1.7] max-w-lg mx-auto">
            Latest thinking from the Vexa team on meeting intelligence, APIs, and open source.
          </p>
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPostsData.map(({ slug, date, title, summary }: PostData, index: number) => (
            <Link
              href={`/blog/${slug}`}
              key={`${slug}-${index}`}
              className="block rounded-2xl border border-gray-200 bg-white p-6 hover:border-gray-300 transition-all"
              style={{
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -8px rgba(0,0,0,0.06)',
              }}
            >
              <h2 className="text-[17px] font-semibold text-gray-950 leading-snug mb-2">
                {title}
              </h2>
              <p className="text-[13px] text-gray-400 mb-3">
                {formatDate(date)}
              </p>
              <p className="text-[14px] text-gray-500 leading-[1.6]">
                {summary}
              </p>
            </Link>
          ))}
        </div>

        {allPostsData.length === 0 && (
          <p className="text-center text-[15px] text-gray-400 mt-8">
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
