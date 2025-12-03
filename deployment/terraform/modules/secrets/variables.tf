# Variables for Secret Manager module

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev or prod)"
  type        = string
}

variable "stripe_secret_key" {
  description = "Stripe secret key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "admin_api_url" {
  description = "Admin API URL"
  type        = string
  default     = ""
}

variable "admin_api_token" {
  description = "Admin API token"
  type        = string
  sensitive   = true
  default     = ""
}

variable "portal_return_url" {
  description = "Portal return URL"
  type        = string
  default     = ""
}

variable "nextauth_secret" {
  description = "NextAuth secret for webapp"
  type        = string
  sensitive   = true
  default     = ""
}

variable "nextauth_url" {
  description = "NextAuth URL for webapp"
  type        = string
  default     = ""
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "github_token" {
  description = "GitHub token for blog integration"
  type        = string
  sensitive   = true
  default     = ""
}



