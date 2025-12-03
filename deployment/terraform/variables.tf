# Variables for Terraform configuration

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (dev or prod)"
  type        = string
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be either 'dev' or 'prod'."
  }
}

variable "webapp_image" {
  description = "Docker image for webapp service (will be built by Cloud Build)"
  type        = string
  default     = ""
}

variable "billing_image" {
  description = "Docker image for billing service (will be built by Cloud Build)"
  type        = string
  default     = ""
}

# Secrets - these will be stored in Secret Manager
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

# Cloud Run configuration
variable "webapp_min_instances" {
  description = "Minimum number of webapp instances"
  type        = number
  default     = 0
}

variable "webapp_max_instances" {
  description = "Maximum number of webapp instances"
  type        = number
  default     = 10
}

variable "billing_min_instances" {
  description = "Minimum number of billing instances"
  type        = number
  default     = 0
}

variable "billing_max_instances" {
  description = "Maximum number of billing instances"
  type        = number
  default     = 5
}

variable "webapp_cpu" {
  description = "CPU allocation for webapp"
  type        = string
  default     = "1"
}

variable "webapp_memory" {
  description = "Memory allocation for webapp"
  type        = string
  default     = "512Mi"
}

variable "billing_cpu" {
  description = "CPU allocation for billing"
  type        = string
  default     = "1"
}

variable "billing_memory" {
  description = "Memory allocation for billing"
  type        = string
  default     = "256Mi"
}

# Repository configuration
variable "repository_url" {
  description = "GitHub repository URL"
  type        = string
  default     = "https://github.com/Vexa-ai/vexa-webapp-billing"
}

variable "repository_name" {
  description = "GitHub repository name (owner/repo format)"
  type        = string
  default     = "Vexa-ai/vexa-webapp-billing"
}

# Blog GitHub integration
variable "github_token" {
  description = "GitHub token for fetching blog posts"
  type        = string
  sensitive   = true
  default     = ""
}

variable "github_repo_path" {
  description = "Path within blog_articles repo (empty for root, 'dev' for staging)"
  type        = string
  default     = ""
}



