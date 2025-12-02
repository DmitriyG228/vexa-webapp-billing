# Production environment configuration

environment = "prod"
region      = "us-central1"

# GCP project ID
project_id = "spry-pipe-425611-c4"

# Repository configuration
repository_name = "Vexa-ai/vexa-webapp-billing"

# Cloud Run scaling configuration (prod uses larger scale)
webapp_min_instances  = 1
webapp_max_instances  = 10
billing_min_instances = 1
billing_max_instances = 5

# Resource allocation (prod uses more resources)
webapp_cpu    = "2"
webapp_memory = "1Gi"
billing_cpu   = "1"
billing_memory = "512Mi"

# Note: Secret values should be set via environment variables or manually in Secret Manager
# Do not commit actual secret values to git
# 
# To set secrets for prod environment:
# 1. Use the update-secrets.sh script with .env.prod file
# 2. Or manually create secret versions in Google Cloud Console

