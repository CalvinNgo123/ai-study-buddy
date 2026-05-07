terraform {
  required_version = ">= 1.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}

# Create namespace
resource "kubernetes_namespace" "study_guide" {
  metadata {
    name = var.namespace
  }
}

# Deploy the application stack
module "k8s_app" {
  source = "./modules/k8s"

  namespace     = kubernetes_namespace.study_guide.metadata[0].name
  app_name      = var.app_name
  backend_image = var.backend_image
  frontend_image = var.frontend_image
  ollama_image  = var.ollama_image
  ollama_model  = var.ollama_model
}

# Deploy monitoring stack
module "monitoring" {
  source = "./modules/monitoring"

  namespace = kubernetes_namespace.study_guide.metadata[0].name
}
