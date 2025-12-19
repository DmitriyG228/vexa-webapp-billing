import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getUsageStatistics } from '@/lib/transcription-client';

/**
 * GET /api/transcription/usage
 * Get usage statistics for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // First get the user's API token
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3002'}/api/transcription/api-key`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get API token');
    }

    const tokenData = await tokenResponse.json();
    const apiKey = tokenData.api_token;

    if (!apiKey) {
      throw new Error('No API token available');
    }

    // Get usage statistics with history (default 30 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    const usageData = await getUsageStatistics(apiKey, days);

    return NextResponse.json(usageData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error getting usage statistics:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get usage statistics',
        message: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

