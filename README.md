# Vexa Webapp & Billing

Production billing and webapp services on Google Cloud Run.

## Quick Start

```bash
# 1. Authenticate (one-time)
make auth

# 2. Configure environment
cp .env.example .env
# Edit .env and set ENV=dev or ENV=prod

# 3. Initialize (one-time)
make init

# 4. Update variables (when .env or terraform.tfvars changes)
make vars

# 5. Build and push images
make build

# 6. Deploy
make deploy

# 7. Setup DNS
make dns
```

## Commands

| Command | Description |
|---------|-------------|
| `make init` | One-time setup (GCP APIs, Terraform backend) |
| `make vars` | Update all variables (secrets + terraform.tfvars + import existing) |
| `make build` | Build and push Docker images |
| `make deploy` | Deploy to Cloud Run |
| `make dns` | Setup Cloudflare DNS → GCP Cloud Run for custom domain |

### Other Commands

- `make dev` - Run webapp locally
- `make auth` - Authenticate with GCloud
- `make dns` - Setup Cloudflare DNS for custom domain
- `make status` - Show deployment status
- `make logs-webapp` - View webapp logs
- `make logs-billing` - View billing logs
- `make clean` - Clean local Docker images

## Configuration

Set `ENV=dev` or `ENV=prod` in `.env` file to switch environments.

Each environment uses separate:
- Terraform state: `terraform/state/$(ENV)/terraform.tfstate`
- Docker registry: `$(ENV)-vexa-billing`
- Cloud Run services: `$(ENV)-webapp`, `$(ENV)-billing`

## Environment Variables

Edit `.env` file with your values:

```bash
ENV=dev  # or prod

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin API
ADMIN_API_URL=https://api.vexa.ai
ADMIN_API_TOKEN=your_token

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://webapp-dev.vexa.ai

# Portal
PORTAL_RETURN_URL=https://webapp-dev.vexa.ai

# Cloudflare (for make dns)
CLOUDFLARE_TOKEN=your_cloudflare_token
```

## Workflow

### First Time Setup
```bash
make auth      # Authenticate
make init      # Setup infrastructure
```

### Regular Deployment
```bash
make vars      # Update variables (if changed)
make build     # Build and push images
make deploy    # Deploy to Cloud Run
```

### Setup Custom Domain
```bash
make dns       # Interactive setup: enter domain, choose service (webapp/billing)
               # Requires CLOUDFLARE_TOKEN in .env file
```

### Local Development
```bash
make dev       # Run locally on http://localhost:3000
```

## Troubleshooting

```bash
# Check status
make status

# View logs
make logs-webapp
make logs-billing

# Re-authenticate
make auth

# If you get 409 errors (resource already exists)
make vars  # This will automatically import existing resources
make deploy  # Then deploy again

# Clean and rebuild
make clean
make build
```

## Project Structure

```
vexa-webapp-billing/
├── apps/
│   ├── webapp/         Next.js application
│   └── billing/        FastAPI service
├── deployment/
│   ├── terraform/      Infrastructure
│   └── scripts/        Automation
├── .env                Configuration (set ENV=dev or ENV=prod)
└── Makefile            Commands
```

## Services

After deployment, services are available at:
- Webapp: `https://$(ENV)-webapp-xxxxx-uc.a.run.app`
- Billing: `https://$(ENV)-billing-xxxxx-uc.a.run.app`

Run `make status` to see exact URLs.

---

**Project**: spry-pipe-425611-c4  
**Region**: us-central1
