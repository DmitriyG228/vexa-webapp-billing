# Vexa Billing - Deployment Guide

This guide provides step-by-step instructions for deploying the Vexa Billing infrastructure to Google Cloud Run using Terraform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Secret Management](#secret-management)
- [Deploying Infrastructure](#deploying-infrastructure)
- [CI/CD Pipeline](#cicd-pipeline)
- [Manual Deployment](#manual-deployment)
- [Updating Services](#updating-services)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

1. **gcloud CLI** (latest version)
   ```bash
   # Install gcloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Terraform** (>= 1.0)
   ```bash
   # macOS
   brew install terraform
   
   # Linux
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

3. **Docker** (for local testing)
   ```bash
   # macOS
   brew install docker
   
   # Linux - follow Docker documentation
   ```

### GCP Project Setup

1. Create a new GCP project or use an existing one:
   ```bash
   gcloud projects create YOUR_PROJECT_ID --name="Vexa Billing"
   gcloud config set project YOUR_PROJECT_ID
   ```

2. Enable billing for the project:
   ```bash
   # Link billing account (you'll need the billing account ID)
   gcloud beta billing projects link YOUR_PROJECT_ID --billing-account=XXXXXX-XXXXXX-XXXXXX
   ```

3. Set up authentication:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

## Initial Setup

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/Vexa-ai/vexa-webapp-billing.git
cd vexa-webapp-billing

# Make scripts executable
chmod +x scripts/*.sh
```

### 2. Initialize Terraform

Run the initialization script to set up the Terraform backend and enable required APIs:

```bash
./scripts/terraform-init.sh
```

This script will:
- Create a GCS bucket for Terraform state storage
- Enable required GCP APIs (Cloud Run, Cloud Build, Secret Manager, etc.)
- Initialize Terraform with remote state backend

### 3. Configure Environment Variables

#### For Development

1. Edit `.env.dev` with your development configuration:
   ```bash
   nano .env.dev
   ```

2. Update the Terraform variables:
   ```bash
   nano terraform/environments/dev/terraform.tfvars
   ```
   
   Key values to update:
   - `project_id`: Your GCP project ID
   - `region`: Your preferred GCP region (default: us-central1)

#### For Production

1. Create production environment file:
   ```bash
   cp .env.prod.example .env.prod
   nano .env.prod
   ```

2. Update production Terraform variables:
   ```bash
   nano terraform/environments/prod/terraform.tfvars
   ```

**Important**: Never commit `.env.prod` to version control!

## Secret Management

### Creating/Updating Secrets

Use the `update-secrets.sh` script to sync secrets from your environment files to Google Secret Manager:

```bash
# For development
./scripts/update-secrets.sh dev

# For production
./scripts/update-secrets.sh prod
```

This script will:
- Read values from `.env.dev` or `.env.prod`
- Create or update secrets in Google Secret Manager
- Tag secrets with the appropriate environment

### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `stripe-secret-key` | Stripe API secret key | `sk_test_...` or `sk_live_...` |
| `stripe-webhook-secret` | Stripe webhook signing secret | `whsec_...` |
| `admin-api-url` | Vexa Admin API URL | `https://admin-api.vexa.ai` |
| `admin-api-token` | Admin API authentication token | `your_secure_token` |
| `portal-return-url` | Return URL after Stripe portal | `https://billing.vexa.ai` |
| `nextauth-secret` | NextAuth.js secret (32+ chars) | `random_32_char_string` |
| `nextauth-url` | NextAuth.js callback URL | `https://billing.vexa.ai` |
| `google-client-id` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `google-client-secret` | Google OAuth client secret | `GOCSPX-xxx` |

### Generating Secrets

```bash
# Generate a random NextAuth secret
openssl rand -base64 32

# Get Stripe keys from dashboard
# https://dashboard.stripe.com/apikeys

# Get Stripe webhook secret
# https://dashboard.stripe.com/webhooks
```

## Deploying Infrastructure

### Development Environment

1. **Plan the deployment** (review changes):
   ```bash
   ./scripts/deploy.sh dev plan
   ```

2. **Apply the deployment**:
   ```bash
   ./scripts/deploy.sh dev apply
   ```

3. **Get service URLs**:
   ```bash
   cd terraform
   terraform output webapp_url
   terraform output billing_url
   ```

### Production Environment

1. **Plan the deployment**:
   ```bash
   ./scripts/deploy.sh prod plan
   ```

2. **Apply the deployment** (requires confirmation):
   ```bash
   ./scripts/deploy.sh prod apply
   # Type 'yes' when prompted
   ```

### What Gets Deployed

The Terraform configuration deploys:

- **Artifact Registry**: Docker image repository
- **Secret Manager**: Encrypted secrets storage
- **Cloud Run Services**:
  - `dev-webapp` or `webapp` (Next.js frontend)
  - `dev-billing` or `billing` (FastAPI backend)
- **Cloud Build Triggers**:
  - Automatic deployment on git push
  - Separate triggers for webapp and billing
- **IAM Roles**: Service accounts with minimal permissions

## CI/CD Pipeline

### Automatic Deployment

Once Terraform is applied, Cloud Build triggers are automatically configured:

| Branch | Environment | Trigger |
|--------|-------------|---------|
| `develop` | Development | Auto-deploy on push |
| `main` | Production | Auto-deploy on push |

### Trigger Behavior

- **Webapp trigger**: Activates on changes to `apps/webapp/**` or `product/**`
- **Billing trigger**: Activates on changes to `apps/billing/**`

### Monitoring Builds

```bash
# View recent builds
gcloud builds list --limit=10

# Follow a specific build
gcloud builds log BUILD_ID --stream
```

## Manual Deployment

You can manually trigger deployments without going through CI/CD:

### Build and Deploy Webapp

```bash
cd apps/webapp
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_ENV=dev,_REGION=us-central1,_ARTIFACT_REGISTRY_REPO=dev-vexa-billing
```

### Build and Deploy Billing

```bash
cd apps/billing
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_ENV=dev,_REGION=us-central1,_ARTIFACT_REGISTRY_REPO=dev-vexa-billing
```

## Updating Services

### Updating Application Code

Simply push changes to the appropriate branch:

```bash
git add .
git commit -m "Update feature X"
git push origin develop  # For dev environment
# or
git push origin main     # For prod environment
```

Cloud Build will automatically build and deploy the changes.

### Updating Secrets

1. Update the environment file (`.env.dev` or `.env.prod`)
2. Run the update script:
   ```bash
   ./scripts/update-secrets.sh dev
   ```
3. Redeploy services to pick up new secrets:
   ```bash
   ./scripts/deploy.sh dev apply
   ```

### Updating Infrastructure

1. Modify Terraform files
2. Plan changes:
   ```bash
   ./scripts/deploy.sh dev plan
   ```
3. Apply changes:
   ```bash
   ./scripts/deploy.sh dev apply
   ```

## Rollback Procedures

### Rollback to Previous Docker Image

```bash
# List recent images
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/YOUR_PROJECT_ID/dev-vexa-billing/webapp

# Deploy specific version
gcloud run deploy dev-webapp \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/dev-vexa-billing/webapp:PREVIOUS_SHA \
  --region=us-central1
```

### Rollback Terraform Changes

```bash
cd terraform
# Revert to previous state
terraform state pull > backup.tfstate
# Then manually fix or use git to restore previous terraform files
terraform apply -var-file="environments/dev/terraform.tfvars"
```

### Rollback Git Commits

```bash
# Revert last commit
git revert HEAD
git push origin develop

# Or reset to specific commit (be careful!)
git reset --hard COMMIT_SHA
git push origin develop --force
```

## Troubleshooting

### Common Issues

#### 1. Terraform Backend Initialization Fails

```bash
# Error: Failed to get existing workspaces
# Solution: Ensure bucket exists and you have permissions
gsutil ls gs://vexa-billing-terraform-state
gcloud auth application-default login
```

#### 2. Secret Not Found

```bash
# Error: Secret not found
# Solution: Create the secret first
./scripts/update-secrets.sh dev
```

#### 3. Cloud Run Deployment Fails

```bash
# Check service logs
gcloud run services logs read dev-webapp --limit=50 --region=us-central1

# Check service status
gcloud run services describe dev-webapp --region=us-central1
```

#### 4. Docker Build Fails

```bash
# Test build locally
docker build -f apps/webapp/Dockerfile -t test-webapp .

# Check build logs
gcloud builds log BUILD_ID
```

#### 5. Permission Denied Errors

```bash
# Ensure you have necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:YOUR_EMAIL" \
  --role="roles/cloudbuild.builds.editor"
```

### Debugging Service Issues

```bash
# View webapp logs
gcloud run services logs read dev-webapp --limit=100 --region=us-central1

# View billing logs
gcloud run services logs read dev-billing --limit=100 --region=us-central1

# Test service endpoint
curl https://dev-webapp-XXXX.run.app/api/health

# Check secret access
gcloud secrets versions access latest --secret="dev-stripe-secret-key"
```

### Performance Issues

```bash
# Scale up instances
gcloud run services update dev-webapp \
  --min-instances=2 \
  --max-instances=20 \
  --region=us-central1

# Increase resources
gcloud run services update dev-webapp \
  --memory=1Gi \
  --cpu=2 \
  --region=us-central1
```

## Support and Resources

- **GCP Documentation**: https://cloud.google.com/run/docs
- **Terraform GCP Provider**: https://registry.terraform.io/providers/hashicorp/google/latest/docs
- **Cloud Build Documentation**: https://cloud.google.com/build/docs
- **Internal Wiki**: [Link to your internal documentation]

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure custom domain names
3. Set up Cloud CDN for static assets
4. Configure Cloud Armor for DDoS protection
5. Set up backup and disaster recovery procedures

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture details.

