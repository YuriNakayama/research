# Auto Research Pipeline

Automated research pipeline that runs daily via ECS Fargate, executes research prompts using Claude CLI, and delivers results as GitHub Pull Requests with Slack/email notifications.

## Architecture

```
EventBridge Scheduler (cron: JST 09:00)
  ↓ RunTask
ECS Fargate Task (Private Subnet)
  ├── Claude CLI (claude -p) — research execution
  ├── git clone/push — branch & commit
  ├── gh pr create — Pull Request creation
  └── Slack/Email notification
  ↕ mount
EFS (/claude-config) — Claude CLI auth persistence

External:
  Secrets Manager — GitHub App key, Slack Webhook
  ECR — Docker image (auto-research-task)
  CloudWatch Logs — /ecs/auto-research
```

## Technology Stack

- **Backend**: Python 3.12+, PyYAML, PyJWT, Requests, Boto3, fpdf2, Markdown
- **Container**: Docker (node:22-bookworm-slim base), Claude CLI, gh CLI, UV
- **Infrastructure**: AWS (ECS Fargate, EFS, ECR, EventBridge Scheduler, Secrets Manager, CloudWatch), Terraform
- **CI/CD**: GitHub Actions (ci-backend.yml)
- **Auth**: GitHub App (JWT → installation token)
- **Testing**: Pytest + pytest-cov, Ruff, Mypy
- **Package Management**: UV (Python)

## Folder Structure

```
backend/
  Dockerfile               Fargate task Docker image
  pyproject.toml            Python dependencies (UV managed)
  uv.lock                   Lock file
  src/
    main.py                 Entrypoint: orchestrates full pipeline
    config.py               YAML config + env var loading
    research_runner.py       Claude CLI execution logic
    git_manager.py           git clone/branch/commit/push operations
    github_auth.py           GitHub App auth (JWT → token)
    pr_creator.py            gh CLI PR creation
    email_notifier.py        Email notification (SES/SMTP)
  config/
    research-config.yaml     Research settings (prompt path, output dir, branch prefix)
  scripts/
    entrypoint.sh            Container entrypoint (EFS link, GitHub auth, main.py)
  tests/                     Pytest unit tests
infra/
  main.tf                    Root module (provider, backend)
  variables.tf               Input variables
  outputs.tf                 Output values
  terraform.tfvars.example   Sample tfvars
  modules/
    networking/              VPC, subnets, NAT gateway
    efs/                     EFS file system, access point
    ecr/                     ECR repository
    ecs/                     ECS cluster, task definition, IAM roles
    scheduler/               EventBridge Scheduler
    secrets/                 Secrets Manager
    monitoring/              CloudWatch Logs
    cicd/                    CI/CD pipeline resources
  scripts/
    init-efs.sh              EFS initial setup (Claude CLI login)
dev/                         Development scripts
  setup                      Install dependencies (uv sync)
  format                     Code formatting (ruff)
  lint                       Static analysis (ruff + mypy)
  test-backend               Backend CI (format check → lint → type check → pytest)
  create-worktree            Create git worktree with .env copy
docs/
  plans/                     Feature plans
  research/                  Research prompts and outputs
```

## Commands

```bash
dev/setup            # Install dependencies (uv sync in backend/)
dev/format           # Code formatting (backend: ruff)
dev/lint             # Static analysis (backend: ruff + mypy)
dev/test-backend     # Backend CI (format check → lint → type check → pytest)
dev/create-worktree  # Create git worktree with .env copy
```

## Glossary

| Term | Description |
|------|-------------|
| Research Prompt | Markdown file defining research topic, executed by Claude CLI |
| Research Runner | Module that executes `claude -p` with prompt file |
| GitHub App | Authentication mechanism for git push and PR creation |
| EFS | Elastic File System, persists Claude CLI auth across Fargate tasks |
| EventBridge Scheduler | AWS service for cron-based Fargate task scheduling |

## Rules

| Rule file | Auto-loaded for | When to read manually |
|-----------|----------------|----------------------|
| `.claude/rules/backend.md` | `backend/**` | Python code changes, Dockerfile edits, pytest, ruff/mypy configuration |
| `.claude/rules/infra.md` | `infra/**` | Terraform changes, AWS resource design, module structure decisions |
| `.claude/rules/frontend.md` | `frontend/**` | Not applicable to this project (legacy, from previous AI Reception project) |
| `.claude/rules/security.md` | Always loaded | Commits, secret handling, IAM design, network security, CI/CD pipeline changes |

## Response Language

- Internal reasoning should be in English
- All user-facing output must be in Japanese(全てのユーザー向けの出力は日本語で行うこと)
