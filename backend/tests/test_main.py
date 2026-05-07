import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestMain:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"

    def test_upload_no_file(self):
        response = client.post("/upload")
        assert response.status_code == 422  # Validation error

    def test_generate_from_text_short(self):
        response = client.post("/generate-from-text", json={"text": "short"})
        assert response.status_code == 400

    def test_generate_from_text_empty(self):
        response = client.post("/generate-from-text", json={"text": ""})
        assert response.status_code == 400

    def test_metrics_endpoint(self):
        response = client.get("/metrics")
        assert response.status_code == 200
        assert "http_requests_total" in response.text
