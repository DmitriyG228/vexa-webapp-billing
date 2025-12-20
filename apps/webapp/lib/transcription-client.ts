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
  token_id?: number;
}

export interface ApiToken {
  id: number;
  token: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export interface UserTokensResponse {
  user_id: number;
  email: string;
  balance_minutes: number;
  tokens: ApiToken[];
}

export interface BalanceResponse {
  balance_minutes: number;
  remaining_minutes: number;
  user_id: number;
  email: string;
  total_purchased_minutes: number;
  total_used_minutes: number;
}

export interface UsageHistoryItem {
  date: string;
  minutes: number;
}

export interface UsageStatisticsResponse {
  user_id: number;
  email: string;
  balance_minutes: number;
  total_purchased_minutes: number;
  total_used_minutes: number;
  usage_history: UsageHistoryItem[];
  statistics: {
    period_days: number;
    total_minutes_last_period: number;
    average_daily_minutes: number;
    days_with_usage: number;
  };
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
      let errorDetail: string;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      throw new Error(`Transcription Gateway API error (${response.status}): ${errorDetail}`);
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
 * Get usage statistics including history
 */
export async function getUsageStatistics(
  apiKey: string,
  days: number = 30
): Promise<UsageStatisticsResponse> {
  const params = new URLSearchParams({ days: days.toString() });
  return transcriptionFetch<UsageStatisticsResponse>(`/usage?${params.toString()}`, {
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
 * Revoke (delete) API token for a user by email
 */
export async function revokeApiToken(
  request: ApiTokenRequest
): Promise<{ message: string; user_id: number; email: string }> {
  const params = new URLSearchParams({ email: request.email });
  const url = `${TRANSCRIPTION_GATEWAY_URL}/admin/user-token?${params.toString()}`;
  const adminApiKey = getTranscriptionAdminApiKey();
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
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
        errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      
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
    console.error(`Transcription client error calling DELETE /admin/user-token:`, error);
    throw error;
  }
}

/**
 * Regenerate API token for a user by email
 * This will delete the old token and create a new one
 */
export async function regenerateApiToken(
  request: ApiTokenRequest & { name?: string | null }
): Promise<ApiTokenResponse & { message?: string }> {
  const params = new URLSearchParams({ email: request.email });
  if (request.name) {
    params.append('name', request.name);
  }
  const url = `${TRANSCRIPTION_GATEWAY_URL}/admin/user-token/regenerate?${params.toString()}`;
  const adminApiKey = getTranscriptionAdminApiKey();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
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
        errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      
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
    console.error(`Transcription client error calling POST /admin/user-token/regenerate:`, error);
    throw error;
  }
}

/**
 * List all API tokens for a user
 */
export async function listUserTokens(
  request: ApiTokenRequest
): Promise<UserTokensResponse> {
  const params = new URLSearchParams({ email: request.email });
  const url = `${TRANSCRIPTION_GATEWAY_URL}/admin/user-tokens?${params.toString()}`;
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
        errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      
      throw new Error(`Transcription Gateway API error (${response.status}): ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Transcription client error calling GET /admin/user-tokens:`, error);
    throw error;
  }
}

/**
 * Create a new API token with an optional name
 */
export async function createUserToken(
  request: ApiTokenRequest & { token_name?: string; user_name?: string | null }
): Promise<ApiTokenResponse & { token_id: number; message?: string }> {
  const params = new URLSearchParams({ email: request.email });
  if (request.token_name) {
    params.append('token_name', request.token_name);
  }
  if (request.user_name) {
    params.append('user_name', request.user_name);
  }
  const url = `${TRANSCRIPTION_GATEWAY_URL}/admin/user-tokens?${params.toString()}`;
  const adminApiKey = getTranscriptionAdminApiKey();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
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
        errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      
      throw new Error(`Transcription Gateway API error (${response.status}): ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Transcription client error calling POST /admin/user-tokens:`, error);
    throw error;
  }
}

/**
 * Delete a specific API token by ID
 */
export async function deleteUserToken(
  request: ApiTokenRequest & { token_id: number }
): Promise<{ message: string; token_id: number; user_id: number; email: string }> {
  const params = new URLSearchParams({ email: request.email });
  const url = `${TRANSCRIPTION_GATEWAY_URL}/admin/user-tokens/${request.token_id}?${params.toString()}`;
  const adminApiKey = getTranscriptionAdminApiKey();
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
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
        errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      
      throw new Error(`Transcription Gateway API error (${response.status}): ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Transcription client error calling DELETE /admin/user-tokens/${request.token_id}:`, error);
    throw error;
  }
}

/**
 * Update a token's name
 */
export async function updateUserToken(
  request: ApiTokenRequest & { token_id: number; token_name: string }
): Promise<{ message: string; token_id: number; name: string; user_id: number; email: string }> {
  const params = new URLSearchParams({ email: request.email, token_name: request.token_name });
  const url = `${TRANSCRIPTION_GATEWAY_URL}/admin/user-tokens/${request.token_id}?${params.toString()}`;
  const adminApiKey = getTranscriptionAdminApiKey();
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
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
        errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      
      throw new Error(`Transcription Gateway API error (${response.status}): ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Transcription client error calling PATCH /admin/user-tokens/${request.token_id}:`, error);
    throw error;
  }
}

/**
 * Utility function to get transcription gateway URL
 */
export function getTranscriptionGatewayUrl(): string {
  return TRANSCRIPTION_GATEWAY_URL;
}







