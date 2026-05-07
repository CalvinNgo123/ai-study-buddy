# Backend Deployment
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "${var.app_name}-backend"
    namespace = var.namespace
    labels = {
      app = "${var.app_name}-backend"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "${var.app_name}-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "${var.app_name}-backend"
        }
      }

      spec {
        container {
          name  = "backend"
          image = var.backend_image
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 8000
            name           = "http"
          }

          env {
            name  = "OLLAMA_URL"
            value = "http://${var.app_name}-ollama:11434"
          }

          env {
            name  = "OLLAMA_MODEL"
            value = var.ollama_model
          }

          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = "http"
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = "http"
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }
}

# Backend Service
resource "kubernetes_service" "backend" {
  metadata {
    name      = "${var.app_name}-backend"
    namespace = var.namespace
    labels = {
      app = "${var.app_name}-backend"
    }
  }

  spec {
    selector = {
      app = "${var.app_name}-backend"
    }

    port {
      port        = 8000
      target_port = 8000
      name        = "http"
    }

    type = "ClusterIP"
  }
}

# Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "${var.app_name}-frontend"
    namespace = var.namespace
    labels = {
      app = "${var.app_name}-frontend"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "${var.app_name}-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "${var.app_name}-frontend"
        }
      }

      spec {
        container {
          name  = "frontend"
          image = var.frontend_image
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 80
            name           = "http"
          }

          resources {
            requests = {
              memory = "128Mi"
              cpu    = "100m"
            }
            limits = {
              memory = "256Mi"
              cpu    = "250m"
            }
          }
        }
      }
    }
  }
}

# Frontend Service (NodePort for local access)
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "${var.app_name}-frontend"
    namespace = var.namespace
    labels = {
      app = "${var.app_name}-frontend"
    }
  }

  spec {
    selector = {
      app = "${var.app_name}-frontend"
    }

    port {
      port        = 80
      target_port = 80
      node_port   = 30080
      name        = "http"
    }

    type = "NodePort"
  }
}

# Ollama Deployment
resource "kubernetes_deployment" "ollama" {
  metadata {
    name      = "${var.app_name}-ollama"
    namespace = var.namespace
    labels = {
      app = "${var.app_name}-ollama"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "${var.app_name}-ollama"
      }
    }

    template {
      metadata {
        labels = {
          app = "${var.app_name}-ollama"
        }
      }

      spec {
        container {
          name  = "ollama"
          image = var.ollama_image
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 11434
            name           = "http"
          }

          resources {
            requests = {
              memory = "2Gi"
              cpu    = "1000m"
            }
            limits = {
              memory = "4Gi"
              cpu    = "2000m"
            }
          }

          volume_mount {
            name       = "ollama-data"
            mount_path = "/root/.ollama"
          }

          # Pull the model on startup
          lifecycle {
            post_start {
              exec {
                command = ["/bin/sh", "-c", "sleep 10 && ollama pull ${var.ollama_model}"]
              }
            }
          }
        }

        volume {
          name = "ollama-data"
          empty_dir {}
        }
      }
    }
  }
}

# Ollama Service
resource "kubernetes_service" "ollama" {
  metadata {
    name      = "${var.app_name}-ollama"
    namespace = var.namespace
    labels = {
      app = "${var.app_name}-ollama"
    }
  }

  spec {
    selector = {
      app = "${var.app_name}-ollama"
    }

    port {
      port        = 11434
      target_port = 11434
      name        = "http"
    }

    type = "ClusterIP"
  }
}
