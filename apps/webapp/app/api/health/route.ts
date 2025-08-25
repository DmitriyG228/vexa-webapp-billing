import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAPIHealth } from '@/lib/admin-api-client';

export async function GET(request: NextRequest) {
  try {
    console.log('[Health] Checking admin API connectivity...');

    const health = await checkAdminAPIHealth();

    const response = {
      status: health.status,
      timestamp: new Date().toISOString(),
      services: {
        adminApi: {
          url: process.env.ADMIN_API_URL,
          status: health.status,
          responseTime: health.responseTime,
          circuitBreaker: {
            isOpen: health.circuitBreaker.isOpen,
            failureCount: health.circuitBreaker.failureCount,
            nextRetryTime: health.circuitBreaker.nextRetryTime ? new Date(health.circuitBreaker.nextRetryTime).toISOString() : null
          }
        }
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'dev'
    };

    // Return appropriate HTTP status based on health
    const httpStatus = health.status === 'healthy' ? 200 :
                      health.status === 'degraded' ? 207 : 503;

    if (health.error) {
      response.services.adminApi.error = health.error;
    }

    console.log(`[Health] Status: ${health.status}, Response time: ${health.responseTime}ms`);

    return NextResponse.json(response, { status: httpStatus });

  } catch (error) {
    console.error('[Health] Unexpected error:', error);

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error.message
    }, { status: 500 });
  }
}
