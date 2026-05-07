variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "study-guide"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "study-guide"
}

variable "backend_image" {
  description = "Backend Docker image"
  type        = string
  default     = "study-guide-backend:latest"
}

variable "frontend_image" {
  description = "Frontend Docker image"
  type        = string
  default     = "study-guide-frontend:latest"
}

variable "ollama_image" {
  description = "Ollama Docker image"
  type        = string
  default     = "ollama/ollama:latest"
}

variable "ollama_model" {
  description = "Ollama model to use"
  type        = string
  default     = "llama3.2"
}
