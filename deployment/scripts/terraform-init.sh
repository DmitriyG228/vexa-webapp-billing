#!/bin/bash
# Initialize Terraform infrastructure for Vexa Billing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Terraform Infrastructure Initialization ===${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: terraform is not installed${NC}"
    echo "Please install it from: https://www.terraform.io/downloads"
    exit 1
fi

# Get project ID from gcloud config or ask user
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No default project set in gcloud${NC}"
    read -p "Enter your GCP Project ID: " PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo -e "${GREEN}Using GCP Project: ${PROJECT_ID}${NC}"

# Create GCS bucket for Terraform state if it doesn't exist
BUCKET_NAME="vexa-billing-terraform-state"
REGION="us-central1"

echo -e "${YELLOW}Checking if state bucket exists...${NC}"
if gsutil ls -b "gs://${BUCKET_NAME}" &> /dev/null; then
    echo -e "${GREEN}State bucket already exists: gs://${BUCKET_NAME}${NC}"
else
    echo -e "${YELLOW}Creating GCS bucket for Terraform state...${NC}"
    gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://${BUCKET_NAME}"
    
    # Enable versioning for state backup
    gsutil versioning set on "gs://${BUCKET_NAME}"
    
    echo -e "${GREEN}Created state bucket: gs://${BUCKET_NAME}${NC}"
fi

# Enable required GCP APIs
echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
APIS=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "secretmanager.googleapis.com"
    "artifactregistry.googleapis.com"
    "iam.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo "  - Enabling $api..."
    gcloud services enable "$api" --project="$PROJECT_ID"
done

echo -e "${GREEN}All required APIs enabled${NC}"

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
cd deployment/terraform
terraform init -backend-config="bucket=${BUCKET_NAME}"

echo -e "${GREEN}=== Initialization Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Configure secrets: ./deployment/scripts/update-secrets.sh dev"
echo "2. Review and update deployment/terraform/environments/dev/terraform.tfvars with your project settings"
echo "3. Deploy infrastructure: make deploy ENV=dev"



