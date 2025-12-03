# Development environment configuration

environment = "dev"
region      = "us-central1"

# GCP project ID
project_id = "spry-pipe-425611-c4"

# Repository configuration
repository_name = "Vexa-ai/vexa-webapp-billing"

# Cloud Run scaling configuration (dev uses smaller scale)
webapp_min_instances  = 0
webapp_max_instances  = 3
billing_min_instances = 0
billing_max_instances = 2

# Resource allocation (dev uses smaller resources)
webapp_cpu    = "1"
webapp_memory = "512Mi"
billing_cpu   = "1"
billing_memory = "512Mi"

# Blog configuration (staging uses dev/ folder)
github_repo_path = "dev"

# Note: Secret values should be set via environment variables or manually in Secret Manager
# Do not commit actual secret values to git
# 
# To set secrets for dev environment:
# 1. Use the update-secrets.sh script with .env.dev file
# 2. Or manually create secret versions in Google Cloud Console

