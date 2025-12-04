import { getSortedPostsData } from '@/lib/posts'
import { absoluteUrl } from '@/lib/utils'

export async function GET() {
  const baseUrl = 'https://vexa.ai'
  const posts = await getSortedPostsData()

  const rssItems = posts
    .slice(0, 20) // Latest 20 posts
    .map((post) => {
      const postUrl = absoluteUrl(`/blog/${post.slug}`)
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.summary}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${post.author}</author>
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Vexa Blog</title>
    <description>Latest insights and updates from the Vexa team</description>
    <link>${baseUrl}/blog</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

export const revalidate = 3600 // Revalidate every hour











