.PHONY: dev prod stop clean test logs

# ── Development ────────────────────────────────────────────────────────────────
dev-services:
	docker-compose up -d postgres qdrant ollama
	@echo "✅ Postgres + Qdrant + Ollama running"

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm start

pull-models:
	docker exec documind_ollama ollama pull llama3.2
	docker exec documind_ollama ollama pull nomic-embed-text
	@echo "✅ Models ready"

migrate:
	cd backend && alembic upgrade head

# ── Production ──────────────────────────────────────────────────────────────────
prod:
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "✅ DocuMind AI running at http://localhost"

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

stop:
	docker-compose -f docker-compose.prod.yml down

clean:
	docker-compose -f docker-compose.prod.yml down -v
	@echo "⚠️  All data volumes deleted"

# ── Testing ─────────────────────────────────────────────────────────────────────
test:
	cd backend && pytest tests/ -v --tb=short

test-coverage:
	cd backend && pytest tests/ --cov=app --cov-report=html
	@echo "✅ Coverage report in backend/htmlcov/index.html"

# ── Utilities ───────────────────────────────────────────────────────────────────
shell-backend:
	docker exec -it documind_backend bash

shell-db:
	docker exec -it documind_postgres psql -U admin -d documind

health:
	@curl -s http://localhost:8000/health | python -m json.tool
	@curl -s http://localhost:6333/health
	@curl -s http://localhost:11434/api/tags | python -m json.tool