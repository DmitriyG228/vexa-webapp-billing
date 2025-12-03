# Outputs for Secret Manager module

output "stripe_secret_key_id" {
  description = "Secret Manager secret ID for Stripe secret key"
  value       = google_secret_manager_secret.stripe_secret_key.secret_id
}

output "stripe_webhook_secret_id" {
  description = "Secret Manager secret ID for Stripe webhook secret"
  value       = google_secret_manager_secret.stripe_webhook_secret.secret_id
}

output "admin_api_url_id" {
  description = "Secret Manager secret ID for Admin API URL"
  value       = google_secret_manager_secret.admin_api_url.secret_id
}

output "admin_api_token_id" {
  description = "Secret Manager secret ID for Admin API token"
  value       = google_secret_manager_secret.admin_api_token.secret_id
}

output "portal_return_url_id" {
  description = "Secret Manager secret ID for Portal return URL"
  value       = google_secret_manager_secret.portal_return_url.secret_id
}

output "nextauth_secret_id" {
  description = "Secret Manager secret ID for NextAuth secret"
  value       = google_secret_manager_secret.nextauth_secret.secret_id
}

output "nextauth_url_id" {
  description = "Secret Manager secret ID for NextAuth URL"
  value       = google_secret_manager_secret.nextauth_url.secret_id
}

output "google_client_id_id" {
  description = "Secret Manager secret ID for Google client ID"
  value       = google_secret_manager_secret.google_client_id.secret_id
}

output "google_client_secret_id" {
  description = "Secret Manager secret ID for Google client secret"
  value       = google_secret_manager_secret.google_client_secret.secret_id
}

output "github_token_id" {
  description = "Secret Manager secret ID for GitHub token"
  value       = google_secret_manager_secret.github_token.secret_id
}



