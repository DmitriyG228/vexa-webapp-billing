import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // For now, allow all authenticated requests (NextAuth handles session validation)
    // In production, you might want to add more specific admin checks

    // Revalidate the blog pages
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]');

    console.log('Blog content revalidated successfully');

    return NextResponse.json({
      success: true,
      message: 'Blog content refreshed successfully',
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
