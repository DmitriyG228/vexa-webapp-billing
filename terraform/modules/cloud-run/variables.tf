# Variables for Cloud Run module

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for the service"
  type        = string
}

variable "environment" {
  description = "Environment name (dev or prod)"
  type        = string
}

variable "service_name" {
  description = "Name of the service (webapp or billing)"
  type        = string
}

variable "image" {
  description = "Docker image to deploy"
  type        = string
}

variable "port" {
  description = "Port the container listens on"
  type        = number
  default     = 8080
}

variable "cpu" {
  description = "CPU allocation"
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory allocation"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "env_vars" {
  description = "Environment variables as key-value pairs"
  type        = map(string)
  default     = {}
}

variable "secret_env_vars" {
  description = "Secret environment variables (key = env var name, value = secret id)"
  type        = map(string)
  default     = {}
}

variable "allow_public_access" {
  description = "Whether to allow public access to the service"
  type        = bool
  default     = false
}

variable "health_check_path" {
  description = "Path for health checks"
  type        = string
  default     = "/"
}

