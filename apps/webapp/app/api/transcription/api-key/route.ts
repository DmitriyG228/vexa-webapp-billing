import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getOrCreateApiToken, revokeApiToken, regenerateApiToken } from '@/lib/transcription-client';

/**
 * GET /api/transcription/api-key
 * Returns the API key for the transcription service for the authenticated user
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

    // Get or create API token from transcription gateway
    // This will automatically create the user if they don't exist
    // No separate OAuth flow needed - we reuse the existing NextAuth authentication
    const response = await getOrCreateApiToken({
      email: session.user.email,
      name: session.user.name || null,
    });

    return NextResponse.json({
      api_token: response.api_token,
      user_id: response.user_id,
      email: response.email,
      name: response.name,
      balance_minutes: response.balance_minutes,
      token_created_at: response.token_created_at,
      token_last_used_at: response.token_last_used_at,
      is_active: response.is_active,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error getting transcription API key:', error);
    
    // Parse error message to determine the type
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found');
    const isForbidden = errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('admin API key');
    
    if (isNotFound) {
      // User doesn't exist - this shouldn't happen if auto-create is working
      // But provide fallback registration option
      return NextResponse.json(
        { 
          error: 'User not found in transcription service',
          message: 'The transcription service could not find your account. This may be a temporary issue. Please try again or register directly.',
          registration_url: 'https://transcription.vexa.ai/auth/google',
          detail: errorMessage
        },
        { status: 404 }
      );
    }
    
    if (isForbidden) {
      // Admin key issue
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
        error: 'Failed to get API key',
        message: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transcription/api-key
 * Regenerates a new API key for the transcription service
 * This will create a new token, effectively revoking the old one
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

    // Regenerate API token - this will delete the old token and create a new one
    const response = await regenerateApiToken({
      email: session.user.email,
      name: session.user.name || null,
    });

    return NextResponse.json({
      api_token: response.api_token,
      user_id: response.user_id,
      email: response.email,
      name: response.name,
      balance_minutes: response.balance_minutes,
      token_created_at: response.token_created_at,
      token_last_used_at: response.token_last_used_at,
      is_active: response.is_active,
      message: 'API key regenerated successfully',
    });
  } catch (error) {
    console.error('Error regenerating transcription API key:', error);
    
    let errorMessage = 'Failed to regenerate API key';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check if it's a transcription gateway API error
      if (errorMessage.includes('Transcription Gateway API error')) {
        // Extract the actual error detail from the message
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
        error: 'Failed to regenerate API key',
        message: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/transcription/api-key
 * Revokes the current API key and regenerates a new one
 * This provides better UX - user doesn't lose access, just gets a new key
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Regenerate the API token (this will delete the old one and create a new one)
    console.log('[DELETE /api/transcription/api-key] Starting token regeneration for:', session.user.email);
    
    const response = await regenerateApiToken({
      email: session.user.email,
      name: session.user.name || null,
    });

    console.log('[DELETE /api/transcription/api-key] Successfully regenerated token for:', session.user.email, 'Response keys:', Object.keys(response));

    if (!response || !response.api_token) {
      console.error('[DELETE /api/transcription/api-key] Invalid response from regenerateApiToken:', response);
      throw new Error('Invalid response from transcription gateway: missing api_token');
    }

    return NextResponse.json({
      message: 'API key revoked and regenerated',
      api_token: response.api_token,
      user_id: response.user_id,
      email: response.email,
      name: response.name,
      balance_minutes: response.balance_minutes,
      token_created_at: response.token_created_at,
      token_last_used_at: response.token_last_used_at,
      is_active: response.is_active,
    }, { status: 200 });
  } catch (error) {
    console.error('Error revoking transcription API key:', error);
    
    let errorMessage = 'Failed to revoke API key';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check if it's a transcription gateway API error
      if (errorMessage.includes('Transcription Gateway API error')) {
        // Extract the actual error detail from the message
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
        error: 'Failed to revoke API key',
        message: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}




