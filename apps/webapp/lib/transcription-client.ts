/**
 * Transcription Gateway Service Client
 * 
 * This client provides typed interfaces for communicating with the transcription gateway service.
 * It handles authentication, retries, and error handling for service-to-service calls.
 */

const TRANSCRIPTION_GATEWAY_URL = process.env.TRANSCRIPTION_GATEWAY_URL || 'https://transcription.vexa.ai';

function getTranscriptionAdminApiKey(): string {
  const key = process.env.TRANSCRIPTION_ADMIN_API_KEY;
  if (!key) {
    throw new Error('TRANSCRIPTION_ADMIN_API_KEY environment variable is required');
  }
  return key;
}

export interface ApiTokenRequest {
  email: string;
}

export interface ApiTokenResponse {
  user_id: number;
  email: string;
  name?: string | null;
  api_token: string;
  token_created_at: string;
  token_last_used_at: string | null;
  balance_minutes: number;
  is_active: boolean;
}

export interface BalanceResponse {
  balance_minutes: number;
  remaining_minutes: number;
  user_id: number;
  email: string;
  total_purchased_minutes: number;
  total_used_minutes: number;
}

export interface HealthResponse {
  status: string;
  transcription_service_healthy: boolean;
  timestamp: string;
}

/**
 * Base fetch wrapper with error handling
 */
async function transcriptionFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${TRANSCRIPTION_GATEWAY_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription Gateway API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Transcription client error calling ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get or create API token for a user by email
 * This endpoint uses the admin API key to authenticate
 * Reuses existing NextAuth authentication - no separate OAuth flow needed
 */
export async function getOrCreateApiToken(
  request: ApiTokenRequest & { name?: string | null }
): Promise<ApiTokenResponse> {
  const params = new URLSearchParams({ email: request.email });
  if (request.name) {
    params.append('name', request.name);
  }
  const url = `${TRANSCRIPTION_GATEWAY_URL}/admin/user-token?${params.toString()}`;
  const adminApiKey = getTranscriptionAdminApiKey();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Admin-Key': adminApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail: string;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorText;
      } catch {
        errorDetail = errorText;
      }
      
      // Log detailed error for debugging
      console.error(`Transcription Gateway API error:`, {
        status: response.status,
        statusText: response.statusText,
        url,
        errorDetail,
        hasAdminKey: !!adminApiKey,
      });
      
      throw new Error(`Transcription Gateway API error (${response.status}): ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Transcription client error calling /admin/user-token:`, error);
    throw error;
  }
}

/**
 * Get balance for authenticated user
 */
export async function getBalance(
  apiKey: string
): Promise<BalanceResponse> {
  return transcriptionFetch<BalanceResponse>('/balance', {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
    },
  });
}

/**
 * Health check for transcription gateway
 */
export async function checkTranscriptionHealth(): Promise<HealthResponse> {
  return transcriptionFetch<HealthResponse>('/health', {
    method: 'GET',
  });
}

/**
 * Utility function to get transcription gateway URL
 */
export function getTranscriptionGatewayUrl(): string {
  return TRANSCRIPTION_GATEWAY_URL;
}

