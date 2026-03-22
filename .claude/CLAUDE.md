# AI Reception

Real-time voice interaction reception system using OpenAI Realtime API.
AI provides general legal information (not legal advice). Refers users to professionals when needed.

## Architecture

```
Browser (User)
  ↕ WebSocket / HTTPS
Frontend (Next.js on AWS Amplify)
  ↕ WebSocket / REST API
Backend (FastAPI on ECS Fargate)
  ↕ WebSocket
OpenAI Realtime API
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 3.4, Zod
- **Backend**: Python 3.13, FastAPI, Uvicorn, OpenAI Agents SDK, SQLAlchemy, Boto3
- **Auth**: AWS Cognito (JWT tokens)
- **Database**: DynamoDB (production), SQLite (local development)
- **Infrastructure**: AWS (ECS Fargate, ALB, ECR, Amplify, Cognito, DynamoDB), Terraform
- **Testing**: Jest + Testing Library (unit), Playwright (E2E), Pytest + moto (backend)
- **Package Management**: UV (Python), pnpm (Node.js)

## Folder Structure

```
dev/                 Development scripts (setup, start, lint, format, test)
frontend/src/
  app/             Pages and layouts (App Router)
  components/      React components (feature-based subdirectories)
  hooks/           Custom hooks (useVoiceChat, useSummaryList, useVoiceTrial)
  contexts/        React Context (auth, chatSession)
  services/        API clients and external integrations (auth, session, audio/, websocket/)
  types/           TypeScript type definitions with Zod schemas
  config/          Environment and agent configuration
backend/src/
  presentation/    FastAPI endpoints and Pydantic request/response models
  application/     Business logic and use cases (realtime, session, summary)
  domain/          Core domain models and prompt templates
  infrastructure/  External integrations (cognito, bedrock, dynamodb, openai, websocket)
  core/            Cross-cutting concerns (logging, security, config)
infra/
  environments/    Environment configs (dev, staging, prod, state)
  modules/         Terraform modules (foundation, platform, applications)
```

## Commands

```bash
dev/setup            # Install dependencies (pnpm install + uv sync)
dev/start-frontend   # Start frontend with Mockoon (port args: [web] [mockoon])
dev/format           # Code formatting (backend: ruff, frontend: prettier)
dev/lint             # Static analysis (backend: ruff + mypy, frontend: eslint)
dev/test-backend     # Backend CI (format check → lint → type check → pytest)
dev/test-frontend    # Frontend CI (type-check → format:check → lint → Mockoon + Playwright)
dev/test-e2e         # E2E tests (Playwright browser install → test execution)
dev/create-worktree  # Create git worktree with .env copy
```

## Glossary

| Term | Description |
|------|-------------|
| Reception | Intake function that receives user consultations |
| Session | Conversation session between user and AI |
| Agent | Backend AI agent that handles consultations by topic |
| Handoff | Transfer between agents based on conversation content |
| Tool | External tool or function call used by agents |

## Response Language

- Internal reasoning should be in English
- All user-facing output must be in Japanese(全てのユーザー向けの出力は日本語で行うこと)
