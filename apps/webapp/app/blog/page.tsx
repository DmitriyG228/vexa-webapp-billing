import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatDate } from '@/lib/utils';
import { PageContainer, Section } from '@/components/ui/page-container';
import { BlogRefreshButton } from './blog-refresh-button';

export async function generateMetadata() {
  return {
    title: 'Blog | Vexa - Meeting Transcription API',
    description: 'Latest insights and updates from the Vexa team. Learn about meeting transcription, API integration, Microsoft Teams, Google Meet, and more.',
    openGraph: {
      title: 'Vexa Blog',
      description: 'Latest insights and updates from the Vexa team',
      url: 'https://vexa.ai/blog',
      type: 'website',
    },
  };
}

export default async function BlogIndex() {
  const allPostsData = await getSortedPostsData();

  // Blog collection schema
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Vexa Blog',
    description: 'Latest insights and updates from the Vexa team',
    url: 'https://vexa.ai/blog',
    publisher: {
      '@type': 'Organization',
      name: 'Vexa',
      url: 'https://vexa.ai',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <PageContainer>
        <Section>
          <div className="relative">
            <BlogRefreshButton />
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Blog</h1>
              <p className="text-muted-foreground mt-4">
                Latest insights and updates from the Vexa team
              </p>
            </div>
          </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPostsData.map(({ slug, date, title, summary }: PostData, index: number) => (
            <Link 
              href={`/blog/${slug}`} 
              key={`${slug}-${index}`}
              className="block hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            >
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
            </Link>
        ))}
        </div>
        {allPostsData.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">No blog posts yet. Check back soon!</p>
        )}
      </Section>
    </PageContainer>
    </>
  );
}

// Add revalidate for Incremental Static Regeneration (ISR)
// Using 0 for development-like behavior (always revalidate on each request)
export const revalidate = 0; 