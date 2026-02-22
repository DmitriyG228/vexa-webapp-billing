import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

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
    
    // Check if the push affects blog content (markdown files at root or in configured path)
    const blogPath = process.env.GITHUB_REPO_PATH || '';
    const isBlogFile = (file: string) =>
      (file.endsWith('.md') || file.endsWith('.mdx')) &&
      (blogPath === '' || file.startsWith(`${blogPath}/`));
    if (payload.commits?.some((commit: any) =>
      commit.modified?.some(isBlogFile) ||
      commit.added?.some(isBlogFile) ||
      commit.removed?.some(isBlogFile)
    )) {
      // Revalidate the blog pages
      revalidatePath('/blog');
      revalidatePath('/blog/[slug]', 'page');
      
      console.log('Blog content updated, revalidating pages');
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
