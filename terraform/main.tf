# Main Terraform configuration for Vexa Billing deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

# Artifact Registry for Docker images
module "artifact_registry" {
  source = "./modules/artifact-registry"

  project_id  = var.project_id
  region      = var.region
  environment = var.environment

  depends_on = [google_project_service.required_apis]
}

# Secret Manager for storing sensitive configuration
module "secrets" {
  source = "./modules/secrets"

  project_id  = var.project_id
  environment = var.environment

  # Secret values
  stripe_secret_key      = var.stripe_secret_key
  stripe_webhook_secret  = var.stripe_webhook_secret
  admin_api_url          = var.admin_api_url
  admin_api_token        = var.admin_api_token
  portal_return_url      = var.portal_return_url
  nextauth_secret        = var.nextauth_secret
  nextauth_url           = var.nextauth_url
  google_client_id       = var.google_client_id
  google_client_secret   = var.google_client_secret

  depends_on = [google_project_service.required_apis]
}

# Cloud Run service for webapp
module "webapp" {
  source = "./modules/cloud-run"

  project_id   = var.project_id
  region       = var.region
  environment  = var.environment
  service_name = "webapp"

  image        = var.webapp_image != "" ? var.webapp_image : "${var.region}-docker.pkg.dev/${var.project_id}/${module.artifact_registry.repository_id}/webapp:latest"
  port         = 3000
  cpu          = var.webapp_cpu
  memory       = var.webapp_memory
  min_instances = var.webapp_min_instances
  max_instances = var.webapp_max_instances

  env_vars = {
    NODE_ENV                = "production"
    NEXT_TELEMETRY_DISABLED = "1"
    BILLING_URL             = module.billing.service_url
  }

  secret_env_vars = {
    NEXTAUTH_SECRET        = module.secrets.nextauth_secret_id
    NEXTAUTH_URL           = module.secrets.nextauth_url_id
    GOOGLE_CLIENT_ID       = module.secrets.google_client_id_id
    GOOGLE_CLIENT_SECRET   = module.secrets.google_client_secret_id
    STRIPE_SECRET_KEY      = module.secrets.stripe_secret_key_id
    STRIPE_WEBHOOK_SECRET  = module.secrets.stripe_webhook_secret_id
    ADMIN_API_URL          = module.secrets.admin_api_url_id
    ADMIN_API_TOKEN        = module.secrets.admin_api_token_id
    PORTAL_RETURN_URL      = module.secrets.portal_return_url_id
  }

  allow_public_access = true

  depends_on = [module.secrets, module.artifact_registry]
}

# Cloud Run service for billing
module "billing" {
  source = "./modules/cloud-run"

  project_id   = var.project_id
  region       = var.region
  environment  = var.environment
  service_name = "billing"

  image        = var.billing_image != "" ? var.billing_image : "${var.region}-docker.pkg.dev/${var.project_id}/${module.artifact_registry.repository_id}/billing:latest"
  port         = 9000
  cpu          = var.billing_cpu
  memory       = var.billing_memory
  min_instances = var.billing_min_instances
  max_instances = var.billing_max_instances

  env_vars = {}

  secret_env_vars = {
    STRIPE_SECRET_KEY     = module.secrets.stripe_secret_key_id
    STRIPE_WEBHOOK_SECRET = module.secrets.stripe_webhook_secret_id
    ADMIN_API_URL         = module.secrets.admin_api_url_id
    ADMIN_API_TOKEN       = module.secrets.admin_api_token_id
    PORTAL_RETURN_URL     = module.secrets.portal_return_url_id
  }

  allow_public_access = true

  depends_on = [module.secrets, module.artifact_registry]
}

# Cloud Build triggers for CI/CD
# Commented out temporarily - GitHub repository needs to be connected first
# Connect at: https://console.cloud.google.com/cloud-build/triggers/connect?project=spry-pipe-425611-c4
# module "build_triggers" {
#   source = "./modules/build-triggers"
#
#   project_id      = var.project_id
#   region          = var.region
#   environment     = var.environment
#   repository_name = var.repository_name
#
#   artifact_registry_repository = module.artifact_registry.repository_id
#
#   depends_on = [google_project_service.required_apis, module.artifact_registry]
# }

