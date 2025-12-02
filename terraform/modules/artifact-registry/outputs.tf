# Outputs for Artifact Registry module

output "repository_id" {
  description = "The ID of the artifact registry repository"
  value       = google_artifact_registry_repository.docker_repo.repository_id
}

output "repository_name" {
  description = "The full name of the repository"
  value       = google_artifact_registry_repository.docker_repo.name
}

output "repository_url" {
  description = "The URL to access the repository"
  value       = "${google_artifact_registry_repository.docker_repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

