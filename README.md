# Study Guide AI 🧠

An AI-powered study guide generator that transforms notes into flashcards and quizzes using local LLMs via Ollama.

## Features

- **File Upload**: Support for TXT, PDF, DOCX, and Markdown files
- **Text Input**: Direct paste for quick generation
- **Flashcards**: Interactive flip cards with categories
- **Quiz Mode**: Multiple choice with explanations and scoring
- Download Files: Download as a .json file to save locally
- Upload Saved Files: Upload saved .json file to continue studying
- **Local AI**: Runs entirely on your machine using Ollama
- **Monitoring**: Prometheus metrics and Grafana dashboards
- **Kubernetes**: Full K8s deployment with Terraform

## Quick Start

### Local Development (Docker Compose)
```bash
docker-compose up --build
```

### Kubernetes Deployment (Terraform)
```bash
cd terraform
terraform init
terraform apply
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│  FastAPI    │────▶│   Ollama    │
│  Frontend   │◄────│   Backend   │◄────│    (AI)     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  Prometheus │
                    │   Grafana   │
                    └─────────────┘
```

## Documentation

- [Complete SRE Setup Guide](SRE_SETUP_GUIDE.md) - Step-by-step infrastructure deployment

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite
- **Backend**: Python, FastAPI, Prometheus Client
- **AI**: Ollama (llama3.2)
- **Infrastructure**: Terraform, Kubernetes, Helm
- **Monitoring**: Prometheus, Grafana
- **CI/CD**: GitHub Actions

## License

MIT
