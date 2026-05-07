# Study Guide AI - Complete SRE Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure Overview](#project-structure-overview)
3. [Local Development](#local-development)
4. [Docker Desktop Kubernetes Setup](#docker-desktop-kubernetes-setup)
5. [Terraform Infrastructure Deployment](#terraform-infrastructure-deployment)
6. [Application Deployment](#application-deployment)
7. [Monitoring Setup](#monitoring-setup)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## Prerequisites

### Required Software
Install these tools before starting:

```bash
# 1. Docker Desktop (with Kubernetes enabled)
# Download: https://www.docker.com/products/docker-desktop
# During setup: Enable Kubernetes in Settings > Kubernetes

# 2. Terraform
# Download: https://developer.hashicorp.com/terraform/downloads
# Or use Homebrew: brew install terraform

# 3. kubectl (usually included with Docker Desktop)
# Verify: kubectl version --client

# 4. Helm
# Download: https://helm.sh/docs/intro/install/
# Or: brew install helm

# 5. Ollama (for local AI)
# Download: https://ollama.com/download
# Or: brew install ollama

# 6. Node.js (for frontend development)
# Download: https://nodejs.org/ (LTS version)
# Or: brew install node

# 7. Python 3.11+ (for backend development)
# Download: https://www.python.org/downloads/
# Or: brew install python@3.11
```

### Verify Installations
```bash
docker --version          # Should show Docker version
kubectl version           # Should show client version
terraform --version       # Should show Terraform version
helm version             # Should show Helm version
ollama --version         # Should show Ollama version
node --version           # Should show Node version (v20+)
python3 --version        # Should show Python 3.11+
```

---

## Project Structure Overview

```
study-guide-app/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app with Ollama integration
│   │   ├── parser.py          # File parsing (PDF, DOCX, TXT, MD)
│   │   └── prometheus_metrics.py  # Metrics middleware
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPage.jsx
│   │   │   ├── FlashcardsPage.jsx
│   │   │   └── QuizPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── terraform/                  # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
│       ├── k8s/               # Kubernetes app resources
│       └── monitoring/        # Prometheus + Grafana
├── k8s/manifests/             # Raw K8s manifests (alternative to Terraform)
├── .github/workflows/         # CI/CD pipeline
├── docker-compose.yml         # Local development option
└── README.md
```

---

## Local Development

### Option 1: Docker Compose (Quickest)

```bash
# 1. Navigate to project root
cd study-guide-app

# 2. Start all services
docker-compose up --build

# 3. In another terminal, pull the AI model
docker-compose exec ollama ollama pull llama3.2

# 4. Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Ollama: http://localhost:11434
```

### Option 2: Local Development (Hot Reload)

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start Ollama locally first
ollama serve &
ollama pull llama3.2

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev

# Access at: http://localhost:3000
```

---

## Docker Desktop Kubernetes Setup

### Step 1: Enable Kubernetes in Docker Desktop

1. Open Docker Desktop
2. Go to **Settings** (gear icon)
3. Select **Kubernetes** from the left menu
4. Check **Enable Kubernetes**
5. Check **Deploy Docker Stacks to Kubernetes by default** (optional)
6. Click **Apply & Restart**
7. Wait for Kubernetes to start (green light in bottom-left)

### Step 2: Verify Kubernetes is Running

```bash
# Check cluster info
kubectl cluster-info

# Should output:
# Kubernetes control plane is running at https://kubernetes.docker.internal:6443
# CoreDNS is running at https://kubernetes.docker.internal:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

# Check nodes
kubectl get nodes

# Should show:
# NAME             STATUS   ROLES           AGE   VERSION
# docker-desktop   Ready    control-plane   1m    v1.28.x
```

### Step 3: Configure kubectl Context

```bash
# Ensure you're using Docker Desktop context
kubectl config use-context docker-desktop

# Verify context
kubectl config current-context
# Should output: docker-desktop
```

### Step 4: Increase Docker Desktop Resources (Important!)

Ollama needs significant resources:

1. Open Docker Desktop
2. Go to **Settings** > **Resources**
3. Set minimum:
   - **CPUs:** 4
   - **Memory:** 8 GB
   - **Swap:** 2 GB
4. Click **Apply & Restart**

---

## Terraform Infrastructure Deployment

### Step 1: Initialize Terraform

```bash
cd terraform

# Initialize providers and modules
terraform init

# You should see:
# Initializing modules...
# - k8s_app in modules/k8s
# - monitoring in modules/monitoring
# Initializing provider plugins...
# Terraform has been successfully initialized!
```

### Step 2: Review the Plan

```bash
# See what Terraform will create
terraform plan

# Expected output includes:
# - kubernetes_namespace.study_guide
# - module.k8s_app.kubernetes_deployment.backend
# - module.k8s_app.kubernetes_deployment.frontend
# - module.k8s_app.kubernetes_deployment.ollama
# - module.monitoring.helm_release.prometheus
# - module.monitoring.helm_release.grafana
```

### Step 3: Apply the Infrastructure

```bash
# Deploy everything
terraform apply

# Type 'yes' when prompted

# Expected output:
# Apply complete! Resources: 10 added, 0 changed, 0 destroyed.
# 
# Outputs:
# frontend_url = "http://localhost:30080"
# grafana_url = "http://localhost:30300"
# prometheus_url = "http://localhost:30090"
```

### Step 4: Verify Deployments

```bash
# Check all pods are running
kubectl get pods -n study-guide

# Expected output (wait a few minutes for Ollama to pull model):
# NAME                                    READY   STATUS    RESTARTS   AGE
# study-guide-backend-xxxxxxxxx-xxxxx     1/1     Running   0          2m
# study-guide-frontend-xxxxxxxxx-xxxxx    1/1     Running   0          2m
# study-guide-ollama-xxxxxxxxx-xxxxx      1/1     Running   0          2m
# grafana-xxxxxxxxx-xxxxx                 1/1     Running   0          2m
# prometheus-server-xxxxxxxxx-xxxxx       1/1     Running   0          2m

# Check services
kubectl get svc -n study-guide

# Expected output:
# NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
# study-guide-backend    ClusterIP   10.96.xxx.xxx   <none>        8000/TCP
# study-guide-frontend   NodePort    10.96.xxx.xxx   <none>        80:30080/TCP
# study-guide-ollama     ClusterIP   10.96.xxx.xxx   <none>        11434/TCP
# grafana                NodePort    10.96.xxx.xxx   <none>        80:30300/TCP
# prometheus-server      NodePort    10.96.xxx.xxx   <none>        9090:30090/TCP
```

---

## Application Deployment

### Step 1: Build Docker Images

```bash
# Build backend image
cd backend
docker build -t study-guide-backend:latest .

# Build frontend image
cd ../frontend
docker build -t study-guide-frontend:latest .

# Verify images exist
docker images | grep study-guide
```

### Step 2: Load Images into Kubernetes (Docker Desktop)

```bash
# Docker Desktop with Kubernetes automatically shares images
# No need to push to registry for local development

# Verify images are available to K8s
kubectl get pods -n study-guide -o yaml | grep image
```

### Step 3: Access the Application

```bash
# Get the application URL
kubectl get svc study-guide-frontend -n study-guide

# Access via NodePort
open http://localhost:30080
# Or: curl http://localhost:30080
```

### Step 4: Test the API

```bash
# Health check
curl http://localhost:30080/api/health

# Expected: {"status":"healthy","version":"1.0.0"}

# Test file upload (create a test file first)
echo "The mitochondria is the powerhouse of the cell. Photosynthesis converts light energy into chemical energy." > test_notes.txt

# Upload via API
curl -X POST -F "file=@test_notes.txt" http://localhost:30080/api/upload

# Should return JSON with flashcards and quiz questions
```

---

## Monitoring Setup

### Step 1: Access Prometheus

```bash
# Open Prometheus UI
open http://localhost:30090

# Or use kubectl port-forward
kubectl port-forward -n study-guide svc/prometheus-server 9090:9090
# Then open http://localhost:9090
```

**Key Prometheus Queries to Try:**
```promql
# Total HTTP requests
http_requests_total

# Request duration
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Backend health up
up{job="study-guide-backend"}
```

### Step 2: Access Grafana

```bash
# Open Grafana UI
open http://localhost:30300

# Login credentials:
# Username: admin
# Password: admin
```

### Step 3: Configure Grafana Dashboard

1. **Login** to Grafana (admin/admin)
2. **Add Data Source:**
   - Go to Configuration > Data Sources
   - Click "Add data source"
   - Select "Prometheus"
   - URL: `http://prometheus-server:9090`
   - Click "Save & Test"

3. **Import Dashboard:**
   - Go to Create > Import
   - Use dashboard ID: `1860` (Node Exporter Full)
   - Or create custom dashboard with these panels:

**Custom Dashboard Panels:**
- **HTTP Requests Rate:** `rate(http_requests_total[5m])`
- **Average Response Time:** `avg(http_request_duration_seconds)`
- **Backend Health:** `up{job="study-guide-backend"}`
- **AI Generation Time:** `ai_generation_duration_seconds_bucket`

### Step 4: Set Up Alerts (Optional)

```yaml
# Example alert rule (add to Prometheus config)
groups:
  - name: study-guide-alerts
    rules:
      - alert: BackendDown
        expr: up{job="study-guide-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Study Guide backend is down"

      - alert: HighResponseTime
        expr: http_request_duration_seconds > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
```

---

## CI/CD Pipeline

### Step 1: Set Up GitHub Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Study Guide AI app"

# Create GitHub repository (via web or gh CLI)
gh repo create study-guide-ai --public --source=. --push
```

### Step 2: Configure GitHub Secrets

Go to **Settings** > **Secrets and variables** > **Actions** and add:

| Secret Name | Value |
|-------------|-------|
| `GITHUB_TOKEN` | Auto-generated, no need to add |

### Step 3: Understand the Pipeline

The `.github/workflows/ci-cd.yml` file defines:

1. **Build & Push Job:**
   - Triggers on push to `main` branch
   - Builds Docker images for backend and frontend
   - Pushes to GitHub Container Registry (ghcr.io)
   - Uses layer caching for faster builds

2. **Terraform Validate Job:**
   - Checks Terraform formatting
   - Validates Terraform configuration
   - Ensures infrastructure code is correct

### Step 4: Trigger a Build

```bash
# Make a change
echo "# Study Guide AI" >> README.md

# Commit and push
git add .
git commit -m "Update README"
git push origin main

# Watch the pipeline run
# Go to: https://github.com/YOUR_USERNAME/study-guide-ai/actions
```

### Step 5: Use Published Images

After the pipeline runs, update your Terraform variables:

```hcl
# terraform/terraform.tfvars (create this file)
backend_image  = "ghcr.io/YOUR_USERNAME/study-guide-ai/study-guide-backend:main"
frontend_image = "ghcr.io/YOUR_USERNAME/study-guide-ai/study-guide-frontend:main"
```

---

## Troubleshooting

### Issue 1: Ollama Pod Stuck in "Pending"

**Symptoms:** `kubectl get pods` shows Ollama pod pending

**Solutions:**
```bash
# Check resource constraints
kubectl describe pod -n study-guide -l app=study-guide-ollama

# Likely causes:
# - Not enough memory (needs 4GB+)
# - Not enough CPU (needs 2 cores)

# Fix: Increase Docker Desktop resources
# Settings > Resources > Memory: 8GB+, CPUs: 4+
```

### Issue 2: "ImagePullBackOff" Error

**Symptoms:** Pods show `ImagePullBackOff` status

**Solutions:**
```bash
# For local images, ensure they're built
docker images | grep study-guide

# If using GHCR images, ensure you're authenticated
docker login ghcr.io -u YOUR_USERNAME

# Or use local images by setting imagePullPolicy: IfNotPresent
# (Already configured in our Terraform)
```

### Issue 3: Backend Can't Connect to Ollama

**Symptoms:** Upload fails with "Cannot connect to Ollama"

**Solutions:**
```bash
# Check Ollama service is running
kubectl get svc -n study-guide study-guide-ollama

# Test connectivity from backend pod
kubectl exec -n study-guide deploy/study-guide-backend --   curl -s http://study-guide-ollama:11434/api/tags

# Check Ollama logs
kubectl logs -n study-guide -l app=study-guide-ollama --tail=50

# Ensure model is pulled
kubectl exec -n study-guide deploy/study-guide-ollama -- ollama list
```

### Issue 4: Terraform Apply Fails

**Symptoms:** `terraform apply` shows errors

**Solutions:**
```bash
# Check Kubernetes is accessible
kubectl cluster-info

# Ensure Helm repos are added
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Re-initialize Terraform
terraform init -upgrade

# Check for existing resources
kubectl get all -n study-guide

# If stuck, destroy and recreate
terraform destroy
terraform apply
```

### Issue 5: Frontend Shows "Cannot Connect to Backend"

**Symptoms:** Frontend loads but API calls fail

**Solutions:**
```bash
# Check backend is running
kubectl get pods -n study-guide -l app=study-guide-backend

# Check backend logs
kubectl logs -n study-guide -l app=study-guide-backend --tail=50

# Test backend directly
curl http://localhost:30080/api/health

# Check CORS settings (should allow all in dev)
# Already configured in backend/main.py
```

### Issue 6: Prometheus/Grafana Not Accessible

**Symptoms:** Can't access monitoring URLs

**Solutions:**
```bash
# Check if pods are running
kubectl get pods -n study-guide | grep -E "prometheus|grafana"

# Check services
kubectl get svc -n study-guide | grep -E "prometheus|grafana"

# Use port forwarding as alternative
kubectl port-forward -n study-guide svc/prometheus-server 9090:9090 &
kubectl port-forward -n study-guide svc/grafana 3000:80 &

# Then access:
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000
```

---

## Next Steps

### 1. Expose to the Internet (Optional)

**Option A: Cloudflare Tunnel (Free & Secure)**
```bash
# Install cloudflared
brew install cloudflared

# Create a tunnel
cloudflared tunnel create study-guide

# Route traffic to your local service
cloudflared tunnel route dns study-guide studyguide.yourdomain.com

# Run the tunnel
cloudflared tunnel run study-guide
```

**Option B: ngrok (Quick Testing)**
```bash
# Install ngrok
brew install ngrok

# Expose frontend
ngrok http 30080

# You'll get a public URL like: https://abc123.ngrok.io
```

### 2. Migrate to Cloud Kubernetes

When ready to move to the cloud:

```hcl
# terraform/main.tf - Update provider
provider "kubernetes" {
  # For AWS EKS
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

# Or for GCP GKE
provider "kubernetes" {
  host                   = "https://${google_container_cluster.primary.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
}
```

### 3. Add Persistent Storage

```yaml
# For Ollama models (so they survive pod restarts)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ollama-data
  namespace: study-guide
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### 4. Add SSL/TLS with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
# Add TLS to your ingress (when you add an ingress controller)
```

### 5. Scale the Application

```bash
# Scale backend to 3 replicas
kubectl scale deployment study-guide-backend --replicas=3 -n study-guide

# Add Horizontal Pod Autoscaler
kubectl autoscale deployment study-guide-backend   --cpu-percent=70   --min=2   --max=10   -n study-guide
```

---

## Quick Reference Commands

```bash
# View all resources
kubectl get all -n study-guide

# View logs
kubectl logs -n study-guide -l app=study-guide-backend --tail=100 -f

# Restart deployment
kubectl rollout restart deployment/study-guide-backend -n study-guide

# Shell into pod
kubectl exec -it -n study-guide deploy/study-guide-backend -- /bin/sh

# Port forward for debugging
kubectl port-forward -n study-guide svc/study-guide-backend 8000:8000

# Check resource usage
kubectl top pods -n study-guide

# Terraform shortcuts
terraform plan    # Preview changes
terraform apply   # Apply changes
terraform destroy # Remove everything
terraform output  # Show outputs
terraform state list  # List managed resources

# Docker cleanup
docker system prune -f  # Remove unused images/containers
```

---

## Architecture Decisions Explained

### Why Docker Desktop K8s?
- **Zero cost** for learning
- **Single-node cluster** simplifies networking
- **Built-in ingress** via localhost ports
- **Image sharing** between Docker and K8s

### Why Terraform over raw YAML?
- **State management** tracks what exists
- **Modules** enable reusable components
- **Variables** make configuration flexible
- **Plan/Apply** workflow prevents surprises

### Why NodePort over LoadBalancer?
- **Docker Desktop** doesn't support cloud LoadBalancers
- **NodePort** exposes services on localhost
- **Simplest** networking for local development

### Why Prometheus + Grafana?
- **Industry standard** for K8s monitoring
- **Metrics collection** via /metrics endpoint
- **Visualization** with pre-built dashboards
- **Alerting** capabilities for production

### Why Ollama inside K8s?
- **Self-contained** stack
- **No external dependencies**
- **Easy to scale** or replace
- **Privacy** - data never leaves cluster

---

## Learning Path for SRE Skills

This project covers these key SRE concepts:

1. **Infrastructure as Code (IaC)**
   - Terraform modules and state management
   - GitOps workflow with CI/CD

2. **Container Orchestration**
   - Kubernetes deployments, services, configmaps
   - Health checks and resource limits

3. **Observability**
   - Metrics with Prometheus
   - Dashboards with Grafana
   - Structured logging

4. **CI/CD Pipelines**
   - GitHub Actions for build/test/deploy
   - Container registry management

5. **Networking**
   - Service discovery in K8s
   - Port forwarding and NodePort

6. **Troubleshooting**
   - kubectl debugging commands
   - Log analysis
   - Resource monitoring

---

**Happy Learning! 🚀**

For questions or issues, check the troubleshooting section or examine the pod logs with `kubectl logs`.
