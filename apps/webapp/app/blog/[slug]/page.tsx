import { getAllPostSlugs, getPostData, PostData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { formatDate, absoluteUrl } from '@/lib/utils';
import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const post = await getPostData(slug);
    const ogImage = post.heroImage ? absoluteUrl(post.heroImage) : absoluteUrl('/images/og-default.png');

    return {
      title: post.title,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        url: absoluteUrl(`/blog/${post.slug}`),
        siteName: 'Vexa Blog',
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
      },
    };
  } catch (error) {
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
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let post: PostData;
  try {
    post = await getPostData(slug);
  } catch (error) {
    notFound();
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.heroImage ? absoluteUrl(post.heroImage) : undefined,
    author: {
      '@type': 'Person',
      name: post.author,
      url: post.authorLinkedIn,
      image: post.authorImage,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vexa',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logodark.svg'),
      },
    },
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/blog/${post.slug}`)
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <article>
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-[13px] text-gray-400 hover:text-gray-600 transition-colors mb-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to blog
            </Link>

            {/* Hero Image */}
            {post.heroImage && (
              <div className="mb-8 overflow-hidden rounded-2xl">
                <Image
                  src={post.heroImage}
                  alt={`${post.title} hero image`}
                  width={1200}
                  height={630}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            )}

            {/* Header */}
            <header className="mb-10">
              <h1 className="text-[32px] sm:text-[38px] font-semibold leading-[1.1] tracking-[-0.03em] text-gray-950 mb-4">
                {post.title}
              </h1>
              <div className="flex items-center gap-3 text-[14px] text-gray-500">
                {post.authorLinkedIn ? (
                  <Link
                    href={post.authorLinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                  >
                    <Avatar className="h-7 w-7">
                      {post.authorImage && <AvatarImage src={post.authorImage} alt={post.author} />}
                      <AvatarFallback className="text-[10px]">{getInitials(post.author)}</AvatarFallback>
                    </Avatar>
                    <span>{post.author}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      {post.authorImage && <AvatarImage src={post.authorImage} alt={post.author} />}
                      <AvatarFallback className="text-[10px]">{getInitials(post.author)}</AvatarFallback>
                    </Avatar>
                    <span>{post.author}</span>
                  </div>
                )}
                <span className="text-gray-300">&middot;</span>
                <span className="text-gray-400">{formatDate(post.date)}</span>
              </div>
            </header>

            {/* Content */}
            <div
              className="prose max-w-none prose-gray prose-headings:text-gray-950 prose-headings:tracking-[-0.02em] prose-a:text-gray-950 prose-a:underline-offset-2 prose-code-copy-buttons"
              dangerouslySetInnerHTML={{ __html: post.contentHtml! }}
            />

            {/* Copy-Button handler */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function(){
                    function setButtonState(btn, svg){
                      var original = btn.innerHTML;
                      btn.innerHTML = svg;
                      setTimeout(function(){ btn.innerHTML = original; }, 2000);
                    }
                    document.addEventListener('click', function(e){
                      var button = e.target.closest && e.target.closest('.copy-button');
                      if(!button) return;
                      try{
                        var b64 = button.getAttribute('data-code-b64') || '';
                        var code = atob(b64);
                        if (navigator.clipboard && window.isSecureContext){
                          navigator.clipboard.writeText(code).then(function(){
                            setButtonState(button, '<svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>');
                          });
                        } else {
                          var ta = document.createElement('textarea');
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
          </article>
        </div>
      </section>
    </>
  );
}

// Revalidate every 5 seconds for ISR
export const revalidate = 5;
