.PHONY: help build up down k8s-deploy k8s-destroy tf-init tf-apply tf-destroy

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Docker Compose commands
build: ## Build all Docker images
	docker-compose build

up: ## Start all services with Docker Compose
	docker-compose up -d

down: ## Stop all Docker Compose services
	docker-compose down

logs: ## View logs
	docker-compose logs -f

# Kubernetes commands
k8s-deploy: ## Deploy to Kubernetes using raw manifests
	kubectl apply -f k8s/manifests/namespace.yml
	kubectl apply -f k8s/manifests/

k8s-destroy: ## Remove from Kubernetes
	kubectl delete -f k8s/manifests/ --ignore-not-found=true

# Terraform commands
tf-init: ## Initialize Terraform
	cd terraform && terraform init

tf-plan: ## Plan Terraform changes
	cd terraform && terraform plan

tf-apply: ## Apply Terraform changes
	cd terraform && terraform apply

tf-destroy: ## Destroy Terraform infrastructure
	cd terraform && terraform destroy

# Development commands
dev-backend: ## Run backend locally
	cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload

dev-frontend: ## Run frontend locally
	cd frontend && npm install && npm run dev

dev-ollama: ## Start Ollama locally
	ollama serve &
	ollama pull llama3.2

# Utility commands
clean: ## Clean up Docker resources
	docker system prune -f
	kubectl delete namespace study-guide --ignore-not-found=true

test: ## Run tests
	cd backend && pytest tests/ -v

fmt: ## Format Terraform code
	cd terraform && terraform fmt -recursive
