.PHONY: help init build push deploy deploy-infra destroy clean status

# Ensure gcloud is in PATH
export PATH := /usr/local/Caskroom/gcloud-cli/548.0.0/google-cloud-sdk/bin:$(PATH)

# Configuration
PROJECT_ID ?= spry-pipe-425611-c4
REGION ?= us-central1
ENV ?= dev
REGISTRY = $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ENV)-vexa-billing

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

help: ## Show this help message
	@echo '$(GREEN)Vexa Billing Deployment$(RESET)'
	@echo ''
	@echo 'Usage:'
	@echo '  make <target> [ENV=dev|prod]'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'

init: ## Initialize: setup GCP APIs, Terraform backend, and secrets
	@echo "$(GREEN)Initializing infrastructure...$(RESET)"
	@./scripts/terraform-init.sh
	@echo "$(GREEN)Updating secrets for $(ENV)...$(RESET)"
	@./scripts/update-secrets.sh $(ENV)
	@echo "$(GREEN)Initialization complete!$(RESET)"

build-billing: ## Build billing Docker image
	@echo "$(GREEN)Building billing image...$(RESET)"
	@docker build \
		-f apps/billing/Dockerfile \
		-t $(REGISTRY)/billing:latest \
		-t $(REGISTRY)/billing:$(shell git rev-parse --short HEAD) \
		.
	@echo "$(GREEN)✓ Billing image built$(RESET)"

build-webapp: ## Build webapp Docker image  
	@echo "$(GREEN)Building webapp image...$(RESET)"
	@docker build \
		-f apps/webapp/Dockerfile \
		-t $(REGISTRY)/webapp:latest \
		-t $(REGISTRY)/webapp:$(shell git rev-parse --short HEAD) \
		.
	@echo "$(GREEN)✓ Webapp image built$(RESET)"

build: build-billing build-webapp ## Build all Docker images

push-billing: ## Push billing image to Artifact Registry
	@echo "$(GREEN)Pushing billing image...$(RESET)"
	@gcloud auth configure-docker $(REGION)-docker.pkg.dev --quiet
	@docker push $(REGISTRY)/billing:latest
	@docker push $(REGISTRY)/billing:$(shell git rev-parse --short HEAD) || true
	@echo "$(GREEN)✓ Billing image pushed$(RESET)"

push-webapp: ## Push webapp image to Artifact Registry
	@echo "$(GREEN)Pushing webapp image...$(RESET)"
	@gcloud auth configure-docker $(REGION)-docker.pkg.dev --quiet
	@docker push $(REGISTRY)/webapp:latest
	@docker push $(REGISTRY)/webapp:$(shell git rev-parse --short HEAD) || true
	@echo "$(GREEN)✓ Webapp image pushed$(RESET)"

push: push-billing push-webapp ## Push all images to registry

deploy-infra: ## Deploy infrastructure with Terraform (Cloud Run services, IAM, etc.)
	@echo "$(GREEN)Deploying infrastructure with Terraform...$(RESET)"
	@cd terraform && terraform apply -var-file="environments/$(ENV)/terraform.tfvars" -auto-approve
	@echo "$(GREEN)✓ Infrastructure deployed$(RESET)"
	@echo ""
	@echo "$(YELLOW)Service URLs:$(RESET)"
	@cd terraform && terraform output -json | jq -r '.webapp_url.value, .billing_url.value'

deploy: build push deploy-infra ## Full deployment: build images, push, deploy infrastructure

plan: ## Show Terraform plan (what will be deployed)
	@echo "$(GREEN)Running Terraform plan...$(RESET)"
	@cd terraform && terraform plan -var-file="environments/$(ENV)/terraform.tfvars"

status: ## Show deployment status
	@echo "$(GREEN)Deployment Status$(RESET)"
	@echo ""
	@echo "$(YELLOW)Cloud Run Services:$(RESET)"
	@gcloud run services list --platform=managed --region=$(REGION) --format="table(metadata.name,status.url,status.conditions[0].status)"
	@echo ""
	@echo "$(YELLOW)Docker Images:$(RESET)"
	@gcloud artifacts docker images list $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ENV)-vexa-billing --format="table(package,version,createTime)" --limit=10
	@echo ""
	@echo "$(YELLOW)Recent Cloud Builds:$(RESET)"
	@gcloud builds list --limit=5 --format="table(id,status,createTime)" || echo "No builds yet"

destroy: ## Destroy all infrastructure (WARNING: destructive!)
	@echo "$(YELLOW)WARNING: This will destroy all infrastructure for $(ENV)!$(RESET)"
	@read -p "Are you sure? Type '$(ENV)' to confirm: " confirm && [ "$$confirm" = "$(ENV)" ]
	@cd terraform && terraform destroy -var-file="environments/$(ENV)/terraform.tfvars"

clean: ## Clean local Docker images
	@echo "$(GREEN)Cleaning local Docker images...$(RESET)"
	@docker images | grep $(REGISTRY) | awk '{print $$3}' | xargs docker rmi -f || true
	@echo "$(GREEN)✓ Cleaned$(RESET)"

logs-webapp: ## Tail webapp logs
	@gcloud run services logs read $(ENV)-webapp --region=$(REGION) --limit=100

logs-billing: ## Tail billing logs
	@gcloud run services logs read $(ENV)-billing --region=$(REGION) --limit=100

setup-oauth: ## Show OAuth configuration instructions
	@./scripts/setup-oauth.sh $(ENV)

update-secrets: ## Update secrets from .env file
	@echo "$(GREEN)Updating secrets for $(ENV)...$(NC)"
	@./scripts/update-secrets.sh $(ENV)
	@echo "$(GREEN)Redeploying services to pick up new secrets...$(NC)"
	@cd terraform && terraform apply -var-file="environments/$(ENV)/terraform.tfvars" -auto-approve -refresh-only
	@echo "$(GREEN)✓ Secrets updated and services refreshed$(NC)"

# Quick shortcuts
dev: ENV=dev
prod: ENV=prod

.DEFAULT_GOAL := help

