# Cloud Run service module

# Create service account for the Cloud Run service
resource "google_service_account" "service_account" {
  account_id   = "${var.environment}-${var.service_name}"
  display_name = "Service account for ${var.service_name} (${var.environment})"
  project      = var.project_id
}

# Grant service account access to secrets
resource "google_secret_manager_secret_iam_member" "secret_access" {
  for_each = var.secret_env_vars

  project   = var.project_id
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.service_account.email}"
}

# Cloud Run service
resource "google_cloud_run_v2_service" "service" {
  name     = "${var.environment}-${var.service_name}"
  location = var.region
  project  = var.project_id

  template {
    service_account = google_service_account.service_account.email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = var.image

      ports {
        container_port = var.port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      # Regular environment variables
      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      # Secret environment variables from Secret Manager
      dynamic "env" {
        for_each = var.secret_env_vars
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value
              version = "latest"
            }
          }
        }
      }

      startup_probe {
        http_get {
          path = var.health_check_path
        }
        initial_delay_seconds = 10
        period_seconds        = 10
        timeout_seconds       = 5
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = var.health_check_path
        }
        initial_delay_seconds = 30
        period_seconds        = 30
        timeout_seconds       = 10
        failure_threshold     = 3
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  labels = {
    environment = var.environment
    service     = var.service_name
    managed_by  = "terraform"
  }

  depends_on = [google_secret_manager_secret_iam_member.secret_access]
}

# Make service publicly accessible if requested
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  count = var.allow_public_access ? 1 : 0

  project  = google_cloud_run_v2_service.service.project
  location = google_cloud_run_v2_service.service.location
  name     = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  member   = "allAuthenticatedUsers"
}



