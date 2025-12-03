# Backend configuration for Terraform state
# This stores the state in Google Cloud Storage for team collaboration and state locking

terraform {
  backend "gcs" {
    bucket = "vexa-billing-terraform-state"
    prefix = "terraform/state"
  }
}



