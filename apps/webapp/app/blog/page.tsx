import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Assuming shadcn card component
import { formatDate } from '@/lib/utils'; // Assuming a date formatting utility exists
import { PageContainer, Section } from '@/components/ui/page-container';

export default function BlogIndex() {
  const allPostsData = getSortedPostsData();

  return (
    <PageContainer>
      <Section>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">Blog</h1>
          <p className="text-muted-foreground">Latest insights and updates from the Vexa team</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPostsData.map(({ slug, date, title, summary }: PostData) => (
            <Link href={`/blog/${slug}`} key={slug} legacyBehavior passHref>
              <a className="block hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
                <Card className="h-full rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg leading-tight">{title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {formatDate(date)} {/* Use formatDate utility */}
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

// Add revalidate if needed for Incremental Static Regeneration (ISR)
// export const revalidate = 60; // Revalidate every 60 seconds 