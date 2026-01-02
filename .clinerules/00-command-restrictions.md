# Command Execution Restrictions

## Prohibited Commands

- `git add`
- `git commit`
- `git push --force`
- `git reset --hard`
- `git rebase -i`
- `git branch -D`
- `git tag -d`

## Restriction Reasons

To prevent data loss, security issues, production environment impacts, and collaboration problems.
In emergency situations, users should execute these commands directly.
