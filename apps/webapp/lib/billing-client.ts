/**
 * Billing Service Client
 * 
 * This client provides typed interfaces for communicating with the billing service.
 * It handles authentication, retries, and error handling for service-to-service calls.
 */

const BILLING_URL = process.env.BILLING_URL || 'http://localhost:19000';

export interface TrialRequest {
  email: string;
  userId: number;
}

export interface TrialResponse {
  token: string;
  trialCreated: boolean;
  trialDuration?: string;
  trialExpiresAt?: number;
  message: string;
}

export interface PortalRequest {
  email: string;
  returnUrl?: string;
}

export interface PortalResponse {
  url: string;
}

export interface ResolveUrlRequest {
  email: string;
  context: 'pricing' | 'dashboard';
  quantity?: number;
  origin?: string;
  successUrl?: string;
  cancelUrl?: string;
  returnUrl?: string;
}

export interface ResolveUrlResponse {
  url: string;
}

export interface StatsResponse {
  total_accounts: number;
  total_contracted_bots: number;
}

/**
 * Base fetch wrapper with error handling
 */
async function billingFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BILLING_URL}${endpoint}`;
  
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
      throw new Error(`Billing API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Billing client error calling ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Create API key trial for a user
 */
export async function createApiKeyTrial(
  request: TrialRequest
): Promise<TrialResponse> {
  return billingFetch<TrialResponse>('/v1/trials/api-key', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Create a Stripe customer portal session
 */
export async function createPortalSession(
  request: PortalRequest
): Promise<PortalResponse> {
  return billingFetch<PortalResponse>('/v1/portal/session', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Resolve billing URL based on user context
 * Returns either checkout session URL or portal URL
 */
export async function resolveBillingUrl(
  request: ResolveUrlRequest
): Promise<ResolveUrlResponse> {
  return billingFetch<ResolveUrlResponse>('/v1/stripe/resolve-url', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get current billing statistics
 */
export async function getBillingStats(): Promise<StatsResponse> {
  return billingFetch<StatsResponse>('/v1/stats', {
    method: 'GET',
  });
}

/**
 * Health check for billing service
 */
export async function checkBillingHealth(): Promise<{
  status: string;
  service: string;
}> {
  return billingFetch('/', {
    method: 'GET',
  });
}

/**
 * Utility function to get billing service URL
 */
export function getBillingUrl(): string {
  return BILLING_URL;
}

// Export all types
export type {
  TrialRequest,
  TrialResponse,
  PortalRequest,
  PortalResponse,
  ResolveUrlRequest,
  ResolveUrlResponse,
  StatsResponse,
};





