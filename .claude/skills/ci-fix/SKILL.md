---
description: Check CI pipeline status and identify/fix failures when detected
---

# CI Fix

Check the status of backend and frontend CI pipelines, identify the root cause of failures, and apply fixes.

## Steps

### 1. Check current branch and PR

```bash
git branch --show-current
gh pr view --json number,title,state,statusCheckRollup
```

### 2. Check CI workflow run status

```bash
# Check latest CI runs
gh run list --workflow=ci-backend.yml --limit=3
gh run list --workflow=ci-frontend.yml --limit=3
```

### 3. If failing, check logs

```bash
# Get detailed logs for the failed run
gh run view <run-id> --log-failed
```

### 4. Analyze and fix failure cause

The commands below are the usual `dev/` scripts. Check `ls dev/` and use what the repo actually has: the test script may be `dev/test`, `dev/test-backend`, `dev/test-bot`, etc. Skip the frontend section in repos without a frontend.

#### Backend CI failure patterns

| Step | Check command | Fix method |
|------|--------------|------------|
| ruff format | backend test script, e.g. `dev/test` / `dev/test-backend` (includes format check) | `dev/format` |
| ruff check | `dev/lint` | `dev/lint` (with --fix) |
| mypy | `dev/lint` (includes mypy) | Fix type errors |
| pytest | backend test script, e.g. `dev/test` / `dev/test-backend` | Fix test failures |

#### Frontend CI failure patterns

| Step | Check command | Fix method |
|------|--------------|------------|
| type-check | `dev/test-frontend` (includes type-check) | Fix type errors |
| format:check | `dev/test-frontend` (includes format:check) | `dev/format` |
| lint | `dev/lint` | Fix lint errors |
| Playwright | `dev/test-frontend` (includes Mockoon + Playwright) | Fix test failures |

### 5. Local verification after fix

```bash
# Backend (format check → lint → type check → pytest): the repo's backend test script
dev/test            # or dev/test-backend, dev/test-bot ...

# Frontend, only if the repo has one (type-check → format:check → lint → Mockoon + Playwright)
dev/test-frontend
```

### 6. Commit and push fix to re-run CI

After user confirmation, commit and push the fix.

## Notes

- Always identify the failure cause from logs before attempting a fix
- Reproduce and verify locally before pushing fixes
- When multiple failures exist, address them in priority order (format → lint → type → test)

## Language

- **All user-facing output, reports, and summaries must be written in Japanese(すべてのユーザーへの出力は日本語にしてください)**
