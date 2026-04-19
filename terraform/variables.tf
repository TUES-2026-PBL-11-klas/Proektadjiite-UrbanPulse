variable "jwt_secret" {
  type        = string
  sensitive   = true
  description = "JWT signing secret for backend authentication"
}

variable "db_password" {
  type        = string
  sensitive   = true
  default     = ""
  description = "PostgreSQL password for the local postgres pod (unused if database_url is set)"
}

variable "database_url" {
  type        = string
  sensitive   = true
  description = "Full DATABASE_URL (e.g. Supabase connection string). Overrides the local postgres URL."
}

variable "discord_webhook_url" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Discord webhook URL for AlertManager notifications (optional)"
}

variable "smtp_user" {
  type        = string
  default     = ""
  description = "SMTP username for email notifications (optional)"
}

variable "smtp_pass" {
  type        = string
  sensitive   = true
  default     = ""
  description = "SMTP password for email notifications (optional)"
}

variable "image_tag" {
  type        = string
  default     = "local"
  description = "Docker image tag to deploy ('local' for kind dev, git SHA for CI/CD)"
}
