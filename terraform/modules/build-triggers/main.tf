# Cloud Build triggers module for CI/CD

# Cloud Build trigger for webapp
resource "google_cloudbuild_trigger" "webapp" {
  name        = "${var.environment}-webapp-deploy"
  description = "Deploy webapp to ${var.environment} environment"
  location    = var.region
  project     = var.project_id

  github {
    owner = split("/", var.repository_name)[0]
    name  = split("/", var.repository_name)[1]
    
    push {
      branch = var.environment == "prod" ? "^main$" : "^develop$"
    }
  }

  included_files = [
    "apps/webapp/**",
    "product/**"
  ]

  filename = "apps/webapp/cloudbuild.yaml"

  substitutions = {
    _ENV                       = var.environment
    _SERVICE_NAME              = "webapp"
    _REGION                    = var.region
    _ARTIFACT_REGISTRY_REPO    = var.artifact_registry_repository
  }

  tags = [
    var.environment,
    "webapp",
    "auto-deploy"
  ]
}

# Cloud Build trigger for billing service
resource "google_cloudbuild_trigger" "billing" {
  name        = "${var.environment}-billing-deploy"
  description = "Deploy billing service to ${var.environment} environment"
  location    = var.region
  project     = var.project_id

  github {
    owner = split("/", var.repository_name)[0]
    name  = split("/", var.repository_name)[1]
    
    push {
      branch = var.environment == "prod" ? "^main$" : "^develop$"
    }
  }

  included_files = [
    "apps/billing/**"
  ]

  filename = "apps/billing/cloudbuild.yaml"

  substitutions = {
    _ENV                       = var.environment
    _SERVICE_NAME              = "billing"
    _REGION                    = var.region
    _ARTIFACT_REGISTRY_REPO    = var.artifact_registry_repository
  }

  tags = [
    var.environment,
    "billing",
    "auto-deploy"
  ]
}

