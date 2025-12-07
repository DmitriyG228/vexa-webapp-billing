.PHONY: help init vars build deploy unlock dns dev auth status logs-webapp logs-billing clean

# ============================================================================
# CONFIGURATION
# ============================================================================

# Add gcloud to PATH
GCLOUD_SDK_PATHS := /usr/local/Caskroom/gcloud-cli/*/google-cloud-sdk/bin /opt/homebrew/Caskroom/google-cloud-sdk/*/google-cloud-sdk/bin $(HOME)/google-cloud-sdk/bin
GCLOUD_PATH := $(shell for path in $(GCLOUD_SDK_PATHS); do [ -f "$$path/gcloud" ] && echo $$path && break; done)
export PATH := $(GCLOUD_PATH):$(PATH)

# Configuration
PROJECT_ID ?= spry-pipe-425611-c4
REGION ?= us-central1

# Read ENV from .env file (defaults to dev if not found)
ENV := $(shell grep -E '^ENV=' .env 2>/dev/null | cut -d'=' -f2 | tr -d '\n' | tr -d '\r' || echo dev)

# Validate ENV
ifneq ($(ENV),dev)
ifneq ($(ENV),prod)
$(error ENV must be either 'dev' or 'prod', got '$(ENV)')
endif
endif

REGISTRY = $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ENV)-vexa-billing

# Colors
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RED    := $(shell tput -Txterm setaf 1)
RESET  := $(shell tput -Txterm sgr0)

# ============================================================================
# MAIN COMMANDS
# ============================================================================

help: ## Show help
	@echo '$(GREEN)Vexa Billing Deployment$(RESET)'
	@echo ''
	@echo '$(YELLOW)Main Commands:$(RESET)'
	@echo '  make init      One-time setup (GCP APIs, Terraform backend)'
	@echo '  make vars      Update all variables (secrets + terraform.tfvars + import existing)'
	@echo '  make build     Build and push Docker images'
	@echo '  make deploy    Deploy to Cloud Run'
	@echo '  make unlock    Force unlock Terraform state (if you get lock errors)'
	@echo '  make dns       Setup Cloudflare DNS → GCP Cloud Run'
	@echo ''
	@echo '$(YELLOW)Other Commands:$(RESET)'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2}'
	@echo ''
	@echo '$(YELLOW)Current Environment: $(ENV)$(RESET)'
	@echo '  Set ENV=dev or ENV=prod in .env file'

init: ## One-time setup: GCP APIs, Terraform backend, secrets
	@echo "$(GREEN)Initializing infrastructure...$(RESET)"
	@./deployment/scripts/terraform-init.sh
	@echo "$(GREEN)Updating secrets for $(ENV)...$(RESET)"
	@./deployment/scripts/update-secrets.sh
	@echo "$(GREEN)✓ Initialization complete!$(RESET)"

vars: ## Update all variables: secrets from .env + validate terraform.tfvars + import existing resources
	@echo "$(GREEN)Updating variables for $(ENV)...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Error: .env not found$(RESET)"; \
		exit 1; \
	fi
	@./deployment/scripts/update-secrets.sh
	@if [ -f deployment/terraform/environments/$(ENV)/terraform.tfvars ]; then \
		echo "$(YELLOW)Checking for stale locks...$(RESET)"; \
		gsutil rm gs://vexa-billing-terraform-state/terraform/state/$(ENV)/default.tflock 2>/dev/null || true; \
		echo "$(YELLOW)Initializing Terraform...$(RESET)"; \
		cd deployment/terraform && terraform init -reconfigure -backend-config="prefix=terraform/state/$(ENV)" -backend-config="bucket=vexa-billing-terraform-state" >/dev/null 2>&1 && \
		echo "$(YELLOW)Importing existing resources if needed...$(RESET)" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.artifact_registry.google_artifact_registry_repository.docker_repo projects/$(PROJECT_ID)/locations/$(REGION)/repositories/$(ENV)-vexa-billing 2>/dev/null && echo "  ✓ Artifact Registry repository" || echo "  ⚠ Artifact Registry (may not exist or already imported)" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.stripe_secret_key projects/$(PROJECT_ID)/secrets/$(ENV)-stripe-secret-key 2>/dev/null && echo "  ✓ stripe-secret-key" || echo "  ⚠ stripe-secret-key" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.stripe_webhook_secret projects/$(PROJECT_ID)/secrets/$(ENV)-stripe-webhook-secret 2>/dev/null && echo "  ✓ stripe-webhook-secret" || echo "  ⚠ stripe-webhook-secret" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.admin_api_url projects/$(PROJECT_ID)/secrets/$(ENV)-admin-api-url 2>/dev/null && echo "  ✓ admin-api-url" || echo "  ⚠ admin-api-url" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.admin_api_token projects/$(PROJECT_ID)/secrets/$(ENV)-admin-api-token 2>/dev/null && echo "  ✓ admin-api-token" || echo "  ⚠ admin-api-token" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.portal_return_url projects/$(PROJECT_ID)/secrets/$(ENV)-portal-return-url 2>/dev/null && echo "  ✓ portal-return-url" || echo "  ⚠ portal-return-url" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.nextauth_secret projects/$(PROJECT_ID)/secrets/$(ENV)-nextauth-secret 2>/dev/null && echo "  ✓ nextauth-secret" || echo "  ⚠ nextauth-secret" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.nextauth_url projects/$(PROJECT_ID)/secrets/$(ENV)-nextauth-url 2>/dev/null && echo "  ✓ nextauth-url" || echo "  ⚠ nextauth-url" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.google_client_id projects/$(PROJECT_ID)/secrets/$(ENV)-google-client-id 2>/dev/null && echo "  ✓ google-client-id" || echo "  ⚠ google-client-id" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.google_client_secret projects/$(PROJECT_ID)/secrets/$(ENV)-google-client-secret 2>/dev/null && echo "  ✓ google-client-secret" || echo "  ⚠ google-client-secret" && \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.github_token projects/$(PROJECT_ID)/secrets/$(ENV)-github-token 2>/dev/null && echo "  ✓ github-token" || echo "  ⚠ github-token" && \
		echo "$(YELLOW)Validating terraform configuration...$(RESET)" && \
		if terraform validate -var-file="environments/$(ENV)/terraform.tfvars" >/dev/null 2>&1; then \
			echo "$(GREEN)✓ Secrets updated, resources imported, and terraform configuration validated$(RESET)"; \
		else \
			echo "$(GREEN)✓ Secrets updated and resources imported$(RESET)"; \
			echo "$(YELLOW)  Note: Terraform validation had issues (run 'make deploy' to see details)$(RESET)"; \
		fi; \
	else \
		echo "$(GREEN)✓ Secrets updated$(RESET)"; \
		echo "$(YELLOW)  Note: terraform.tfvars not found for $(ENV) environment$(RESET)"; \
	fi

build: ## Build and push Docker images
	@echo "$(GREEN)Building and pushing images for $(ENV)...$(RESET)"
	@echo "$(YELLOW)Registry: $(REGISTRY)$(RESET)"
	@docker build -f apps/billing/Dockerfile -t $(REGISTRY)/billing:latest -t $(REGISTRY)/billing:$(shell git rev-parse --short HEAD) .
	@docker build -f apps/webapp/Dockerfile -t $(REGISTRY)/webapp:latest -t $(REGISTRY)/webapp:$(shell git rev-parse --short HEAD) .
	@gcloud auth configure-docker $(REGION)-docker.pkg.dev --quiet
	@docker push $(REGISTRY)/billing:latest
	@docker push $(REGISTRY)/webapp:latest
	@echo "$(GREEN)✓ Images built and pushed$(RESET)"

deploy: ## Deploy to Cloud Run
	@echo "$(GREEN)Deploying to $(ENV)...$(RESET)"
	@echo "$(YELLOW)State file: terraform/state/$(ENV)/terraform.tfstate$(RESET)"
	@echo "$(YELLOW)Checking for stale locks...$(RESET)"
	@gsutil rm gs://vexa-billing-terraform-state/terraform/state/$(ENV)/default.tflock 2>/dev/null || true
	@cd deployment/terraform && terraform init -reconfigure -backend-config="prefix=terraform/state/$(ENV)" -backend-config="bucket=vexa-billing-terraform-state"
	@cd deployment/terraform && terraform workspace select default 2>/dev/null || true
	@echo "$(YELLOW)Importing existing resources if needed...$(RESET)"
	@cd deployment/terraform && ( \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.artifact_registry.google_artifact_registry_repository.docker_repo projects/$(PROJECT_ID)/locations/$(REGION)/repositories/$(ENV)-vexa-billing >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.stripe_secret_key projects/$(PROJECT_ID)/secrets/$(ENV)-stripe-secret-key >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.stripe_webhook_secret projects/$(PROJECT_ID)/secrets/$(ENV)-stripe-webhook-secret >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.admin_api_url projects/$(PROJECT_ID)/secrets/$(ENV)-admin-api-url >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.admin_api_token projects/$(PROJECT_ID)/secrets/$(ENV)-admin-api-token >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.portal_return_url projects/$(PROJECT_ID)/secrets/$(ENV)-portal-return-url >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.nextauth_secret projects/$(PROJECT_ID)/secrets/$(ENV)-nextauth-secret >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.nextauth_url projects/$(PROJECT_ID)/secrets/$(ENV)-nextauth-url >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.google_client_id projects/$(PROJECT_ID)/secrets/$(ENV)-google-client-id >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.google_client_secret projects/$(PROJECT_ID)/secrets/$(ENV)-google-client-secret >/dev/null 2>&1 || true; \
		terraform import -var-file="environments/$(ENV)/terraform.tfvars" -input=false module.secrets.google_secret_manager_secret.github_token projects/$(PROJECT_ID)/secrets/$(ENV)-github-token >/dev/null 2>&1 || true; \
	)
	@cd deployment/terraform && terraform apply -var-file="environments/$(ENV)/terraform.tfvars" -auto-approve
	@gcloud run services update $(ENV)-webapp --region=$(REGION) --image=$(REGISTRY)/webapp:latest --quiet 2>/dev/null || true
	@gcloud run services update $(ENV)-billing --region=$(REGION) --image=$(REGISTRY)/billing:latest --quiet 2>/dev/null || true
	@echo "$(GREEN)✓ Deployment complete$(RESET)"
	@echo ""
	@echo "$(YELLOW)Service URLs:$(RESET)"
	@cd deployment/terraform && terraform output -json 2>/dev/null | jq -r '.webapp_url.value, .billing_url.value' || echo "  Run 'make status' to see URLs"

unlock: ## Force unlock Terraform state (use if you get state lock errors)
	@echo "$(YELLOW)Force unlocking Terraform state for $(ENV)...$(RESET)"
	@echo "$(YELLOW)Warning: Only use this if you're sure no other Terraform operations are running$(RESET)"
	@echo "$(YELLOW)Removing lock file from GCS...$(RESET)"
	@gsutil rm gs://vexa-billing-terraform-state/terraform/state/$(ENV)/default.tflock 2>/dev/null && echo "$(GREEN)✓ Lock file removed$(RESET)" || echo "$(YELLOW)Lock file not found or already removed$(RESET)"

dns: ## Setup Cloudflare DNS → GCP Cloud Run for custom domain
	@echo "$(GREEN)Setting up DNS for $(ENV) environment...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Error: .env not found$(RESET)"; \
		exit 1; \
	fi
	@NEXTAUTH_URL_RAW=$$(grep -E '^NEXTAUTH_URL=' .env 2>/dev/null | cut -d'=' -f2- | tr -d '\n' | tr -d '\r') && \
	if [ -z "$$NEXTAUTH_URL_RAW" ]; then \
		echo "$(YELLOW)Error: NEXTAUTH_URL not found in .env file$(RESET)"; \
		echo "Please add NEXTAUTH_URL=https://your-domain.com to .env"; \
		exit 1; \
	fi && \
	DOMAIN=$$(echo "$$NEXTAUTH_URL_RAW" | sed -E 's#^https?://##' | sed 's#/$$##') && \
	echo "$(GREEN)Using domain from NEXTAUTH_URL: $$DOMAIN$(RESET)" && \
	echo "" && \
	echo "$(YELLOW)Which service?$(RESET)" && \
	echo "  1) webapp" && \
	echo "  2) billing" && \
	read -p "Enter choice (1 or 2): " CHOICE && \
	if [ "$$CHOICE" = "1" ]; then \
		SERVICE="$(ENV)-webapp"; \
	elif [ "$$CHOICE" = "2" ]; then \
		SERVICE="$(ENV)-billing"; \
	else \
		echo "$(YELLOW)Error: Invalid choice$(RESET)"; \
		exit 1; \
	fi && \
	echo "" && \
	echo "$(GREEN)Setting up DNS: $$DOMAIN → $$SERVICE$(RESET)" && \
	./deployment/scripts/setup-custom-domain.sh $$SERVICE $$DOMAIN $(REGION)

# ============================================================================
# UTILITY COMMANDS
# ============================================================================

dev: ## Run webapp locally
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Error: .env not found$(RESET)"; \
		exit 1; \
	fi
	@cd apps/webapp && export $$(grep -v '^#' ../../.env | xargs) && npm run dev

auth: ## Authenticate with GCloud
	@gcloud auth login
	@gcloud auth application-default login
	@echo "$(GREEN)✓ Authentication complete$(RESET)"

status: ## Show deployment status
	@echo "$(GREEN)Status for $(ENV) environment$(RESET)"
	@gcloud run services list --platform=managed --region=$(REGION) --format="table(metadata.name,status.url,status.conditions[0].status)"

logs-webapp: ## View webapp logs
	@gcloud run services logs read $(ENV)-webapp --region=$(REGION) --limit=50

logs-billing: ## View billing logs
	@gcloud run services logs read $(ENV)-billing --region=$(REGION) --limit=50

clean: ## Clean local Docker images
	@docker images | grep $(REGISTRY) | awk '{print $$3}' | xargs docker rmi -f 2>/dev/null || true
	@echo "$(GREEN)✓ Cleaned$(RESET)"

.DEFAULT_GOAL := help
