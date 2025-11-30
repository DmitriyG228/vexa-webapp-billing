import { getAllPostSlugs, getPostData, PostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { formatDate, absoluteUrl } from '@/lib/utils';
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageContainer, Section } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { ReadingProgress } from '@/components/blog/reading-progress';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { SocialShareSidebar } from '@/components/blog/social-share-sidebar';

export const dynamic = 'force-dynamic';

interface PostProps {
  params: {
    slug: string;
  };
}

// Generate metadata for the page (title, description)
export async function generateMetadata(
  { params }: PostProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the entire params object before accessing properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const post = await getPostData(slug);
    // Assume default OG image is at public/images/og-default.png
    const ogImage = post.heroImage ? absoluteUrl(post.heroImage) : absoluteUrl('/images/og-default.png');

    const postUrl = absoluteUrl(`/blog/${post.slug}`);
    
    return {
      title: post.title,
      description: post.summary,
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        title: post.title,
        description: post.summary,
        url: postUrl,
        siteName: 'Vexa',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: 'en_US', 
        type: 'article',
        publishedTime: new Date(post.date).toISOString(),
        authors: [post.author],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.summary,
        images: [ogImage],
        creator: '@grankin_d',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    // Handle case where post is not found during metadata generation
    console.error(`Metadata generation failed for slug "${slug}":`, error);
    return {
      title: 'Post Not Found',
      description: 'This blog post could not be found.'
    }
  }
}

// Generate static paths for all posts at build time
export async function generateStaticParams() {
  const paths = getAllPostSlugs();
  return paths;
}

export default async function Post({ params }: PostProps) {
  // Await the entire params object before accessing properties
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  let post: PostData;
  try {
    post = await getPostData(slug);
  } catch (error) {
    // If getPostData throws (e.g., file not found), trigger a 404 page
    notFound();
  }

  // Helper to get initials for Avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Define enhanced JSON-LD structure for better SEO
  const postUrl = absoluteUrl(`/blog/${post.slug}`);
  const blogUrl = absoluteUrl('/blog');
  
  // BreadcrumbList schema for better navigation
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: blogUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.heroImage ? absoluteUrl(post.heroImage) : undefined,
    url: postUrl,
    author: {
      '@type': 'Person',
      name: post.author,
      url: post.authorLinkedIn || undefined,
      image: post.authorImage || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vexa',
      url: 'https://vexa.ai',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logodark.svg'),
      },
    },
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    },
    inLanguage: 'en-US',
    articleSection: 'Technology',
    keywords: post.summary.split(' ').slice(0, 5).join(', '), // Basic keywords from summary
  };

  return (
    <>
      <ReadingProgress />
      {/* JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageContainer maxWidth="7xl">
        <Section>
          <div className="flex gap-8 lg:gap-12 justify-center">
            {/* Social Share Sidebar - Left */}
            <div className="hidden lg:block w-12 flex-shrink-0">
              <SocialShareSidebar url={`/blog/${post.slug}`} title={post.title} description={post.summary} />
            </div>

            {/* Main Content Container - Aligned with Hero Image */}
            <div className="w-full max-w-[720px] flex-shrink-0">
              {/* Breadcrumb navigation - Aligned with content */}
              <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                      Home
                    </Link>
                  </li>
                  <li className="text-muted-foreground">/</li>
                  <li>
                    <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li className="text-muted-foreground">/</li>
                  <li className="text-foreground truncate max-w-md" title={post.title}>
                    {post.title}
                  </li>
                </ol>
              </nav>

              <article>
                {/* Hero Background with Header - Matched to content width */}
                <div 
                  className="relative mb-12 rounded-xl overflow-hidden shadow-lg"
                  style={{
                    backgroundImage: `url(/blog_background.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '450px',
                  }}
                >
                  {/* Enhanced gradient overlay - stronger at bottom for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-black/80" />
                  
                  {/* Header content on top of background */}
                  <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end min-h-[450px]">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white drop-shadow-lg">
                      {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {/* Author Avatar and Link */} 
                      {post.authorLinkedIn ? (
                        <Link 
                          href={post.authorLinkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center space-x-2 hover:text-white transition-colors text-white/95"
                        >
                          <Avatar className="h-9 w-9 border-2 border-white/30">
                            {post.authorImage && <AvatarImage src={post.authorImage} alt={post.author} />}
                            <AvatarFallback className="bg-white/20 text-white">{getInitials(post.author)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{post.author}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center space-x-2 text-white/95">
                          <Avatar className="h-9 w-9 border-2 border-white/30">
                            {post.authorImage && <AvatarImage src={post.authorImage} alt={post.author} />}
                            <AvatarFallback className="bg-white/20 text-white">{getInitials(post.author)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{post.author}</span>
                        </div>
                      )}
                      
                      <span className="text-white/50">•</span>
                      <span className="text-white/80">{formatDate(post.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Render the HTML content with optimized typography */}
                <div
                  className="prose prose-lg dark:prose-invert max-w-none prose-code-copy-buttons blog-content"
                  dangerouslySetInnerHTML={{ __html: post.contentHtml! }}
                  style={{
                    lineHeight: '1.7',
                  }}
                />
                
                {/* CTA Section */}
                <div className="mt-16 mb-8 p-8 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-3">Don't want to host it yourself?</h3>
                    <p className="text-muted-foreground mb-6">
                      Try Vexa Cloud for hassle-free meeting transcription with the same powerful API.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild size="lg">
                        <Link href="/get-started">Get Started Free</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="/pricing">View Pricing</Link>
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Copy-Button handler: decode base64 from data attribute and copy */}
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      (function(){
                        function setButtonState(btn, svg){
                          const original = btn.innerHTML;
                          btn.innerHTML = svg;
                          setTimeout(()=>{ btn.innerHTML = original; }, 2000);
                        }
                        document.addEventListener('click', function(e){
                          const button = e.target.closest && e.target.closest('.copy-button');
                          if(!button) return;
                          try{
                            const b64 = button.getAttribute('data-code-b64') || '';
                            const code = atob(b64);
                            if (navigator.clipboard && window.isSecureContext){
                              navigator.clipboard.writeText(code).then(()=>{
                                setButtonState(button, '<svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>');
                              });
                            } else {
                              const ta = document.createElement('textarea');
                              ta.value = code; ta.style.position='fixed'; ta.style.left='-9999px'; document.body.appendChild(ta);
                              ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                              setButtonState(button, '<svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>');
                            }
                          }catch(err){
                            setButtonState(button, '<svg class="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>');
                            console.error('Copy failed', err);
                          }
                        });
                      })();
                    `
                  }}
                />
                
                {/* Copy button functionality script */}
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      // Global copy function
                      window.copyCodeToClipboard = async function(button, code) {
                        try {
                          // Try modern clipboard API first
                          if (navigator.clipboard && window.isSecureContext) {
                            await navigator.clipboard.writeText(code);
                          } else {
                            // Fallback for older browsers
                            const textarea = document.createElement('textarea');
                            textarea.value = code;
                            textarea.style.position = 'fixed';
                            textarea.style.left = '-999999px';
                            textarea.style.top = '-999999px';
                            document.body.appendChild(textarea);
                            textarea.focus();
                            textarea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textarea);
                          }
                          
                          // Update button to show success state
                          const originalHTML = button.innerHTML;
                          button.innerHTML = \`
                            <svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          \`;
                          button.classList.add('text-green-400');
                          button.classList.remove('text-zinc-300');
                          
                          // Reset after 2 seconds
                          setTimeout(() => {
                            button.innerHTML = originalHTML;
                            button.classList.remove('text-green-400');
                            button.classList.add('text-zinc-300');
                          }, 2000);
                          
                        } catch (err) {
                          console.error('Failed to copy code:', err);
                          // Show error state briefly
                          const originalHTML = button.innerHTML;
                          button.innerHTML = \`
                            <svg class="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          \`;
                          button.classList.add('text-red-400');
                          button.classList.remove('text-zinc-300');
                          
                          setTimeout(() => {
                            button.innerHTML = originalHTML;
                            button.classList.remove('text-red-400');
                            button.classList.add('text-zinc-300');
                          }, 2000);
                        }
                      };
                    `
                  }}
                />
              </article>
            </div>

            {/* Table of Contents Sidebar - Right */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <TableOfContents content={post.contentHtml || ''} />
            </aside>
          </div>
        </Section>
      </PageContainer>
    </>
  );
}

// Add revalidate for ISR
export const revalidate = 5; // Revalidate every 5 seconds 