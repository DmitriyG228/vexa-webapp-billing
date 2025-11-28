import { getAllPostSlugs, getPostData, PostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { formatDate, absoluteUrl } from '@/lib/utils'; // Import absoluteUrl
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image'; // Import next/image
import Link from 'next/link'; // Import Link
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import { PageContainer, Section } from '@/components/ui/page-container';

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
      {/* JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageContainer maxWidth="4xl">
        <Section>
          {/* Breadcrumb navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{post.title}</li>
            </ol>
          </nav>
          
          <article>
        {/* Hero Image */} 
        {post.heroImage && (
            <div className="mb-8 overflow-hidden rounded-xl shadow-sm">
            <Image
              src={post.heroImage} 
              alt={`${post.title} hero image`}
              width={1200} // Adjust width as needed
              height={630} // Adjust height for aspect ratio (e.g., 1.91:1 for Open Graph)
              className="w-full h-auto object-cover"
              priority // Load hero image eagerly
            />
          </div>
        )}

            <header className="mb-8">
              <h1 className="text-2xl font-bold leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
            {/* Author Avatar and Link */} 
            {post.authorLinkedIn ? (
              <Link href={post.authorLinkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-foreground transition-colors">
                <Avatar className="h-8 w-8">
                  {post.authorImage && <AvatarImage src={post.authorImage} alt={post.author} />}
                  <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                </Avatar>
                <span>{post.author}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  {post.authorImage && <AvatarImage src={post.authorImage} alt={post.author} />}
                  <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                </Avatar>
                <span>{post.author}</span>
              </div>
            )}
            
            <span>|</span>
            <span>Published on {formatDate(post.date)}</span>
            <span>|</span>
            <span className="text-xs text-muted-foreground">Refreshes every 5s</span>
          </div>
        </header>

        {/* Render the HTML content */}
        {/* Add prose styles for better readability (e.g., using @tailwindcss/typography) */}
        <div
          className="prose dark:prose-invert max-w-none prose-code-copy-buttons"
          dangerouslySetInnerHTML={{ __html: post.contentHtml! }}
        />
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

            {/* Consider adding components for sharing, comments, related posts etc. */}
          </article>
        </Section>
      </PageContainer>
    </>
  );
}

// Add revalidate for ISR
export const revalidate = 5; // Revalidate every 5 seconds 