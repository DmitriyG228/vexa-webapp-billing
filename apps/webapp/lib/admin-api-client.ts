// Admin API Client with Circuit Breaker Pattern
// This provides resilience against admin API failures

interface CircuitBreakerState {
  failureCount: number;
  lastFailureTime: number;
  isOpen: boolean;
  nextRetryTime: number;
}

interface AdminAPIConfig {
  baseURL: string;
  token: string;
  timeout: number;
  maxRetries: number;
  circuitBreakerThreshold: number; // failures before opening circuit
  circuitBreakerTimeout: number; // ms to wait before trying again
}

class AdminAPICircuitBreaker {
  private state: CircuitBreakerState = {
    failureCount: 0,
    lastFailureTime: 0,
    isOpen: false,
    nextRetryTime: 0
  };

  private config: AdminAPIConfig;

  constructor(config: AdminAPIConfig) {
    this.config = config;
  }

  async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Check if circuit breaker is open
    if (this.state.isOpen) {
      const now = Date.now();
      if (now < this.state.nextRetryTime) {
        // Circuit is open, fail fast
        throw new Error('Circuit breaker is open - admin API temporarily unavailable');
      } else {
        // Time to try again, close circuit for this attempt
        this.state.isOpen = false;
        console.log(`[CircuitBreaker] Attempting to close circuit after timeout`);
      }
    }

    try {
      const response = await this.makeRequest(endpoint, options);

      // Success - reset failure count
      this.state.failureCount = 0;
      return response;

    } catch (error) {
      // Failure - increment counter and potentially open circuit
      this.state.failureCount++;
      this.state.lastFailureTime = Date.now();

      console.error(`[CircuitBreaker] Request failed (${this.state.failureCount}/${this.config.circuitBreakerThreshold}):`, error.message);

      if (this.state.failureCount >= this.config.circuitBreakerThreshold) {
        // Open the circuit
        this.state.isOpen = true;
        this.state.nextRetryTime = Date.now() + this.config.circuitBreakerTimeout;

        console.error(`[CircuitBreaker] Opening circuit breaker. Next retry at ${new Date(this.state.nextRetryTime).toISOString()}`);
      }

      throw error;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = `${this.config.baseURL}${endpoint}`;

    // Add timeout and default headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-Admin-API-Key': this.config.token,
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - admin API is not responding');
      }

      throw error;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  // Force close circuit (for testing/recovery)
  closeCircuit(): void {
    this.state.isOpen = false;
    this.state.failureCount = 0;
    console.log('[CircuitBreaker] Circuit manually closed');
  }
}

// Global circuit breaker instance
let globalCircuitBreaker: AdminAPICircuitBreaker | null = null;

export function getAdminAPIClient(): AdminAPICircuitBreaker {
  if (!globalCircuitBreaker) {
    const config: AdminAPIConfig = {
      baseURL: process.env.ADMIN_API_URL || 'http://localhost:8000',
      token: process.env.ADMIN_API_TOKEN || '',
      timeout: 15000, // 15 seconds
      maxRetries: 2,
      circuitBreakerThreshold: 5, // Open after 5 failures
      circuitBreakerTimeout: 60000 // Wait 1 minute before retry
    };

    if (!config.token) {
      console.error('ADMIN_API_TOKEN not configured - admin API calls will fail');
    }

    globalCircuitBreaker = new AdminAPICircuitBreaker(config);
  }

  return globalCircuitBreaker;
}

// Health check function for monitoring
export async function checkAdminAPIHealth(): Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded';
  circuitBreaker: CircuitBreakerState;
  responseTime?: number;
  error?: string;
}> {
  const client = getAdminAPIClient();
  const startTime = Date.now();

  try {
    // Try a simple health check by fetching a non-existent user
    // This should return a 404 but test connectivity
    const response = await client.fetch('/admin/users/-1');

    const responseTime = Date.now() - startTime;

    if (response.status === 404) {
      return {
        status: 'healthy',
        circuitBreaker: client.getState(),
        responseTime
      };
    } else {
      return {
        status: 'degraded',
        circuitBreaker: client.getState(),
        responseTime,
        error: `Unexpected response: ${response.status}`
      };
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'unhealthy',
      circuitBreaker: client.getState(),
      responseTime,
      error: error.message
    };
  }
}
