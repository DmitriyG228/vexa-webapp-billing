# Backend configuration for Terraform state
# This stores the state in Google Cloud Storage for team collaboration and state locking
# Note: The prefix is set per-environment via backend-config during terraform init
# This ensures dev and prod have separate state files

terraform {
  backend "gcs" {
    bucket = "vexa-prod-billing-terraform-state"
    # prefix is set via -backend-config="prefix=terraform/state/{environment}" during init
  }
}



