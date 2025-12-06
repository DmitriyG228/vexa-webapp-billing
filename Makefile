.PHONY: help init build push deploy deploy-infra destroy clean clear-cache status dev auth setup-domain perf build-dev update-secrets

# Add gcloud to PATH - checks multiple common installation locations
GCLOUD_SDK_PATHS := /usr/local/Caskroom/gcloud-cli/*/google-cloud-sdk/bin /opt/homebrew/Caskroom/google-cloud-sdk/*/google-cloud-sdk/bin $(HOME)/google-cloud-sdk/bin
GCLOUD_PATH := $(shell for path in $(GCLOUD_SDK_PATHS); do [ -f "$$path/gcloud" ] && echo $$path && break; done)
export PATH := $(GCLOUD_PATH):$(PATH)

# Configuration
PROJECT_ID ?= spry-pipe-425611-c4
REGION ?= us-central1

# Read ENV from .env file (defaults to dev if not found)
ENV := $(shell grep -E '^ENV=' .env 2>/dev/null | cut -d'=' -f2 | tr -d '\n' | tr -d '\r' || echo dev)

REGISTRY = $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(ENV)-vexa-billing

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

help: ## Show this help message
	@echo '$(GREEN)Vexa Billing Deployment$(RESET)'
	@echo ''
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo '$(YELLOW)Configuration:$(RESET)'
	@echo '  Set ENV=dev or ENV=prod in .env file to determine environment'
	@echo '  Current environment: $(YELLOW)$(ENV)$(RESET)'
	@echo ''
	@echo '$(YELLOW)Quick Start:$(RESET)'
	@echo '  1. Run "make auth" once to authenticate with GCloud (browser-based)'
	@echo '  2. Set ENV=dev or ENV=prod in .env file'
	@echo '  3. Run "make dev" for local development'
	@echo '  4. Run "make deploy" to deploy to the environment specified in .env'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(RESET) %s\n", $$1, $$2}'

init: ## Initialize: setup GCP APIs, Terraform backend, and secrets
	@echo "$(GREEN)Initializing infrastructure...$(RESET)"
	@./deployment/scripts/terraform-init.sh
	@echo "$(GREEN)Updating secrets for $(ENV)...$(RESET)"
	@./deployment/scripts/update-secrets.sh
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
	@cd deployment/terraform && terraform apply -var-file="environments/$(ENV)/terraform.tfvars" -auto-approve
	@echo "$(GREEN)Forcing Cloud Run to use latest images...$(RESET)"
	@gcloud run services update $(ENV)-webapp --region=$(REGION) --image=$(REGISTRY)/webapp:latest --quiet 2>/dev/null || echo "  Note: Service already using latest image"
	@gcloud run services update $(ENV)-billing --region=$(REGION) --image=$(REGISTRY)/billing:latest --quiet 2>/dev/null || echo "  Note: Service already using latest image"
	@echo "$(GREEN)✓ Infrastructure deployed$(RESET)"
	@echo ""
	@echo "$(YELLOW)Service URLs:$(RESET)"
	@cd deployment/terraform && terraform output -json | jq -r '.webapp_url.value, .billing_url.value'

deploy: ## Full deployment: update secrets, build images, push, deploy infrastructure
	@echo "$(GREEN)Deploying to $(ENV) environment...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Error: .env not found$(RESET)"; \
		echo "$(YELLOW)Please create .env from .env.example and set ENV=dev or ENV=prod$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Updating secrets from .env...$(RESET)"
	@./deployment/scripts/update-secrets.sh
	@echo "$(GREEN)Building and deploying...$(RESET)"
	@$(MAKE) build push deploy-infra

plan: ## Show Terraform plan (what will be deployed)
	@echo "$(GREEN)Running Terraform plan...$(RESET)"
	@cd deployment/terraform && terraform plan -var-file="environments/$(ENV)/terraform.tfvars"

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
	@cd deployment/terraform && terraform destroy -var-file="environments/$(ENV)/terraform.tfvars"

clean: ## Clean local Docker images
	@echo "$(GREEN)Cleaning local Docker images...$(RESET)"
	@docker images | grep $(REGISTRY) | awk '{print $$3}' | xargs docker rmi -f || true
	@echo "$(GREEN)✓ Cleaned$(RESET)"

clear-cache: ## Clear Next.js cache and restart dev server
	@echo "$(GREEN)Clearing Next.js cache...$(RESET)"
	@rm -rf apps/webapp/.next
	@rm -rf apps/webapp/node_modules/.cache
	@rm -f apps/webapp/tsconfig.tsbuildinfo
	@echo "$(GREEN)✓ Cache cleared$(RESET)"
	@echo "$(YELLOW)Run 'make dev' to start fresh$(RESET)"

logs-webapp: ## Tail webapp logs
	@gcloud run services logs read $(ENV)-webapp --region=$(REGION) --limit=100

logs-billing: ## Tail billing logs
	@gcloud run services logs read $(ENV)-billing --region=$(REGION) --limit=100

setup-oauth: ## Show OAuth configuration instructions
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Error: .env not found$(RESET)"; \
		echo "$(YELLOW)Please create .env from .env.example and set ENV=dev or ENV=prod$(RESET)"; \
		exit 1; \
	fi
	@./deployment/scripts/setup-oauth.sh $(ENV)

update-secrets: ## Update secrets from .env file
	@echo "$(GREEN)Updating secrets for $(ENV)...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Error: .env not found$(RESET)"; \
		echo "$(YELLOW)Please create .env from .env.example and set ENV=dev or ENV=prod$(RESET)"; \
		exit 1; \
	fi
	@./deployment/scripts/update-secrets.sh
	@echo "$(GREEN)Redeploying services to pick up new secrets...$(RESET)"
	@cd deployment/terraform && terraform apply -var-file="environments/$(ENV)/terraform.tfvars" -auto-approve -refresh-only
	@echo "$(GREEN)✓ Secrets updated and services refreshed$(RESET)"

setup-domain: ## Setup custom domain for Cloud Run services (requires CLOUDFLARE_TOKEN)
	@echo "$(GREEN)Setting up custom domains for $(ENV) environment...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Error: .env not found$(RESET)"; \
		echo "$(YELLOW)Please create .env from .env.example and set ENV=dev or ENV=prod$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)This will:$(RESET)"
	@echo "  1. Create Cloud Run domain mappings"
	@echo "  2. Update Cloudflare DNS with CNAME records"
	@echo "  3. Wait for Google to provision SSL certificates"
	@echo ""
	@read -p "Domain for webapp (e.g., webapp-$(ENV).vexa.ai): " WEBAPP_DOMAIN && \
	read -p "Domain for billing (e.g., billing-$(ENV).vexa.ai): " BILLING_DOMAIN && \
	./deployment/scripts/setup-custom-domain.sh $(ENV)-webapp $$WEBAPP_DOMAIN $(REGION) && \
	./deployment/scripts/setup-custom-domain.sh $(ENV)-billing $$BILLING_DOMAIN $(REGION)

# Development and Authentication
dev: ## Run webapp locally with environment variables from .env
	@echo "$(GREEN)Starting webapp in development mode...$(RESET)"
	@echo "$(YELLOW)Loading environment from .env$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Warning: .env not found$(RESET)"; \
		echo "$(YELLOW)Please create .env from .env.example$(RESET)"; \
		exit 1; \
	fi
	@cd apps/webapp && export $$(grep -v '^#' ../../.env | xargs) && npm run dev

build-dev: ## Build and start production version locally for testing
	@echo "$(GREEN)Building production version locally...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Warning: .env not found$(RESET)"; \
		echo "$(YELLOW)Please create .env from .env.example$(RESET)"; \
		exit 1; \
	fi
	@cd apps/webapp && export $$(grep -v '^#' ../../.env | xargs) && npm run build
	@echo "$(GREEN)✓ Production build complete$(RESET)"
	@echo "$(GREEN)Starting production server on http://localhost:3000$(RESET)"
	@echo "$(YELLOW)Run 'make perf' in another terminal to test performance$(RESET)"
	@echo "$(YELLOW)Press Ctrl+C to stop the server$(RESET)"
	@echo ""
	@cd apps/webapp && export $$(grep -v '^#' ../../.env | xargs) && npm run start

perf: ## Run performance test on local production build (requires start-local running)
	@echo "$(GREEN)Running Lighthouse performance check...$(RESET)"
	@echo "$(YELLOW)Testing http://localhost:3000 - make sure production build is running (make start-local)$(RESET)"
	@if ! command -v lighthouse >/dev/null 2>&1; then \
		echo "$(YELLOW)Installing Lighthouse CLI...$(RESET)"; \
		npm install -g lighthouse; \
	fi
	@lighthouse http://localhost:3000 \
		--only-categories=performance \
		--form-factor=mobile \
		--screenEmulation.mobile=true \
		--throttling.cpuSlowdownMultiplier=4 \
		--quiet \
		--output=json \
		--output-path=/tmp/lighthouse-perf.json
	@echo ""
	@echo "$(GREEN)Performance Results (Mobile):$(RESET)"
	@node -e "const fs=require('fs'); const report=JSON.parse(fs.readFileSync('/tmp/lighthouse-perf.json')); const score=Math.round(report.categories.performance.score*100); const audits=report.audits; console.log('  Score: ' + score + '/100'); console.log('  FCP: ' + audits['first-contentful-paint'].displayValue); console.log('  LCP: ' + audits['largest-contentful-paint'].displayValue); console.log('  TBT: ' + audits['total-blocking-time'].displayValue); console.log('  CLS: ' + audits['cumulative-layout-shift'].displayValue);"
	@echo ""
	@echo "$(YELLOW)Tip: Use Chrome DevTools (F12 → Lighthouse tab) for detailed report$(RESET)"

auth: ## Authenticate with GCloud (one-time setup, browser-based)
	@echo "$(GREEN)Authenticating with GCloud...$(RESET)"
	@echo "$(YELLOW)This will open your browser for authentication$(RESET)"
	@if ! command -v gcloud >/dev/null 2>&1; then \
		echo "$(YELLOW)Error: gcloud CLI not found!$(RESET)"; \
		echo "$(YELLOW)Install with: brew install --cask google-cloud-sdk$(RESET)"; \
		echo "$(YELLOW)Then restart your terminal and run: gcloud init$(RESET)"; \
		exit 1; \
	fi
	@gcloud auth login
	@echo "$(GREEN)Setting up application default credentials...$(RESET)"
	@gcloud auth application-default login
	@echo "$(GREEN)✓ Authentication complete!$(RESET)"
	@echo "$(YELLOW)You're now authenticated across all shells$(RESET)"


.DEFAULT_GOAL := help

