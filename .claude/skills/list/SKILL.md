---
name: list
description: Display all available skills as a table with name, description, and group (e.g. security, ui, research, python, infra). Use this skill whenever the user asks to "list skills", "show skills", "what skills are available", "どんなスキルがある", "スキル一覧", or types `/list`. Accepts an optional argument describing what the user wants to do — when provided, filter the table to only skills relevant to that intent instead of showing everything.
---

# list

Scan the filesystem for installed skills and present them as a Markdown table grouped by category. If the user supplied an argument, narrow the table to skills relevant to that intent.

## When to use

- User invokes `/list` (with or without arguments)
- User asks "どんなスキルが使える？" / "スキル一覧を見せて" / "list available skills" / "show me the skills"
- User describes a task and asks which skill fits ("PDF を結合したいんだけど使えるスキルある？" → treat the task description as the filter argument)

Do NOT use this skill for listing files, directories, or anything other than Claude skills.

## How to gather the skill list

Skills live as `SKILL.md` files under a few known roots. Scan all of these — some may be absent, that's fine, just skip missing paths:

1. `<repo>/.claude/skills/*/SKILL.md` — project-local skills (highest priority; these override user-level ones with the same name)
2. `~/.claude/skills/*/SKILL.md` — user-level skills
3. `~/.agents/skills/*/SKILL.md` — shared agent skills (often symlinked from `~/.claude/skills/`)
4. `~/.claude/plugins/marketplaces/*/skills/*/SKILL.md` — plugin marketplace skills (if present)

Use `Glob` with pattern `**/SKILL.md` scoped to each root, or a single `Bash` `find` if faster. Dedupe by skill `name` — if the same name appears in multiple roots, keep the first one found in the priority order above.

For each `SKILL.md`, read only the YAML frontmatter (the block between the first two `---` lines). Extract:
- `name` — the skill identifier
- `description` — the one-line trigger/purpose

You do NOT need to read the body of each skill. Frontmatter is enough, and reading bodies wastes context on large skill sets.

## How to assign groups

Skills don't declare their own group, so infer one from the name and description. Use a small, consistent vocabulary — mixing many ad-hoc labels makes the table harder to scan. Prefer these canonical groups:

| Group       | Typical skills                                                  |
|-------------|-----------------------------------------------------------------|
| `python`    | python-tdd, python-lint, python-review                          |
| `frontend`  | frontend-design, vercel-react-best-practices, typescript-lint   |
| `ui`        | web-design-guidelines, keybindings-help                         |
| `testing`   | playwright, e2e-fix, test-coverage, tdd, eval-driven            |
| `review`    | code-review, simplify, remove-unused                            |
| `security`  | anything mentioning secrets, auth, vulnerabilities              |
| `research`  | research-*, pdf (when used for papers)                          |
| `infra`     | deploy, ci-fix, update-config                                   |
| `git`       | commit, pr, release-tag, checkpoint                             |
| `docs`      | update-docs, update-codemaps                                    |
| `meta`      | skill-creator, find-skills, learn, instinct-*, list, plan, orchestrate, loop, schedule |
| `api`       | claude-api                                                      |
| `browser`   | agent-browser                                                   |
| `other`     | anything that genuinely doesn't fit                             |

If a skill could fit two groups, pick the one that best matches its *primary* purpose from the description. Don't invent new groups unless a cluster of 3+ skills clearly needs one.

## How to handle the argument

The argument (if any) is free-form text describing what the user wants to do — e.g. `PDF を結合したい`, `fix failing tests`, `deploy to prod`.

When an argument is present:
1. Gather all skills as above
2. Score each skill by semantic relevance to the argument, using the name + description as the signal. You're doing this judgment yourself — no embedding model, just read and think.
3. Include a skill if it's plausibly useful for the task. Err slightly on the side of inclusion (2-3 extra candidates is fine; 20 irrelevant ones is not).
4. If nothing matches, say so explicitly and show the full table as a fallback so the user can browse.

When no argument is present, show everything.

## Output format

Don't use a single giant table — at 40+ skills it's hard to scan. Instead, split by group with a summary line at the top, so the reader gets a global overview first and can jump to the section they care about. HTML `<details>` folding is NOT supported in the target renderer (Claude Code terminal), so use plain Markdown sections.

Structure:

1. **Header line** — total count (unfiltered) or filter info (filtered)
2. **Summary line** — one-liner showing all groups with counts, for a quick overview: `python(3) · testing(5) · research(5) · meta(13) · ...`. Sort groups by count descending, then alphabetically.
3. **One section per group** — `### <group> (<count>)` heading followed by a 2-column table (スキル名 / 説明). Sort groups alphabetically for predictability, and sort skills within each group alphabetically.

Rules:
- **説明** column: translate/rewrite the frontmatter `description` into concise Japanese (roughly 40-60 全角文字). Don't paste the full pushy trigger text — extract the core purpose and render it naturally in Japanese. Preserve proper nouns (tool names, file formats, framework names) as-is.
- For filtered output, use the same structure but only include groups that have matching skills.
- Don't add commentary after the output unless the user asked a follow-up question. The tables are the answer.

## Example

**Example 1 — no argument:**

Input: `/list`

Output:
```markdown
**利用可能なスキル**: 全 43 件

**概要**: meta(13) · research(5) · testing(5) · infra(4) · docs(2) · frontend(3) · git(3) · python(3) · review(3) · ui(2) · api(1) · browser(1)

### api (1)
| スキル名 | 説明 |
|---------|------|
| claude-api | Claude API / Anthropic SDK を使ったアプリ開発 |

### browser (1)
| スキル名 | 説明 |
|---------|------|
| agent-browser | AI エージェント向けブラウザ自動化 CLI |

### docs (2)
| スキル名 | 説明 |
|---------|------|
| update-codemaps | コードベース構造を解析しアーキテクチャ文書を更新 |
| update-docs | ソース・オブ・トゥルースからドキュメントを同期 |

... (以降のグループも同様)
```

**Example 2 — with argument:**

Input: `/list PDFを結合したい`

Output:
```markdown
**フィルタ**: PDFを結合したい — 1 件ヒット

### research (1)
| スキル名 | 説明 |
|---------|------|
| pdf | PDF の読込・抽出・結合・分割・作成など全般 |
```

**Example 3 — argument with no matches:**

Input: `/list write a haiku`

Output:
> この内容に直接マッチするスキルは見つかりませんでした。参考までに全スキルを表示します:
>
> (全件を上記フォーマットで表示)
