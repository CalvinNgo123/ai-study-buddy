# Prometheus Helm Release
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "prometheus"
  namespace  = var.namespace
  version    = "25.8.0"

  set {
    name  = "server.service.type"
    value = "NodePort"
  }

  set {
    name  = "server.service.nodePort"
    value = "30090"
  }

  set {
    name  = "server.persistentVolume.enabled"
    value = "false"
  }

  set {
    name  = "alertmanager.enabled"
    value = "false"
  }

  set {
    name  = "pushgateway.enabled"
    value = "false"
  }
}

# Grafana Helm Release
resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
  namespace  = var.namespace
  version    = "7.2.0"

  set {
    name  = "service.type"
    value = "NodePort"
  }

  set {
    name  = "service.nodePort"
    value = "30300"
  }

  set {
    name  = "persistence.enabled"
    value = "false"
  }

  set {
    name  = "adminPassword"
    value = "admin"
  }

  # Configure Prometheus datasource
  set {
    name  = "datasources.datasources\.yaml.apiVersion"
    value = "1"
  }

  set {
    name  = "datasources.datasources\.yaml.datasources[0].name"
    value = "Prometheus"
  }

  set {
    name  = "datasources.datasources\.yaml.datasources[0].type"
    value = "prometheus"
  }

  set {
    name  = "datasources.datasources\.yaml.datasources[0].url"
    value = "http://prometheus-server:9090"
  }

  set {
    name  = "datasources.datasources\.yaml.datasources[0].access"
    value = "proxy"
  }

  set {
    name  = "datasources.datasources\.yaml.datasources[0].isDefault"
    value = "true"
  }
}

# ServiceMonitor for the backend
resource "kubernetes_manifest" "service_monitor" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "ServiceMonitor"
    metadata = {
      name      = "study-guide-backend"
      namespace = var.namespace
      labels = {
        release = "prometheus"
      }
    }
    spec = {
      selector = {
        matchLabels = {
          app = "study-guide-backend"
        }
      }
      endpoints = [
        {
          port = "http"
          path = "/metrics"
          interval = "15s"
        }
      ]
    }
  }

  depends_on = [helm_release.prometheus]
}
