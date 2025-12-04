# Vexa Webapp & Billing

Production billing and webapp services on Google Cloud Run with Terraform infrastructure.

## Quick Start

```bash
# 1. Authenticate once (browser-based, no password)
make auth

# 2. Run locally for development
make dev

# 3. Deploy to staging
make deploy-dev

# 4. (Optional) Setup custom domains
make setup-domain-dev

# 5. Deploy to production
make deploy-prod
make setup-domain-prod  # Optional: custom domains for production
```

## Services

**Staging (dev)**:
- Direct URLs: 
  - Webapp: https://dev-webapp-leav4o4omq-uc.a.run.app
  - Billing: https://dev-billing-leav4o4omq-uc.a.run.app
- Custom domains (after `make setup-domain-dev`):
  - Webapp: https://webapp-dev.vexa.ai
  - Billing: https://billing-dev.vexa.ai

**Production (prod)**:
- Deploy with `make deploy-prod`
- Custom domains (after `make setup-domain-prod`):
  - Webapp: https://webapp-prod.vexa.ai
  - Billing: https://billing-prod.vexa.ai

## Setup (One-Time)

### Prerequisites
- Docker Desktop
- **gcloud CLI**: `brew install --cask google-cloud-sdk` (then restart terminal)
- Terraform >= 1.0
- Node.js & npm (for local development)

### Initial Setup

```bash
# 1. Authenticate with GCloud (opens browser, persists across all shells)
make auth

# 2. Configure environment
cp .env.example .env.dev
vim .env.dev  # Add your values

# 3. Run locally or deploy
make dev              # Local development with hot reload
make deploy-dev       # Deploy to staging with automatic secret sync
```

## Configuration

**Staging**: Edit `.env.dev` (already exists)
**Production**: Create `.env.prod` from template:
```bash
cp .env.prod.example .env.prod
vim .env.prod  # Add production values
```

Environment variables (in `.env.dev` or `.env.prod`):

```bash
# Core Services
ADMIN_API_URL=https://api-dev.vexa.ai
ADMIN_API_TOKEN=your_token

# Stripe
STRIPE_SECRET_KEY=sk_test_...        # Use sk_live_... for prod
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
NEXTAUTH_SECRET=random_32_chars      # Generate with: openssl rand -base64 32
NEXTAUTH_URL=https://webapp_dev.vexa.ai  # or https://webapp_prod.vexa.ai

# Portal
PORTAL_RETURN_URL=https://webapp_dev.vexa.ai  # or https://webapp_prod.vexa.ai

# Cloudflare (optional, for custom domains)
CLOUDFLARE_TOKEN=your_cloudflare_token_here

# Blog (optional)
GITHUB_TOKEN=ghp_...
GITHUB_REPO_PATH=dev                 # or blank for prod
GITHUB_WEBHOOK_SECRET=
```

**Note**: Secrets are automatically synced to GCP Secret Manager when running `make deploy-dev` or `make deploy-prod`.

## Integration URLs

Use your Cloud Run URLs (shown after deployment):

### Stripe Webhook
```
https://dev-billing-xxxxx-uc.a.run.app/v1/stripe/webhook
```
Add at: https://dashboard.stripe.com/webhooks

### OAuth Redirect URI
```
https://dev-webapp-xxxxx-uc.a.run.app/api/auth/callback/google
```
Add to your OAuth 2.0 Client at: https://console.cloud.google.com/apis/credentials

### Blog Webhook (optional)
```
https://dev-webapp-xxxxx-uc.a.run.app/api/github-webhook
```
Add in `Vexa-ai/blog_articles` repo settings

## Commands

### Development
```bash
make dev            # Run webapp locally (port 3002, hot reload)
```

### Authentication
```bash
make auth           # One-time GCloud authentication (browser-based)
```

### Deployment
```bash
make deploy-dev     # Deploy to staging (auto-updates secrets from .env.dev)
make deploy-prod    # Deploy to production (auto-updates secrets from .env.prod)
```

### Custom Domains (Optional)
```bash
# Setup custom domains for dev environment
make setup-domain-dev   # Creates: webapp-dev.vexa.ai, billing-dev.vexa.ai

# Setup custom domains for prod environment
make setup-domain-prod  # Creates: webapp-prod.vexa.ai, billing-prod.vexa.ai
```

**What this does:**
1. Creates Cloud Run domain mappings (tells Cloud Run to accept custom domains)
2. Updates Cloudflare DNS automatically with CNAME records
3. Waits for Google to provision SSL certificates (~15-30 min)

**Requirements:**
- Add `CLOUDFLARE_TOKEN` to your `.env.dev` or `.env.prod` file
- Or manually add the CNAME records shown by the script if token not set

### Monitoring
```bash
make help           # Show all commands
make status         # Check deployment status
make logs-webapp    # View webapp logs
make logs-billing   # View billing logs
```

### Manual Operations
```bash
make update-secrets # Manually update secrets (use ENV=dev or ENV=prod)
make build          # Build Docker images only
make push           # Push images to registry
```

## Environments

| Environment | Command | Purpose |
|------------|---------|---------|
| **Local** | `make dev` | Fast development with hot reload |
| **Staging** | `make deploy-dev` | Testing & QA (auto-updates secrets) |
| **Production** | `make deploy-prod` | Live traffic (requires .env.prod) |

## Architecture

```
Makefile
  ├─► Docker         Build images
  ├─► Push           Store in Artifact Registry  
  └─► Terraform      Deploy to Cloud Run
        ├─ Services (webapp + billing)
        ├─ Secrets
        └─ IAM
```

## Project Structure

```
vexa-webapp-billing/
├── apps/
│   ├── webapp/         Next.js application
│   └── billing/        FastAPI service
├── deployment/         All infrastructure
│   ├── terraform/      Infrastructure as Code
│   └── scripts/        Automation scripts
├── Makefile            Deployment commands
├── .env.dev            Staging config
└── .env.prod.example   Production template
```

## Daily Workflow

### Local Development
```bash
vim apps/webapp/...
make dev              # Test locally with hot reload
```

### Deploy Changes
```bash
vim apps/webapp/...
make deploy-dev       # Automatically updates secrets and deploys
```

### Update Config
```bash
vim .env.dev
make deploy-dev       # Deploys with updated secrets
```

### View Logs
```bash
make logs-webapp      # Staging logs (add ENV=prod for production)
make logs-billing
```

## Infrastructure

Managed by Terraform in `deployment/terraform/`:
- Cloud Run services (auto-scaling)
- Secret Manager (encrypted secrets)
- Artifact Registry (Docker images)
- IAM service accounts
- API enablements

All infrastructure is version-controlled and reproducible.

## Troubleshooting

```bash
# Authentication issues
make auth             # Re-authenticate with browser

# Check status
make status           # Add ENV=prod for production

# View logs
make logs-webapp      # Add ENV=prod for production

# Rebuild and redeploy
make clean
make deploy-dev       # or make deploy-prod

# Check Terraform plan before deploying
make plan ENV=dev     # or ENV=prod

# Local development not loading env vars
# Ensure .env.dev exists and is readable
cat .env.dev
```

**Common Issues:**
- **Service not responding**: Check `make status` and `make logs-webapp`
- **Secret changes not applied**: Run `make update-secrets ENV=dev` after editing `.env.dev`
- **Build failed**: Check Docker is running and you have enough disk space

## Cost

Dev/Staging (minimal traffic): ~$7-14/month
- Cloud Run: $5-10/month
- Artifact Registry: $2-3/month
- Secret Manager: <$1/month

Production scales with usage.

## Security

- All secrets in Secret Manager
- HTTPS-only endpoints
- IAM-based access control
- Secrets never in code/images

## Support

Run `make help` to see all available commands.

---

**Status**: ✅ Deployed  
**Project**: spry-pipe-425611-c4  
**Region**: us-central1
