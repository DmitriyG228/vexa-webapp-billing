import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { listUserTokens } from '@/lib/transcription-client';

const TRANSCRIPTION_GATEWAY_URL = process.env.TRANSCRIPTION_GATEWAY_URL || 'https://transcription.vexa.ai';

/**
 * POST /api/transcription/purchase
 * Create a Stripe payment link for purchasing transcription minutes
 */
export async function POST(request: NextRequest) {
  console.log('🔵 Purchase API route called');
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    console.log(`✅ Session found for user: ${session.user.email}`);
    console.log(`📍 Gateway URL: ${TRANSCRIPTION_GATEWAY_URL}`);

    // Get user's tokens to find an active one
    const tokensData = await listUserTokens({
      email: session.user.email,
    });

    console.log(`📋 Found ${tokensData?.tokens?.length || 0} tokens`);

    if (!tokensData?.tokens || tokensData.tokens.length === 0) {
      return NextResponse.json(
        { error: 'Please create an API key first' },
        { status: 400 }
      );
    }

    // Find an active token
    const activeToken = tokensData.tokens.find(t => t.is_active);
    const tokenToUse = activeToken || tokensData.tokens[0];

    if (!tokenToUse || !tokenToUse.is_active) {
      return NextResponse.json(
        { error: `The API token "${tokenToUse?.name || 'Unknown'}" is inactive. Please create a new API token.` },
        { status: 400 }
      );
    }

    console.log(`🔑 Using token ID: ${tokenToUse.id}, name: ${tokenToUse.name}, preview: ${tokenToUse.token.substring(0, 10)}...`);

    // Parse form data if provided (application/x-www-form-urlencoded)
    let amountUsd: number | null = null;
    let requestedMinutes: number | null = null;
    
    try {
      const contentType = request.headers.get('content-type') || '';
      console.log(`📋 Content-Type: ${contentType}`);
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Parse URL-encoded form data
        const body = await request.text();
        console.log(`📥 Raw request body: "${body}"`);
        console.log(`📥 Body length: ${body.length}`);
        
        if (body) {
          const params = new URLSearchParams(body);
          const amountUsdStr = params.get('amount_usd');
          const requestedMinutesStr = params.get('requested_minutes');
          
          console.log(`📋 Parsed params - amount_usd: "${amountUsdStr}", requested_minutes: "${requestedMinutesStr}"`);
          
          amountUsd = amountUsdStr ? parseFloat(amountUsdStr) : null;
          requestedMinutes = requestedMinutesStr ? parseFloat(requestedMinutesStr) : null;
        } else {
          console.log(`⚠️ Empty request body`);
        }
      } else {
        // Try FormData for multipart/form-data
        console.log(`📋 Trying FormData parsing`);
        const formData = await request.formData();
        const amountUsdStr = formData.get('amount_usd') as string | null;
        const requestedMinutesStr = formData.get('requested_minutes') as string | null;
        
        console.log(`📋 FormData - amount_usd: "${amountUsdStr}", requested_minutes: "${requestedMinutesStr}"`);
        
        amountUsd = amountUsdStr ? parseFloat(amountUsdStr) : null;
        requestedMinutes = requestedMinutesStr ? parseFloat(requestedMinutesStr) : null;
      }
    } catch (error) {
      console.error('❌ Error parsing form data:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
    }

    console.log(`💰 Parsed form data - amount_usd: ${amountUsd}, requested_minutes: ${requestedMinutes}`);

    // Forward the purchase request to the transcription gateway
    const gatewayFormData = new URLSearchParams();
    if (amountUsd) {
      gatewayFormData.append('amount_usd', amountUsd.toString());
      console.log(`📤 Forwarding amount_usd: ${amountUsd} to gateway`);
    } else if (requestedMinutes) {
      gatewayFormData.append('requested_minutes', requestedMinutes.toString());
      console.log(`📤 Forwarding requested_minutes: ${requestedMinutes} to gateway`);
    } else {
      console.log(`⚠️ No amount_usd or requested_minutes provided, will use minimum purchase`);
    }

    console.log(`🚀 Calling gateway: ${TRANSCRIPTION_GATEWAY_URL}/purchase`);
    console.log(`📦 Gateway request body: ${gatewayFormData.toString()}`);
    const gatewayResponse = await fetch(`${TRANSCRIPTION_GATEWAY_URL}/purchase`, {
      method: 'POST',
      headers: {
        'X-API-Key': tokenToUse.token,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: gatewayFormData.toString(), // Convert to string
    });

    console.log(`📡 Gateway response status: ${gatewayResponse.status}`);

    if (!gatewayResponse.ok) {
      const errorData = await gatewayResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: errorData.detail || errorData.error || 'Failed to create payment link',
          detail: errorData.detail
        },
        { status: gatewayResponse.status }
      );
    }

    const data = await gatewayResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating purchase link:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment link';
    return NextResponse.json(
      { 
        error: 'Failed to create payment link',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}




