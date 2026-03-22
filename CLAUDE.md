# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Outbounding Automation — a monorepo with a Next.js frontend and an Express + BullMQ backend for automated outbounding workflows. The project uses Docker Compose to orchestrate frontend, backend, and Redis services.

## Repository Structure

- `apps/frontend/` — Next.js 16 (React 19) with Tailwind CSS v4, App Router
- `apps/backend/` — Express 5 server with BullMQ job queue and LangChain AI integration
- `apps/backend/src/` — organized into `ai/`, `routes/`, `services/`, `tools/`, `workers/`
- `apps/backend/index.js` — main entry point: sets up Express, Redis connection, BullMQ queue ("outbounding"), and worker

## Commands

### Run everything via Docker (preferred)
```bash
docker compose up --build          # all services (frontend :3000, backend :4000, redis :6379)
docker compose up frontend --build # frontend + its deps (backend, redis)
docker compose up backend --build  # backend + redis only
```

### Frontend (local dev)
```bash
cd apps/frontend
npm install
npm run dev      # Next.js dev server on :3000
npm run build    # production build
npm run lint     # ESLint
```

### Backend (local dev)
```bash
cd apps/backend
npm install
npm start        # node index.js on :4000 (needs Redis running)
```

### CI
The GitHub Actions workflow (`docker compose build`) runs on pushes/PRs to `main`. Both Dockerfiles run `npm run lint` during the build stage — lint must pass for the image to build.

## Environment

Copy `.env.example` to `.env` at the repo root. Required vars: `OPENAI_API_KEY`, `REDIS_URL` (defaults to `redis://redis:6379`), `PORT` (defaults to 4000).

## Git Workflow

- **Branches:** `main` (production, protected) → `staging` (pre-prod) → `development` (daily integration)
- **Never commit directly** to main, staging, or development
- Feature branches from `development`: `feat/front-*` or `feat/back-*`; fixes: `fix/front-*` or `fix/back-*`
- PRs target `development`; merges to `main` require PR approval + green CI
- Commit message convention: `feat(front): ...`, `fix(back): ...`, `chore: ...`
- Project language is Spanish in docs; code and commit prefixes are in English
