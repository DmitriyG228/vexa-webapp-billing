#!/bin/bash
# Deploy Vexa Billing infrastructure using Terraform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
ENVIRONMENT="${1:-dev}"
ACTION="${2:-apply}"

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    echo -e "${RED}Error: Invalid environment '${ENVIRONMENT}'${NC}"
    echo "Usage: $0 [dev|prod] [plan|apply|destroy]"
    exit 1
fi

if [ "$ACTION" != "plan" ] && [ "$ACTION" != "apply" ] && [ "$ACTION" != "destroy" ]; then
    echo -e "${RED}Error: Invalid action '${ACTION}'${NC}"
    echo "Usage: $0 [dev|prod] [plan|apply|destroy]"
    exit 1
fi

echo -e "${GREEN}=== Deploying Vexa Billing Infrastructure ===${NC}"
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Action: ${YELLOW}${ACTION}${NC}"
echo ""

# Check if terraform is initialized
if [ ! -d "deployment/terraform/.terraform" ]; then
    echo -e "${RED}Error: Terraform not initialized${NC}"
    echo "Run: ./deployment/scripts/terraform-init.sh"
    exit 1
fi

# Check if tfvars file exists
TFVARS_FILE="deployment/terraform/environments/${ENVIRONMENT}/terraform.tfvars"
if [ ! -f "$TFVARS_FILE" ]; then
    echo -e "${RED}Error: Configuration file not found: ${TFVARS_FILE}${NC}"
    exit 1
fi

cd deployment/terraform

# Run terraform command
case $ACTION in
    plan)
        echo -e "${YELLOW}Running terraform plan...${NC}"
        terraform plan -var-file="environments/${ENVIRONMENT}/terraform.tfvars"
        ;;
    
    apply)
        echo -e "${YELLOW}Running terraform apply...${NC}"
        if [ "$ENVIRONMENT" = "prod" ]; then
            echo -e "${RED}WARNING: You are about to deploy to PRODUCTION${NC}"
            read -p "Are you sure? (type 'yes' to continue): " confirm
            if [ "$confirm" != "yes" ]; then
                echo "Deployment cancelled"
                exit 0
            fi
        fi
        terraform apply -var-file="environments/${ENVIRONMENT}/terraform.tfvars"
        
        echo -e "${GREEN}=== Deployment Complete ===${NC}"
        echo ""
        echo "Service URLs:"
        terraform output webapp_url
        terraform output billing_url
        ;;
    
    destroy)
        echo -e "${RED}WARNING: You are about to DESTROY all infrastructure for ${ENVIRONMENT}${NC}"
        read -p "Are you sure? (type 'yes' to continue): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Destruction cancelled"
            exit 0
        fi
        
        terraform destroy -var-file="environments/${ENVIRONMENT}/terraform.tfvars"
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"



