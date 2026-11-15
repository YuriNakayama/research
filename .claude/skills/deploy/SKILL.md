---
description: Execute the repo's CD workflows on GitHub Actions through its dev/deploy script. Use when the user asks to deploy, "デプロイして", release to dev/stg/prod, or check a deployment. Reads the targets, environments and health checks from the repo itself; stops if the repo has no dev/deploy.
---

# Deploy (Continuous Deployment)

Run the repo's continuous-deployment workflows on GitHub Actions via its own `dev/deploy` script. What can be deployed (backend / frontend), to which environments, and how it is checked afterwards all differ per repo — read them from the repo, never assume.

## Steps

### 1. Check the repo's deploy setup and current state

```bash
ls dev/deploy                 # no dev/deploy → stop: tell the user this repo has no deploy script, and don't improvise one
dev/deploy                    # running it without arguments prints its usage: targets and environments
ls .github/workflows/         # the CD workflows the script triggers
git branch --show-current
git log --oneline -5
```

Also read the deploy notes in `CLAUDE.md` / `README.md` / `docs/` if the repo has them (environments, URLs, health checks, approval rules).

### 2. Determine target and environment

Take the targets (e.g. `backend`, `frontend`, `both`) and environments (e.g. `dev`, `stg`, `prod`) from the script's usage — offer only what it supports. If the repo maps branches to environments (e.g. `develop` → dev, `release/*` → stg, `main` → prod, or GitHub flow where `main` deploys), follow the repo's workflows and docs.

Confirm with the user:
- **Target**: one of the targets the script accepts
- **Environment**: one of the environments the script accepts

### 3. Execute deployment

```bash
dev/deploy <target> <environment>
```

Use Bash with `run_in_background: true` for deployments that take long; the user gets a notification on completion. Don't poll in a loop.

### 4. Monitor deployment status

```bash
gh run list --limit 5            # find the CD run the script started
gh run view <run-id> --log
```

### 5. Post-deployment verification

```bash
gh run view <run-id> --json jobs --jq '.jobs[] | {name, conclusion}'
```

If the repo documents a health check (an endpoint URL in `CLAUDE.md` / `README.md` / `docs/`, or a `dev/` script), run it for the deployed environment. Don't guess URLs.

### 6. Handle deployment failure

```bash
gh run view <run-id> --log-failed
```

Paste the last lines of the failure verbatim. Rollback depends on the platform the repo deploys to (some roll back automatically, some need a re-deploy of the previous version) — check the workflow and the repo's docs before suggesting one.

## Notes

- **Always obtain explicit user approval before a prod deployment**
- Manual `workflow_dispatch` runs need `--ref` to specify the target branch
- Verify that all corresponding CI checks have passed before deploying

## Language

- **All user-facing output, reports, and summaries must be written in Japanese(すべてのユーザーへの出力は日本語にしてください)**
