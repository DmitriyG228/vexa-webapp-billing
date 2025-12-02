# Vexa Webapp & Billing

Production-ready deployment of Vexa billing services on Google Cloud Run with Terraform infrastructure management.

## 🚀 Quick Start

```bash
# One command to deploy everything:
make deploy ENV=dev

# Or step by step:
make init ENV=dev          # Setup (one-time)
make build ENV=dev         # Build Docker images
make push ENV=dev          # Push to registry
make deploy-infra ENV=dev  # Deploy to Cloud Run
```

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[Makefile](./Makefile)** - Run `make help` to see all commands

## 🏗️ Architecture

```
Makefile (Orchestration)
    ├── Docker (Build images)
    ├── Artifact Registry (Store images)
    └── Terraform (Deploy infrastructure)
          ├── Cloud Run (webapp + billing)
          ├── Secret Manager (env vars)
          ├── IAM (service accounts)
          └── Artifact Registry (docker repo)
```

## 📋 Available Commands

```bash
make help          # Show all commands
make init          # Initialize (one-time setup)
make build         # Build Docker images
make push          # Push to Artifact Registry
make deploy        # Full deployment
make deploy-infra  # Deploy Terraform only
make plan          # Show what will be deployed
make status        # Check deployment status
make logs-webapp   # View webapp logs
make logs-billing  # View billing logs
make destroy       # Remove all infrastructure
```

## 🛠️ What Each Tool Does

| Tool | Purpose | Commands |
|------|---------|----------|
| **Makefile** | Orchestration | `make deploy`, `make help` |
| **Terraform** | Infrastructure as Code | Manages Cloud Run, IAM, Secrets |
| **Docker** | Application packaging | Builds container images |
| **Cloud Run** | Serverless hosting | Runs your containers |

## 🔐 Environment Variables

Configure in `.env.dev` or `.env.prod`:

- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `ADMIN_API_URL` - Vexa Admin API URL
- `ADMIN_API_TOKEN` - Admin API token
- `NEXTAUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID` - Google OAuth ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

Update secrets with: `./scripts/update-secrets.sh dev`

## 🚢 Deployment Workflow

### Development
```bash
# Make changes
vim apps/webapp/...

# Deploy
make deploy ENV=dev

# Check status
make status ENV=dev
```

### Production
```bash
# Deploy to prod
make deploy ENV=prod

# Verify
curl https://webapp-url.run.app/api/health
```

## 📦 Project Structure

```
vexa-webapp-billing/
├── Makefile              # Deployment orchestration
├── apps/
│   ├── webapp/           # Next.js application
│   └── billing/          # FastAPI service
├── terraform/            # Infrastructure as Code
│   ├── main.tf          # Root configuration
│   ├── modules/         # Reusable modules
│   └── environments/    # Dev/Prod configs
└── scripts/             # Helper scripts
```

## 🎯 Current Deployment

**Development Environment:**
- Webapp: https://dev-webapp-leav4o4omq-uc.a.run.app
- Billing: https://dev-billing-leav4o4omq-uc.a.run.app
- Project: spry-pipe-425611-c4
- Region: us-central1

## 🔄 CI/CD

Future: Connect GitHub repository to enable automatic deployments on git push.

## 📊 Monitoring

```bash
# View logs
make logs-webapp ENV=dev
make logs-billing ENV=dev

# Check status
make status ENV=dev

# View in Cloud Console
gcloud run services list --region=us-central1
```

## 🆘 Troubleshooting

```bash
# Build fails?
make clean && make build ENV=dev

# Deploy fails?
make plan ENV=dev  # Review changes first

# Services down?
make status ENV=dev
make logs-webapp ENV=dev
```

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for detailed troubleshooting.

## 🤝 Contributing

1. Make changes in a feature branch
2. Test with `make deploy ENV=dev`
3. Create PR to `main`

## 📝 License

See [LICENSE.md](./LICENSE.md)

---

**Status**: ✅ Deployed and Running  
**Last Updated**: December 2025
