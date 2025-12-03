# Terraform outputs

output "webapp_url" {
  description = "URL of the webapp Cloud Run service"
  value       = module.webapp.service_url
}

output "billing_url" {
  description = "URL of the billing Cloud Run service"
  value       = module.billing.service_url
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository for Docker images"
  value       = module.artifact_registry.repository_id
}

output "webapp_service_account" {
  description = "Service account email for webapp"
  value       = module.webapp.service_account_email
}

output "billing_service_account" {
  description = "Service account email for billing"
  value       = module.billing.service_account_email
}

output "secret_ids" {
  description = "Map of secret names to their Secret Manager IDs"
  value = {
    stripe_secret_key     = module.secrets.stripe_secret_key_id
    stripe_webhook_secret = module.secrets.stripe_webhook_secret_id
    admin_api_url         = module.secrets.admin_api_url_id
    admin_api_token       = module.secrets.admin_api_token_id
    portal_return_url     = module.secrets.portal_return_url_id
    nextauth_secret       = module.secrets.nextauth_secret_id
    nextauth_url          = module.secrets.nextauth_url_id
    google_client_id      = module.secrets.google_client_id_id
    google_client_secret  = module.secrets.google_client_secret_id
  }
  sensitive = true
}

output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "project_id" {
  description = "GCP Project ID"
  value       = var.project_id
}

output "region" {
  description = "GCP Region"
  value       = var.region
}



