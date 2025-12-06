#!/bin/bash
# Update secrets in Google Secret Manager from environment file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Read ENV from .env file (or use parameter if provided for backward compatibility)
if [ -n "$1" ]; then
    ENVIRONMENT="$1"
else
    ENV_FILE=".env"
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}Error: .env file not found${NC}"
        echo "Please create .env from .env.example and set ENV=dev or ENV=prod"
        exit 1
    fi
    ENVIRONMENT=$(grep -E '^ENV=' "$ENV_FILE" 2>/dev/null | cut -d'=' -f2 | tr -d '\n' | tr -d '\r' || echo "dev")
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    echo -e "${RED}Error: Invalid environment '${ENVIRONMENT}'${NC}"
    echo "ENV must be set to 'dev' or 'prod' in .env file"
    exit 1
fi

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create it based on .env.example"
    exit 1
fi

echo -e "${GREEN}=== Updating Secrets for ${ENVIRONMENT} Environment ===${NC}"

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: No GCP project configured${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "Project: ${YELLOW}${PROJECT_ID}${NC}"
echo ""

# Function to update or create a secret
update_secret() {
    local secret_name="$1"
    local secret_value="$2"
    
    if [ -z "$secret_value" ]; then
        echo -e "  ${YELLOW}Skipping ${secret_name} (empty value)${NC}"
        return
    fi
    
    # Check if secret exists
    if gcloud secrets describe "${ENVIRONMENT}-${secret_name}" --project="$PROJECT_ID" &> /dev/null; then
        # Update existing secret
        echo "  Updating ${secret_name}..."
        echo -n "$secret_value" | gcloud secrets versions add "${ENVIRONMENT}-${secret_name}" \
            --data-file=- \
            --project="$PROJECT_ID"
    else
        # Create new secret
        echo "  Creating ${secret_name}..."
        echo -n "$secret_value" | gcloud secrets create "${ENVIRONMENT}-${secret_name}" \
            --data-file=- \
            --replication-policy="automatic" \
            --project="$PROJECT_ID"
    fi
    
    echo -e "  ${GREEN}✓ ${secret_name}${NC}"
}

# Read environment file and update secrets
echo -e "${YELLOW}Reading secrets from ${ENV_FILE}...${NC}"
echo ""

# Source the env file
set -a
source "$ENV_FILE"
set +a

# Update each secret
update_secret "stripe-secret-key" "$STRIPE_SECRET_KEY"
update_secret "stripe-webhook-secret" "$STRIPE_WEBHOOK_SECRET"
update_secret "admin-api-url" "$ADMIN_API_URL"
update_secret "admin-api-token" "$ADMIN_API_TOKEN"
update_secret "portal-return-url" "$PORTAL_RETURN_URL"
update_secret "nextauth-secret" "$NEXTAUTH_SECRET"
update_secret "nextauth-url" "$NEXTAUTH_URL"
update_secret "google-client-id" "$GOOGLE_CLIENT_ID"
update_secret "google-client-secret" "$GOOGLE_CLIENT_SECRET"

# GitHub secrets for blog integration
if [ ! -z "$GITHUB_TOKEN" ]; then
    update_secret "github-token" "$GITHUB_TOKEN"
fi
if [ ! -z "$GITHUB_REPO_PATH" ]; then
    update_secret "github-repo-path" "$GITHUB_REPO_PATH"
fi
if [ ! -z "$GITHUB_WEBHOOK_SECRET" ]; then
    update_secret "github-webhook-secret" "$GITHUB_WEBHOOK_SECRET"
fi

echo ""
echo -e "${GREEN}=== Secrets Updated Successfully ===${NC}"
echo ""
echo "Note: If services are already running, you may need to redeploy them to pick up new secret versions:"
echo "  make deploy-infra"

