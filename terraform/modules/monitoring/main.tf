resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
  namespace  = var.namespace
  version    = "7.2.0"

  values = [
    <<-EOF
    service:
      type: NodePort
      nodePort: 30300
    persistence:
      enabled: false
    adminPassword: admin
    datasources:
      datasources.yaml:
        apiVersion: 1
        datasources:
          - name: Prometheus
            type: prometheus
            url: http://prometheus-server:9090
            access: proxy
            isDefault: true
    EOF
  ]
}