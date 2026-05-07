variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "backend_image" {
  description = "Backend Docker image"
  type        = string
}

variable "frontend_image" {
  description = "Frontend Docker image"
  type        = string
}

variable "ollama_image" {
  description = "Ollama Docker image"
  type        = string
}

variable "ollama_model" {
  description = "Ollama model to use"
  type        = string
}
