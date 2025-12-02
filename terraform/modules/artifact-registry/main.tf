# Artifact Registry module for Docker images

resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "${var.environment}-vexa-billing"
  description   = "Docker repository for Vexa billing services (${var.environment})"
  format        = "DOCKER"

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

# IAM binding to allow Cloud Build to push images
resource "google_artifact_registry_repository_iam_member" "cloudbuild_writer" {
  project    = var.project_id
  location   = google_artifact_registry_repository.docker_repo.location
  repository = google_artifact_registry_repository.docker_repo.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

# IAM binding to allow Cloud Run to pull images
resource "google_artifact_registry_repository_iam_member" "cloudrun_reader" {
  project    = var.project_id
  location   = google_artifact_registry_repository.docker_repo.location
  repository = google_artifact_registry_repository.docker_repo.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

data "google_project" "project" {
  project_id = var.project_id
}

