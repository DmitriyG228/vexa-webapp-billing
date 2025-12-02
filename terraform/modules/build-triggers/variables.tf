# Variables for Build Triggers module

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "environment" {
  description = "Environment name (dev or prod)"
  type        = string
}

variable "repository_name" {
  description = "GitHub repository name in format 'owner/repo'"
  type        = string
}

variable "artifact_registry_repository" {
  description = "Name of the Artifact Registry repository"
  type        = string
}

