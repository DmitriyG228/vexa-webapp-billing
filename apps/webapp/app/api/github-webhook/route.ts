import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { notifyGoogleIndexing } from '@/lib/google-indexing';
import { absoluteUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')}`;
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    
    // Check if the push affects blog content (markdown files in root or blog/ directory)
    const blogPath = process.env.GITHUB_REPO_PATH || 'blog';
    const isBlogUpdate = payload.commits?.some((commit: any) => 
      commit.modified?.some((file: string) => 
        file.endsWith('.md') || file.endsWith('.mdx') || 
        (blogPath && file.startsWith(`${blogPath}/`)) ||
        (!blogPath && !file.includes('/')) // Root level files
      ) ||
      commit.added?.some((file: string) => 
        file.endsWith('.md') || file.endsWith('.mdx') || 
        (blogPath && file.startsWith(`${blogPath}/`)) ||
        (!blogPath && !file.includes('/'))
      ) ||
      commit.removed?.some((file: string) => 
        file.endsWith('.md') || file.endsWith('.mdx') || 
        (blogPath && file.startsWith(`${blogPath}/`)) ||
        (!blogPath && !file.includes('/'))
      )
    );
    
    if (isBlogUpdate) {
      // Revalidate the blog pages and sitemap
      revalidatePath('/blog');
      revalidatePath('/blog/[slug]', 'page');
      revalidatePath('/sitemap.xml');
      revalidatePath('/feed.xml');
      
      // Notify Google about new/updated blog posts for faster indexing
      const addedFiles = payload.commits?.flatMap((commit: any) => 
        commit.added?.filter((file: string) => 
          file.endsWith('.md') || file.endsWith('.mdx')
        ) || []
      ) || [];
      
      // Extract slugs from added files and notify Google
      for (const file of addedFiles) {
        const slug = file.replace(/\.mdx?$/, '').replace(/^.*\//, '');
        if (slug) {
          const postUrl = absoluteUrl(`/blog/${slug}`);
          // Notify Google asynchronously (don't wait for response)
          notifyGoogleIndexing(postUrl, 'URL_UPDATED').catch(err => 
            console.error(`Failed to notify Google for ${postUrl}:`, err)
          );
        }
      }
      
      console.log('Blog content updated, revalidating pages, sitemap, and RSS feed');
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
