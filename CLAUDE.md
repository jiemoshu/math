# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Singapore Math platform with a Knowledge Graph Pipeline. Monorepo structure with:
- **web/**: Next.js 14 frontend with AWS Amplify integration
- **services/kg-pipeline/**: Python service for PDF ingestion and Neo4j knowledge graph (CPA approach)
- **amplify/**: AWS Lambda + API Gateway + DynamoDB backend

## Common Commands

### Root (monorepo)
```bash
docker-compose up -d     # Start Neo4j (port 17687)
npm run dev              # Start web dev server
npm run install:all      # Install all dependencies
```

### Web (Next.js)
```bash
npm run web:dev          # Start dev server (localhost:3000)
npm run web:build        # Production build
npm run web:lint         # Run ESLint
```

### Knowledge Graph Pipeline (Python)
```bash
npm run kg:install       # poetry install
npm run kg:ingest        # Process PDFs in data/inbox/
npm run kg:status        # Check pipeline status
npm run kg:query         # Query the knowledge graph
npm run kg:api           # Start FastAPI server (localhost:18000)
npm run kg:lint          # ruff check src/
npm run kg:format        # black src/
```

### Direct Poetry Commands (in services/kg-pipeline/)
```bash
poetry run process-inbox process          # Process inbox PDFs
poetry run process-inbox process --dry-run # Preview without processing
poetry run process-inbox status           # Show directory and config status
poetry run process-inbox query "question" # Query the graph
poetry run serve-api                      # Start FastAPI
poetry run pytest                         # Run tests
poetry run mypy src/                      # Type check
```

### Amplify (AWS)
```bash
amplify push             # Deploy backend to AWS
amplify status           # Check deployment status
```

## Quick Start

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY
```

### 2. Start Dependencies
```bash
docker-compose up -d          # Start Neo4j
```

### 3. Install & Run KG Pipeline
```bash
cd services/kg-pipeline
poetry install
cp /path/to/math.pdf data/inbox/   # Add PDF files
poetry run process-inbox process    # Process PDFs
poetry run process-inbox query "什么是 bar model?"  # Query
```

### Verify Services
- Neo4j Browser: http://localhost:17474 (neo4j / singapore_math_2024)
- KG API: http://localhost:18000/docs (after `poetry run serve-api`)

## Configuration

Single `.env` file at project root for all services:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | For LLM & embeddings |
| `NEO4J_URI` | No | `bolt://localhost:17687` | Neo4j connection |
| `NEO4J_PASSWORD` | No | `singapore_math_2024` | Neo4j password |
| `API_PORT` | No | `18000` | FastAPI port |
| `MATHPIX_APP_ID/KEY` | No | - | Optional, for better math OCR |

**Ports**: Using non-default ports to avoid conflicts (Neo4j: 17474/17687, API: 18000).

## Architecture

### Knowledge Graph Pipeline (services/kg-pipeline/)

PDF processing pipeline using the Singapore Math CPA (Concrete-Pictorial-Abstract) approach:

1. **Drop & Run workflow**: Place PDFs in `data/inbox/`, run `process-inbox`, files move to `data/archive/` (success) or `data/error/` (failure)

2. **Ontology (src/models.py)**:
   - Entities: `Concept`, `Strategy`, `Problem`, `GradeLevel`
   - CPA stages: concrete, pictorial, abstract
   - Relations: `PREREQUISITE`, `SOLVED_BY`, `APPLIES_TO`, `TAUGHT_AT`

3. **Processing flow**:
   - `parser.py`: Mathpix OCR (with pypdf fallback) for PDF-to-text
   - `graph.py`: LlamaIndex + Neo4j for entity extraction and graph building
   - `cli.py`: Typer CLI orchestration
   - `api.py`: FastAPI endpoints (`/health`, `/status`, `/rag/query`)

4. **Config**: Reads from root `.env` file (pydantic-settings)

### Web Frontend (web/)

Next.js 14 app directory structure with AWS Amplify client for API calls:
- Uses `aws-amplify` v6 for REST API integration
- Connects to Lambda backend via API Gateway

### Lambda Backend (amplify/)

AWS Lambda with DynamoDB for user management:
- REST endpoints: GET/POST `/users`, GET/DELETE `/users/{id}`
- Uses AWS SDK DocumentClient for DynamoDB operations
- Table name from environment variable `STORAGE_USERSTABLE_NAME`
