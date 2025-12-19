import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { listUserTokens, createUserToken } from '@/lib/transcription-client';

/**
 * GET /api/transcription/tokens
 * List all API tokens for the authenticated user
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

    const response = await listUserTokens({
      email: session.user.email,
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error listing transcription tokens:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found');
    const isForbidden = errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('admin API key');
    
    if (isNotFound) {
      return NextResponse.json(
        { 
          error: 'User not found in transcription service',
          message: 'The transcription service could not find your account. This may be a temporary issue. Please try again.',
          detail: errorMessage
        },
        { status: 404 }
      );
    }
    
    if (isForbidden) {
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          message: 'The transcription service authentication failed. Please contact support.',
          detail: errorMessage
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to list tokens',
        message: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transcription/tokens
 * Create a new API token with an optional name
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const tokenName = body.token_name || body.name || null;

    const response = await createUserToken({
      email: session.user.email,
      token_name: tokenName,
      user_name: session.user.name || null,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating transcription token:', error);
    
    let errorMessage = 'Failed to create token';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (errorMessage.includes('Transcription Gateway API error')) {
        const match = errorMessage.match(/\((\d+)\):\s*(.+)/);
        if (match) {
          statusCode = parseInt(match[1], 10);
          errorMessage = match[2];
        }
      }
    } else {
      errorMessage = String(error);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create token',
        message: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

