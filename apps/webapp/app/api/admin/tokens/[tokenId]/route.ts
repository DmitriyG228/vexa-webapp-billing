import { NextRequest, NextResponse } from 'next/server';
import { getAdminAPIClient } from '@/lib/admin-api-client';

/**
 * Handler for DELETE /api/admin/tokens/[tokenId]
 * Revokes/deletes an API token via the Admin API
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID is required' },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete token ID: ${tokenId}`);

    const adminAPI = getAdminAPIClient();
    const response = await adminAPI.fetch(`/admin/tokens/${tokenId}`, {
      method: 'DELETE',
    });

    console.log(`Admin API DELETE /admin/tokens/${tokenId} status: ${response.status}`);

    // For a DELETE operation, we might not get a JSON response
    if (response.status === 204) {
      // No content, standard for successful DELETE
      return new NextResponse(null, { status: 204 });
    }

    // Try to parse response as JSON if not 204
    let responseData = {};
    try {
      // Check if response has content before parsing
      if (response.headers.get('content-length') !== '0') {
        responseData = await response.json();
      }
    } catch (e) {
      console.error("Error parsing JSON response on DELETE:", e);
      // If parsing fails but status was ok somehow, treat as success?
      // Or maybe return the non-JSON error from backend?
      // For now, we rely on the status code check below.
    }
      
    // Return appropriate response based on status code
    if (!response.ok) {
      console.error(`Admin API Error: ${response.status}`, responseData);
      return NextResponse.json(
        responseData, // Forward the error details from admin-api if available
        { status: response.status }
      );
    }

    // If response.ok but not 204 (unlikely for DELETE, but handle it)
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('Error in DELETE /api/admin/tokens/[tokenId]:', error);

    // Provide specific error messages based on error type
    if (error.message.includes('Circuit breaker is open')) {
      return NextResponse.json({
        error: 'Service temporarily unavailable',
        details: 'The admin API is temporarily unavailable due to recent failures. Please try again in a few minutes.',
        retryAfter: 60
      }, {
        status: 503,
        headers: { 'Retry-After': '60' }
      })
    }

    if (error.message.includes('timeout') || error.name === 'AbortError') {
      return NextResponse.json({
        error: 'Request timeout',
        details: 'The admin API is taking too long to respond. Please try again.'
      }, { status: 504 })
    }

    if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({
        error: 'Service unavailable',
        details: 'Cannot connect to the admin API service. This may be due to network issues or service maintenance.'
      }, { status: 503 })
    }

    return NextResponse.json(
      { error: 'Failed to revoke API token. Please try again later.' },
      { status: 500 }
    );
  }
} 