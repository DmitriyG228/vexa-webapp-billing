# Quick Start Guide

## Prerequisites

- Docker Desktop installed and running
- gcloud CLI installed and authenticated
- Terraform >= 1.0 installed
- Make installed

## Initial Setup (One-time)

```bash
# 1. Authenticate with GCP
gcloud auth login
gcloud auth application-default login
gcloud config set project spry-pipe-425611-c4

# 2. Initialize infrastructure (creates GCS bucket, enables APIs, uploads secrets)
make init ENV=dev

# 3. Build and deploy everything
make deploy ENV=dev
```

That's it! Your services are now running on Cloud Run.

## Common Commands

```bash
# Show all available commands
make help

# Build Docker images locally
make build

# Push images to Artifact Registry
make push

# Deploy infrastructure with Terraform
make deploy-infra

# Full deployment (build + push + deploy)
make deploy

# Check deployment status
make status

# View logs
make logs-webapp
make logs-billing

# Destroy everything (careful!)
make destroy ENV=dev
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Makefile                            │
│  (Orchestration - ties everything together)             │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             ▼                        ▼
    ┌────────────────┐      ┌─────────────────────┐
    │  Docker Build  │      │     Terraform       │
    │  (App Images)  │      │  (Infrastructure)   │
    └────────┬───────┘      └──────────┬──────────┘
             │                         │
             ▼                         ▼
    ┌────────────────┐      ┌─────────────────────┐
    │    Artifact    │      │   Cloud Run         │
    │    Registry    │◀─────│   Services          │
    └────────────────┘      │   + IAM + Secrets   │
                            └─────────────────────┘
```

## What Each Tool Does

### Docker
- **Purpose**: Package applications into container images
- **Commands**: `make build`, `make push`
- **Output**: Docker images in Artifact Registry

### Terraform
- **Purpose**: Manage cloud infrastructure as code
- **Commands**: `make deploy-infra`, `make plan`, `make destroy`
- **Manages**:
  - Cloud Run services
  - IAM roles and service accounts
  - Secret Manager secrets
  - Artifact Registry
  - (Future: Cloud Build triggers when GitHub connected)

### Makefile
- **Purpose**: Orchestrate the deployment process
- **Benefits**:
  - Reproducible deployments
  - Single source of truth for commands
  - Environment management (dev/prod)
  - Documentation built-in (`make help`)

## Development Workflow

### Making Changes to Code

```bash
# 1. Edit your code
vim apps/webapp/...

# 2. Rebuild and redeploy
make deploy ENV=dev
```

### Updating Secrets

```bash
# 1. Edit environment file
vim .env.dev

# 2. Update secrets in Secret Manager
./scripts/update-secrets.sh dev

# 3. Redeploy services to pick up new secrets
make deploy-infra ENV=dev
```

### Deploying to Production

```bash
# 1. Test in dev first
make deploy ENV=dev
make status ENV=dev

# 2. Deploy to prod
make deploy ENV=prod
make status ENV=prod
```

## Troubleshooting

### Build Fails

```bash
# Check Docker is running
docker info

# Clean and rebuild
make clean
make build
```

### Deploy Fails

```bash
# Check Terraform plan first
make plan ENV=dev

# Check service status
make status ENV=dev

# View logs
make logs-webapp ENV=dev
```

### Images Not Found

```bash
# Ensure images are pushed
make push ENV=dev

# Verify in registry
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/spry-pipe-425611-c4/dev-vexa-billing
```

## Next Steps

1. Connect GitHub repository for automatic CI/CD
2. Set up custom domains
3. Configure monitoring and alerts
4. Add production secrets to `.env.prod`

For detailed documentation, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

