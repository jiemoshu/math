# Singapore Math Platform - Development Commands
# Usage: make <target>

.PHONY: help setup dev-service dev-web neo4j-up neo4j-down \
        kg-status kg-process kg-query kg-api kg-lint \
        web-dev web-build web-lint clean

# Default target
help:
	@echo ""
	@echo "Singapore Math Platform - Available Commands"
	@echo "============================================="
	@echo ""
	@echo "Setup:"
	@echo "  make setup        - Setup all services (Neo4j + KG Pipeline + Web)"
	@echo "  make dev-service  - Setup KG Pipeline (Python venv + dependencies)"
	@echo "  make dev-web      - Setup Web (install dependencies + run dev server)"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make neo4j-up     - Start Neo4j container"
	@echo "  make neo4j-down   - Stop Neo4j container"
	@echo ""
	@echo "KG Pipeline:"
	@echo "  make kg-status    - Check pipeline status"
	@echo "  make kg-process   - Process PDFs in inbox"
	@echo "  make kg-query Q=\"your question\"  - Query the knowledge graph"
	@echo "  make kg-api       - Start FastAPI server"
	@echo "  make kg-lint      - Lint Python code"
	@echo ""
	@echo "Web:"
	@echo "  make web-dev      - Run Next.js dev server"
	@echo "  make web-build    - Build for production"
	@echo "  make web-lint     - Lint TypeScript code"
	@echo ""

# =============================================================================
# SETUP
# =============================================================================

setup: neo4j-up dev-service
	@echo ""
	@echo "✅ Setup complete! Next steps:"
	@echo "   1. Edit .env and add your OPENAI_API_KEY"
	@echo "   2. make kg-status"
	@echo ""

dev-service:
	@./scripts/setup-kg-pipeline.sh

dev-web:
	@echo "Setting up Web (Next.js)..."
	@cd web && yarn install
	@echo ""
	@echo "✅ Dependencies installed! Starting dev server..."
	@echo ""
	@cd web && yarn dev

# =============================================================================
# INFRASTRUCTURE
# =============================================================================

neo4j-up:
	@echo "Starting Neo4j..."
	@docker-compose up -d
	@echo "Neo4j Browser: http://localhost:17474"
	@echo "Credentials: neo4j / singapore_math_2024"

neo4j-down:
	@echo "Stopping Neo4j..."
	@docker-compose down

# =============================================================================
# KG PIPELINE (requires: make dev-service first)
# =============================================================================

KG_VENV = services/kg-pipeline/.venv/bin
KG_RUN = cd services/kg-pipeline && $(KG_VENV)/python -m

kg-status:
	@$(KG_RUN) src.cli status

kg-process:
	@$(KG_RUN) src.cli process

kg-query:
ifndef Q
	@echo "Usage: make kg-query Q=\"your question\""
	@echo "Example: make kg-query Q=\"什么是 bar model?\""
else
	@$(KG_RUN) src.cli query "$(Q)"
endif

kg-api:
	@cd services/kg-pipeline && $(KG_VENV)/uvicorn src.api:app --host 0.0.0.0 --port 18000 --reload

kg-lint:
	@cd services/kg-pipeline && $(KG_VENV)/ruff check src/
	@cd services/kg-pipeline && $(KG_VENV)/black --check src/

kg-format:
	@cd services/kg-pipeline && $(KG_VENV)/black src/
	@cd services/kg-pipeline && $(KG_VENV)/ruff check src/ --fix

# =============================================================================
# WEB
# =============================================================================

web-dev:
	@cd web && yarn dev

web-build:
	@cd web && yarn build

web-lint:
	@cd web && yarn lint

# =============================================================================
# UTILITIES
# =============================================================================

clean:
	@echo "Cleaning..."
	@rm -rf services/kg-pipeline/.venv
	@rm -rf web/node_modules
	@rm -rf web/.next
	@docker-compose down -v 2>/dev/null || true
	@echo "✅ Cleaned"
