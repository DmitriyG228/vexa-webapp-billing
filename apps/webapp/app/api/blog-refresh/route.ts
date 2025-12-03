import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // For now, allow all authenticated requests (NextAuth handles session validation)
    // In production, you might want to add more specific admin checks

    // Revalidate the blog pages
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]');
    
    // Revalidate the dashboard page (for notifications)
    revalidatePath('/dashboard');
    
    // Revalidate the notifications API endpoint
    revalidatePath('/api/notifications');

    console.log('Blog content and notifications revalidated successfully');

    return NextResponse.json({
      success: true,
      message: 'Blog content and notifications refreshed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing blog content:', error);
    return NextResponse.json(
      { error: 'Failed to refresh blog content' },
      { status: 500 }
    );
  }
}
