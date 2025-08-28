import { NextRequest, NextResponse } from 'next/server';
import { GitHubContentService } from '@/lib/github';

const githubService = new GitHubContentService();

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const assetPath = params.path.join('/');
    const fullAssetPath = `assets/${assetPath}`;
    
    // Get the asset content from GitHub using authenticated API
    const assetContent = await githubService.getAssetContent(fullAssetPath);
    
    // Determine content type based on file extension
    const extension = assetPath.split('.').pop()?.toLowerCase();
    const contentType = getContentType(extension);
    
    // Return the asset with appropriate headers
    return new NextResponse(assetContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60, s-maxage=60', // 1 minute instead of 1 hour for faster image updates
      },
    });
  } catch (error) {
    console.error('Error serving asset:', error);
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    );
  }
}

function getContentType(extension?: string): string {
  const contentTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'pdf': 'application/pdf',
  };
  
  return contentTypes[extension || ''] || 'application/octet-stream';
}
