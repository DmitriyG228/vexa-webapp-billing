import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { updateUserToken, deleteUserToken } from '@/lib/transcription-client';

/**
 * PATCH /api/transcription/tokens/[tokenId]
 * Update a token's name
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const { tokenId: tokenIdParam } = await params;
    const tokenId = parseInt(tokenIdParam, 10);
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const tokenName = body.token_name || body.name;

    if (!tokenName) {
      return NextResponse.json(
        { error: 'Token name is required' },
        { status: 400 }
      );
    }

    const response = await updateUserToken({
      email: session.user.email,
      token_id: tokenId,
      token_name: tokenName,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating transcription token:', error);
    
    let errorMessage = 'Failed to update token';
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
        error: 'Failed to update token',
        message: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/transcription/tokens/[tokenId]
 * Delete a specific token
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const { tokenId: tokenIdParam } = await params;
    const tokenId = parseInt(tokenIdParam, 10);
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: 'Invalid token ID' },
        { status: 400 }
      );
    }

    const response = await deleteUserToken({
      email: session.user.email,
      token_id: tokenId,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting transcription token:', error);
    
    let errorMessage = 'Failed to delete token';
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
        error: 'Failed to delete token',
        message: errorMessage,
        detail: error instanceof Error ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

