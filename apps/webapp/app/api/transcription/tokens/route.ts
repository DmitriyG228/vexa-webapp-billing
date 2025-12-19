import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { listUserTokens, createUserToken, getOrCreateApiToken } from '@/lib/transcription-client';

/**
 * GET /api/transcription/tokens
 * List all API tokens for the authenticated user
 * Auto-creates the user if they don't exist (for new users)
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

    // First, ensure the user exists by calling getOrCreateApiToken
    // This will auto-create the user and a default token if they don't exist
    // This is necessary because listUserTokens doesn't auto-create users
    try {
      await getOrCreateApiToken({
        email: session.user.email,
        name: session.user.name || null,
      });
    } catch (createError) {
      // If user creation fails with a non-404 error, re-throw it
      // (e.g., 403 Forbidden, 500 Server Error)
      const createErrorMessage = createError instanceof Error ? createError.message : String(createError);
      if (!createErrorMessage.includes('404') && !createErrorMessage.includes('not found')) {
        throw createError;
      }
      // For 404 errors, the user might not exist yet, but we'll try to list tokens anyway
      // If listUserTokens also fails with 404, we'll handle it in the outer catch block
    }

    // Now list all tokens for the user
    // If the user still doesn't exist (edge case), this will throw a 404
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

