# Secret Manager module for storing sensitive configuration

# Create secrets in Secret Manager
resource "google_secret_manager_secret" "stripe_secret_key" {
  secret_id = "${var.environment}-stripe-secret-key"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "stripe_secret_key" {
  count = var.stripe_secret_key != "" ? 1 : 0

  secret      = google_secret_manager_secret.stripe_secret_key.id
  secret_data = var.stripe_secret_key
}

resource "google_secret_manager_secret" "stripe_webhook_secret" {
  secret_id = "${var.environment}-stripe-webhook-secret"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "stripe_webhook_secret" {
  count = var.stripe_webhook_secret != "" ? 1 : 0

  secret      = google_secret_manager_secret.stripe_webhook_secret.id
  secret_data = var.stripe_webhook_secret
}

resource "google_secret_manager_secret" "admin_api_url" {
  secret_id = "${var.environment}-admin-api-url"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "admin_api_url" {
  count = var.admin_api_url != "" ? 1 : 0

  secret      = google_secret_manager_secret.admin_api_url.id
  secret_data = var.admin_api_url
}

resource "google_secret_manager_secret" "admin_api_token" {
  secret_id = "${var.environment}-admin-api-token"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "admin_api_token" {
  count = var.admin_api_token != "" ? 1 : 0

  secret      = google_secret_manager_secret.admin_api_token.id
  secret_data = var.admin_api_token
}

resource "google_secret_manager_secret" "portal_return_url" {
  secret_id = "${var.environment}-portal-return-url"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "portal_return_url" {
  count = var.portal_return_url != "" ? 1 : 0

  secret      = google_secret_manager_secret.portal_return_url.id
  secret_data = var.portal_return_url
}

resource "google_secret_manager_secret" "nextauth_secret" {
  secret_id = "${var.environment}-nextauth-secret"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "nextauth_secret" {
  count = var.nextauth_secret != "" ? 1 : 0

  secret      = google_secret_manager_secret.nextauth_secret.id
  secret_data = var.nextauth_secret
}

resource "google_secret_manager_secret" "nextauth_url" {
  secret_id = "${var.environment}-nextauth-url"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "nextauth_url" {
  count = var.nextauth_url != "" ? 1 : 0

  secret      = google_secret_manager_secret.nextauth_url.id
  secret_data = var.nextauth_url
}

resource "google_secret_manager_secret" "google_client_id" {
  secret_id = "${var.environment}-google-client-id"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "google_client_id" {
  count = var.google_client_id != "" ? 1 : 0

  secret      = google_secret_manager_secret.google_client_id.id
  secret_data = var.google_client_id
}

resource "google_secret_manager_secret" "google_client_secret" {
  secret_id = "${var.environment}-google-client-secret"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "google_client_secret" {
  count = var.google_client_secret != "" ? 1 : 0

  secret      = google_secret_manager_secret.google_client_secret.id
  secret_data = var.google_client_secret
}

resource "google_secret_manager_secret" "github_token" {
  secret_id = "${var.environment}-github-token"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "google_secret_manager_secret_version" "github_token" {
  count = var.github_token != "" ? 1 : 0

  secret      = google_secret_manager_secret.github_token.id
  secret_data = var.github_token
}



