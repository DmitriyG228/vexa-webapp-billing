# Outputs for Build Triggers module

output "webapp_trigger_id" {
  description = "ID of the webapp build trigger"
  value       = google_cloudbuild_trigger.webapp.id
}

output "billing_trigger_id" {
  description = "ID of the billing build trigger"
  value       = google_cloudbuild_trigger.billing.id
}

output "webapp_trigger_name" {
  description = "Name of the webapp build trigger"
  value       = google_cloudbuild_trigger.webapp.name
}

output "billing_trigger_name" {
  description = "Name of the billing build trigger"
  value       = google_cloudbuild_trigger.billing.name
}



