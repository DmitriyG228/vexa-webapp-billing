# Vexa Billing - Architecture Documentation

This document describes the system architecture, infrastructure components, and design decisions for the Vexa Billing platform.

## Table of Contents

- [Overview](#overview)
- [Infrastructure Components](#infrastructure-components)
- [Service Architecture](#service-architecture)
- [Data Flow](#data-flow)
- [Security Model](#security-model)
- [Scaling Strategy](#scaling-strategy)
- [Networking](#networking)
- [Monitoring and Observability](#monitoring-and-observability)
- [Disaster Recovery](#disaster-recovery)

## Overview

The Vexa Billing platform consists of two microservices deployed on Google Cloud Run:

1. **Webapp** (Next.js): User-facing web application for authentication, dashboard, and subscription management
2. **Billing** (FastAPI): Backend service handling Stripe integration, webhooks, and billing logic

### Key Design Principles

- **Serverless-First**: Leveraging Cloud Run for automatic scaling and zero maintenance
- **Infrastructure as Code**: All resources managed via Terraform
- **Security by Default**: Secrets in Secret Manager, minimal IAM permissions, encrypted at rest
- **Environment Isolation**: Separate dev and prod environments with independent resources
- **CI/CD Automation**: Automated deployments via Cloud Build triggers

## Infrastructure Components

### Google Cloud Platform Services

```
┌─────────────────────────────────────────────────────────────────┐
│                        GCP Project                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐         ┌────────────────┐                  │
│  │  Cloud Run     │         │  Cloud Run     │                  │
│  │  (Webapp)      │────────▶│  (Billing)     │                  │
│  │  Port: 3000    │  HTTP   │  Port: 9000    │                  │
│  └────────┬───────┘         └────────┬───────┘                  │
│           │                          │                           │
│           │ Secrets                  │ Secrets                   │
│           ▼                          ▼                           │
│  ┌──────────────────────────────────────────┐                   │
│  │       Secret Manager                     │                   │
│  │  - Stripe keys, OAuth secrets, etc.      │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                   │
│  ┌──────────────────────────────────────────┐                   │
│  │       Artifact Registry                  │                   │
│  │  - Docker images (webapp, billing)       │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                   │
│  ┌──────────────────────────────────────────┐                   │
│  │       Cloud Build                        │                   │
│  │  - CI/CD triggers (develop/main)         │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                   │
└───────────────────────────────────────────────────────────────┘

External Services:
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Stripe     │───────▶│   Billing    │───────▶│  Vexa Admin  │
│   Webhooks   │        │   Service    │  API   │     API      │
└──────────────┘        └──────────────┘        └──────────────┘
```

### Component Details

#### 1. Cloud Run Services

**Webapp Service** (`{env}-webapp`)
- **Runtime**: Node.js 18 (Alpine)
- **Framework**: Next.js 14 with App Router
- **Port**: 3000
- **Scaling**: 0-10 instances (dev), 1-10 instances (prod)
- **Resources**: 1 CPU, 512Mi RAM (dev), 2 CPU, 1Gi RAM (prod)
- **Ingress**: Public (allows all traffic)

**Billing Service** (`{env}-billing`)
- **Runtime**: Python 3.11
- **Framework**: FastAPI with Uvicorn
- **Port**: 9000
- **Scaling**: 0-5 instances (dev), 1-5 instances (prod)
- **Resources**: 1 CPU, 256Mi RAM (dev), 1 CPU, 512Mi RAM (prod)
- **Ingress**: Public (for Stripe webhooks)

#### 2. Secret Manager

Secrets are environment-specific and follow the naming pattern: `{env}-{secret-name}`

**Shared Secrets** (both services):
- `stripe-secret-key`
- `stripe-webhook-secret`
- `admin-api-url`
- `admin-api-token`
- `portal-return-url`

**Webapp-Only Secrets**:
- `nextauth-secret`
- `nextauth-url`
- `google-client-id`
- `google-client-secret`

**Access Control**:
- Each Cloud Run service has a dedicated service account
- Service accounts have `secretmanager.secretAccessor` role for their required secrets
- Secrets are accessed via volume mounts at runtime

#### 3. Artifact Registry

- **Repository Name**: `{env}-vexa-billing`
- **Format**: Docker
- **Location**: us-central1 (configurable)
- **Retention**: Latest + last 10 tagged versions
- **Images**: `webapp:latest`, `webapp:{SHA}`, `billing:latest`, `billing:{SHA}`

#### 4. Cloud Build

**Triggers**:

| Trigger | Branch | Path Filter | Action |
|---------|--------|-------------|--------|
| `dev-webapp-deploy` | develop | `apps/webapp/**`, `product/**` | Build & deploy webapp to dev |
| `dev-billing-deploy` | develop | `apps/billing/**` | Build & deploy billing to dev |
| `prod-webapp-deploy` | main | `apps/webapp/**`, `product/**` | Build & deploy webapp to prod |
| `prod-billing-deploy` | main | `apps/billing/**` | Build & deploy billing to prod |

**Build Process**:
1. Build Docker image
2. Push to Artifact Registry with SHA tag and `latest` tag
3. Deploy to Cloud Run with environment-specific configuration
4. Update secrets from Secret Manager

## Service Architecture

### Webapp (Next.js)

```
┌─────────────────────────────────────────────────────────────┐
│                      Webapp Service                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Next.js App Router                        │   │
│  │  ┌───────────┐  ┌───────────┐  ┌────────────────┐  │   │
│  │  │   Pages   │  │  API      │  │  Components    │  │   │
│  │  │  /pricing │  │ /api/auth │  │  - Dashboard   │  │   │
│  │  │ /dashboard│  │ /api/admin│  │  - Pricing     │  │   │
│  │  │   /blog   │  │ /api/     │  │  - Auth        │  │   │
│  │  └───────────┘  │  stripe   │  └────────────────┘  │   │
│  │                 └───────────┘                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Libraries & Integrations                     │   │
│  │  - NextAuth.js (Google OAuth)                        │   │
│  │  - Billing Client (service-to-service)               │   │
│  │  - Admin API Client                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Server-side rendering (SSR) for SEO
- Google OAuth authentication via NextAuth.js
- Admin API integration for user management
- Billing service integration for subscriptions
- Blog with MDX support
- Dashboard for API key management

### Billing Service (FastAPI)

```
┌─────────────────────────────────────────────────────────────┐
│                    Billing Service                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               FastAPI Endpoints                      │   │
│  │                                                       │   │
│  │  POST /v1/stripe/webhook                             │   │
│  │    ├─ Handle subscription events                     │   │
│  │    ├─ Update user entitlements                       │   │
│  │    └─ Reconcile subscription state                   │   │
│  │                                                       │   │
│  │  POST /v1/trials/api-key                             │   │
│  │    ├─ Create Stripe subscription with trial          │   │
│  │    └─ Generate API token                             │   │
│  │                                                       │   │
│  │  POST /v1/portal/session                             │   │
│  │    └─ Create Stripe customer portal session          │   │
│  │                                                       │   │
│  │  POST /v1/stripe/resolve-url                         │   │
│  │    ├─ Determine user subscription state              │   │
│  │    └─ Return checkout or portal URL                  │   │
│  │                                                       │   │
│  │  GET /v1/stats                                       │   │
│  │    └─ Aggregate billing statistics                   │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         External Integrations                        │   │
│  │  - Stripe API (subscriptions, customers, webhooks)   │   │
│  │  - Vexa Admin API (user management, entitlements)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Stripe webhook signature verification
- Subscription state reconciliation (prevents race conditions)
- Customer portal management
- API key trial creation (1-hour free trial)
- Entitlement calculation and syncing with Admin API

## Data Flow

### User Subscription Flow

```
1. User visits pricing page (Webapp)
   │
   ├─▶ 2. User clicks "Subscribe" (Webapp)
   │      │
   │      └─▶ 3. POST /v1/stripe/resolve-url (Billing)
   │             │
   │             ├─▶ Check if user has subscription
   │             │
   │             └─▶ Return Stripe Checkout URL
   │
   └─▶ 4. User redirected to Stripe Checkout
          │
          └─▶ 5. User completes payment
                 │
                 └─▶ 6. Stripe sends webhook (Billing)
                        │
                        ├─▶ 7. Verify webhook signature
                        │
                        ├─▶ 8. Reconcile subscription state
                        │
                        ├─▶ 9. Calculate entitlements
                        │
                        └─▶ 10. Update user via Admin API
                               │
                               └─▶ 11. User gets access
```

### Webhook Processing Flow

```
Stripe Webhook
    │
    ├─▶ Signature Verification
    │      │
    │      ├─ Valid ──▶ Process Event
    │      │              │
    │      │              ├─▶ Extract email
    │      │              │
    │      │              ├─▶ Reconcile customer state
    │      │              │     (fetch all subscriptions)
    │      │              │
    │      │              ├─▶ Determine best subscription
    │      │              │     (active > trialing > others)
    │      │              │
    │      │              ├─▶ Calculate entitlements
    │      │              │     (max_bots, status, dates)
    │      │              │
    │      │              └─▶ Update Admin API
    │      │                     │
    │      │                     ├─ Find/create user
    │      │                     └─ Patch entitlements
    │      │
    │      └─ Invalid ──▶ Return 400 Error
    │
    └─▶ Return 200 OK
```

## Security Model

### Authentication & Authorization

1. **User Authentication** (Webapp):
   - Google OAuth 2.0 via NextAuth.js
   - Session stored in encrypted cookies
   - CSRF protection enabled

2. **Service-to-Service** (Webapp ↔ Billing):
   - Internal Cloud Run URLs
   - No authentication required (network-level isolation)
   - Future: Add IAM-based authentication

3. **External APIs**:
   - **Stripe**: API key authentication
   - **Admin API**: Bearer token authentication
   - **Webhooks**: Signature verification

### Secrets Management

```
Secret Flow:
  Developer → .env.dev/.env.prod
                    │
                    ├─▶ update-secrets.sh
                    │
                    └─▶ Secret Manager (encrypted at rest)
                            │
                            └─▶ Cloud Run (mounted as env vars)
                                    │
                                    └─▶ Application runtime
```

**Security Features**:
- Secrets never stored in code or version control
- Automatic encryption at rest (Google-managed keys)
- Secret versions for rollback capability
- IAM-based access control per service
- Audit logging for secret access

### Network Security

```
Internet
    │
    ├─▶ HTTPS only (enforced by Cloud Run)
    │
    ├─▶ Cloud Run Webapp (Public)
    │      │
    │      └─▶ Internal call to Billing Service
    │
    └─▶ Cloud Run Billing (Public - for webhooks)
           │
           └─▶ Stripe webhook signature verification
```

**Security Controls**:
- TLS 1.2+ enforced
- Automatic HTTPS redirects
- Webhook signature verification
- Rate limiting (Cloud Run default)
- DDoS protection (Cloud Armor - optional)

## Scaling Strategy

### Horizontal Scaling

Cloud Run automatically scales based on:
- Concurrent requests per instance
- CPU utilization
- Request latency

**Configuration**:

| Service | Min Instances | Max Instances | Concurrent Requests |
|---------|--------------|---------------|---------------------|
| Dev Webapp | 0 | 3 | 80 |
| Prod Webapp | 1 | 10 | 80 |
| Dev Billing | 0 | 2 | 80 |
| Prod Billing | 1 | 5 | 80 |

### Cold Start Mitigation

**Webapp**:
- Next.js standalone output (smaller bundle)
- Minimal dependencies in production build
- Min instances = 1 in production

**Billing**:
- Python slim image
- Pre-compiled dependencies
- Fast startup time (~2-3 seconds)

### Performance Optimization

1. **Webapp**:
   - Server-side rendering (SSR)
   - Static page generation where possible
   - Image optimization via Next.js
   - CDN caching for static assets

2. **Billing**:
   - Async request handling (FastAPI)
   - Connection pooling for external APIs
   - Webhook reconciliation (prevents duplicate processing)

## Networking

### Service URLs

**Production**:
- Webapp: `https://webapp-{hash}.run.app` (or custom domain)
- Billing: `https://billing-{hash}.run.app` (or custom domain)

**Development**:
- Webapp: `https://dev-webapp-{hash}.run.app`
- Billing: `https://dev-billing-{hash}.run.app`

### Internal Communication

Webapp → Billing:
- Direct HTTPS calls using internal Cloud Run URL
- No VPC connector required (public ingress)
- Future: Use Cloud Run internal ingress + IAM authentication

### External Integrations

1. **Stripe** → Billing:
   - Webhooks sent to public billing URL
   - Signature verification for security

2. **Billing** → Admin API:
   - HTTPS API calls with bearer token
   - Retry logic for transient failures

## Monitoring and Observability

### Logging

All logs automatically sent to Cloud Logging:

```bash
# View webapp logs
gcloud run services logs read dev-webapp --limit=100

# View billing logs
gcloud run services logs read dev-billing --limit=100

# Filter by severity
gcloud logging read "resource.type=cloud_run_revision 
  AND severity>=ERROR" --limit=50
```

### Metrics

Cloud Run provides built-in metrics:
- Request count
- Request latency (p50, p95, p99)
- Error rate
- Container CPU/memory utilization
- Instance count

### Alerting (Recommended Setup)

```yaml
# Example alert policy
- Condition: Error rate > 5% for 5 minutes
  Action: Send email/PagerDuty notification

- Condition: P95 latency > 2 seconds
  Action: Send Slack notification

- Condition: Instance count at max for 10 minutes
  Action: Send alert to scale up max_instances
```

## Disaster Recovery

### Backup Strategy

1. **Terraform State**:
   - Stored in GCS with versioning enabled
   - Automatic backups of state file
   - State file can be restored from any version

2. **Secrets**:
   - Secret Manager maintains version history
   - Can rollback to any previous secret version
   - Keep backup of secrets in secure password manager

3. **Docker Images**:
   - Artifact Registry retains all tagged images
   - Can rollback to any previous SHA
   - Automatic garbage collection after 90 days

### Recovery Procedures

**Service Rollback**:
```bash
# Deploy previous image
gcloud run deploy dev-webapp \
  --image=us-central1-docker.pkg.dev/PROJECT/REPO/webapp:PREVIOUS_SHA
```

**Infrastructure Rollback**:
```bash
# Restore terraform state
cd terraform
terraform state pull > current.tfstate
# Manually edit or restore from backup
terraform apply
```

**Secret Rollback**:
```bash
# List secret versions
gcloud secrets versions list dev-stripe-secret-key

# Enable previous version
gcloud secrets versions enable VERSION_ID --secret=dev-stripe-secret-key
```

### High Availability

- Multi-zone deployment (Cloud Run default)
- Automatic health checks and restarts
- Zero-downtime deployments
- Automatic failover

### Business Continuity

**RTO (Recovery Time Objective)**: < 1 hour
**RPO (Recovery Point Objective)**: < 5 minutes

1. Infrastructure can be redeployed from Terraform in ~15 minutes
2. Services automatically scale based on demand
3. No data loss (stateless services, Admin API handles persistence)

## Future Enhancements

1. **Custom Domains**:
   - Set up Cloud Load Balancer
   - Configure SSL certificates
   - Add billing.vexa.ai domain

2. **Enhanced Security**:
   - Enable Cloud Armor for DDoS protection
   - Add WAF rules
   - Implement IAM-based service authentication

3. **Performance**:
   - Add Cloud CDN for static assets
   - Implement Redis caching layer
   - Optimize database queries

4. **Observability**:
   - Add custom application metrics
   - Implement distributed tracing
   - Set up advanced alerting

5. **Multi-Region**:
   - Deploy to multiple regions for lower latency
   - Implement global load balancing

## References

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

