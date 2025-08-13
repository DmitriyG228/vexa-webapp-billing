import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatDate } from '@/lib/utils';
import { PageContainer, Section } from '@/components/ui/page-container';
import { BlogRefreshButton } from './blog-refresh-button';

export default async function BlogIndex() {
  const allPostsData = await getSortedPostsData();

  return (
    <PageContainer>
      <Section>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">Blog</h1>
            <BlogRefreshButton />
          </div>
          <p className="text-muted-foreground">
            Latest insights and updates from the Vexa team
            <span className="block text-xs mt-2">
              Content refreshes every 5 seconds
            </span>
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPostsData.map(({ slug, date, title, summary }: PostData) => (
            <Link href={`/blog/${slug}`} key={slug} legacyBehavior passHref>
              <a className="block hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
                <Card className="h-full rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg leading-tight">{title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {formatDate(date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-muted-foreground text-sm">{summary}</p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
        </div>
        {allPostsData.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">No blog posts yet. Check back soon!</p>
        )}
      </Section>
    </PageContainer>
  );
}

// Add revalidate for Incremental Static Regeneration (ISR)
export const revalidate = 5; // Revalidate every 5 seconds 