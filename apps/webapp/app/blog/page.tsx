import Link from 'next/link';
import { getSortedPostsData, PostData } from '@/lib/posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { FileText } from "lucide-react";
import { formatDate } from '@/lib/utils';
import { PageContainer, Section } from '@/components/ui/page-container';
import { BlogRefreshButton } from './blog-refresh-button';

export async function generateMetadata() {
  return {
    title: 'Vexa Blog - Meeting Transcription Tutorials, API Guides & Developer Resources',
    description: 'Learn how to build meeting transcription into your apps. Tutorials, integration guides, and best practices for developers using Vexa API.',
    openGraph: {
      title: 'Vexa Blog - Meeting Transcription Tutorials, API Guides & Developer Resources',
      description: 'Learn how to build meeting transcription into your apps. Tutorials, integration guides, and best practices for developers using Vexa API.',
      url: 'https://vexa.ai/blog',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vexa Blog - Meeting Transcription Tutorials, API Guides & Developer Resources',
      description: 'Learn how to build meeting transcription into your apps. Tutorials, integration guides, and best practices for developers.',
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
              <p className="text-muted-foreground text-lg">
                Latest insights and updates from the Vexa team
              </p>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm">
                <Link href="/get-started" className="text-primary hover:underline font-medium">
                  Get Started Guide
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <Link href="/pricing" className="text-primary hover:underline font-medium">
                  View Pricing
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <Link href="https://github.com/Vexa-ai/vexa" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  GitHub Repository
                </Link>
              </div>
            </div>
          </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allPostsData.map(({ slug, date, title, summary }: PostData, index: number) => (
            <Link 
              href={`/blog/${slug}`} 
              key={`${slug}-${index}`}
              className="group block hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg group-hover:border-primary/50">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {formatDate(date)}
                  </CardDescription>
                </CardHeader>
                <Separator className="mx-6" />
                <CardContent className="p-6 pt-4">
                  <p className="text-muted-foreground text-sm line-clamp-3">{summary}</p>
                </CardContent>
              </Card>
            </Link>
        ))}
        </div>
        {allPostsData.length === 0 && (
          <Empty className="mt-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>No blog posts yet</EmptyTitle>
              <EmptyDescription>
                Check back soon for the latest insights and updates from the Vexa team.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
    </PageContainer>
    </>
  );
}

// Add revalidate for Incremental Static Regeneration (ISR)
// Using 0 for development-like behavior (always revalidate on each request)
export const revalidate = 0; 