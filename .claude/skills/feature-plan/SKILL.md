---
name: feature-plan
description: >
  Planning and requirements definition for large-scale feature additions, generating step-by-step
  structured markdown files. Use for feature development spanning multiple domains (frontend, backend,
  infra) or when planning multiple features simultaneously. Triggered explicitly by the user with
  /feature-plan.
---

# Feature Plan

Planning skill for large-scale feature additions in the AI Reception project.
Outputs structured markdown files covering development plans that span multiple domains and features.

## Process

Follow these 7 steps in order. After completing each step, wait for user confirmation before proceeding to the next.

### Step 1: Hearing

Gather information needed for planning based on the feature overview provided by the user.
Ask questions from the following perspectives (skip any that are already clear):

- **Purpose**: Why is this feature needed? Who will use it?
- **Scope**: What is included in this iteration? Any phasing?
- **Constraints**: Technical constraints, deadlines, external service dependencies
- **Impact on existing code**: Existing features that need changes, breaking changes
- **Non-functional requirements**: Performance, security, availability requirements

Limit questions to 3-5 at a time to reduce user burden. If additional questions are needed based on answers, do one more round.

### Step 2: Requirements Definition

Organize hearing results and output as `docs/plans/<feature-name>/00-requirements.md`.

```markdown
# <Feature Name> — Requirements Definition

## Background and Purpose
(Why are we building this)

## User Stories
- As a [who], I want [what], so that [why]
(List main stories)

## Functional Requirements
1. ...
2. ...

## Non-Functional Requirements
- Performance: ...
- Security: ...
- Availability: ...

## Out of Scope
- Items excluded from this iteration

## Glossary
(Project-specific terms if any)
```

### Step 3: Technical Research

Before architecture design, conduct deep technical research and output as `docs/plans/<feature-name>/01-research.md`.

The goal is to establish a solid basis for design decisions by thoroughly understanding the existing code, external resources, and how similar problems have been solved in the real world. This step is critical because shallow research leads to rework during implementation.

#### 3a. Deep Codebase Analysis

Go beyond surface-level file listing. For each relevant area of the codebase:

- **Read the actual source code** — not just file names, but the implementation details. Trace the data flow from endpoint to database and back.
- **Identify patterns and conventions** — How are similar concerns handled? What base classes, utilities, or abstractions exist that should be reused?
- **Map function signatures and interfaces** — Document the exact method signatures, parameter types, and return types that the new feature will interact with.
- **Note coupling and side effects** — What will break or need adjustment when this code changes? Are there implicit dependencies?
- **Check test coverage** — What tests exist for the affected areas? What test patterns are used?

Example depth: instead of "SummaryManager handles summaries", write "SummaryManager.list_user_summaries() queries DynamoDB via GSI `user_id-created_at-index`, returns list[SummaryItem], paginated with LastEvaluatedKey. Currently no bulk export method exists. DynamoDBClient.query() at line 45 lacks pagination support — this is a gap for large result sets."

#### 3b. Official Documentation & External Research

Use WebSearch and WebFetch to research:

- **Official documentation** of libraries, APIs, and services that the feature will use or integrate with
- **Best practices and recommended patterns** from framework/library maintainers
- **Known limitations, gotchas, and migration guides** that could affect implementation
- **Changelog and version compatibility** — ensure the approach works with the project's dependency versions

#### 3c. Similar OSS Project Analysis

Search GitHub and the web for open-source projects that have implemented similar features. This provides battle-tested patterns and helps avoid known pitfalls.

- **Find 2-3 relevant repositories** — Look for projects with similar tech stack or problem domain
- **Analyze their approach** — How did they structure the feature? What design decisions did they make and why?
- **Extract reusable patterns** — Identify architectural patterns, data models, or UX flows that could be adapted
- **Note their mistakes** — Check their issue trackers for post-launch bugs or regrets related to this feature

#### 3d. Library/Service Selection

When new dependencies are needed:
- Research candidates with pros, cons, and project compatibility
- Check maintenance status, download counts, bundle size, license

#### 3e. API/Protocol Verification

For external integrations:
- Verify API specs, rate limits, authentication requirements
- Check data formats, WebSocket protocols, webhook schemas

#### 3f. Technical Constraint Discovery

- Performance limits, rate limits, compatibility issues
- Infrastructure constraints (memory, storage, network)

```markdown
# <Feature Name> — Technical Research

## Deep Codebase Analysis

### <Area 1>
- **Files analyzed**: (list with line numbers for key sections)
- **Current implementation**: (detailed description of how it works)
- **Key interfaces**: (method signatures, types, data flow)
- **Patterns used**: (design patterns, conventions)
- **Coupling & side effects**: (what depends on this, what breaks if changed)
- **Test coverage**: (existing tests, patterns used)
- **Gaps identified**: (missing functionality, limitations)

### <Area 2>
...

## External Research

### Official Documentation
- (Key findings from official docs with source links)

### Similar OSS Projects
#### <Project 1> — [repository URL]
- **Relevance**: (why this project is comparable)
- **Approach**: (how they implemented the similar feature)
- **Reusable patterns**: (what we can learn/adapt)
- **Pitfalls found**: (issues from their tracker, lessons learned)

#### <Project 2> — [repository URL]
...

### Pattern Comparison
| Aspect | Our Project | OSS Project 1 | OSS Project 2 | Recommendation |
|--------|-------------|----------------|----------------|----------------|
| ...    | ...         | ...            | ...            | ...            |

## Library/Service Selection
### <Selection Target>
| Candidate | Pros | Cons | Maintenance | Recommendation |
|-----------|------|------|-------------|----------------|
| A         | ...  | ...  | ...         | ...            |

## API/Protocol Research
- ...

## Technical Constraints
- ...

## Research Summary
- Key findings that impact design
- Patterns adopted from external research (with rationale)
- Recommended approach and rationale
```

Research quality standards:
- Codebase analysis must be based on actually reading source files. Cite specific files, line numbers, and function names — not speculation.
- External research should include source URLs. Use WebSearch and WebFetch to verify claims.
- OSS project analysis should reference specific repositories and explain why their approach is or isn't suitable for this project.

### Step 4: Architecture Design

Output the technical design as `docs/plans/<feature-name>/02-architecture.md`.

Build on the existing project architecture (see CLAUDE.md) and include:

- **Overall diagram**: Text-based diagram showing component relationships
- **Frontend design**: New pages, components, hooks, state management
- **Backend design**: Endpoints, domain models, use cases
- **Data model**: Table/schema changes, data flow
- **Infrastructure changes**: AWS resources, Terraform changes (if applicable)
- **External integrations**: Newly required APIs or services

Follow the existing folder structure and explicitly state which files go in which directories.

### Step 5: Implementation Step Breakdown

Break work into technical task units and output as `docs/plans/<feature-name>/03-steps.md`.

Each task should include:

```markdown
## Step N: <Task Name>

**Target**: backend / frontend / infra / cross-cutting
**Dependencies**: Step X, Step Y (or "None")

### Overview
(What this task achieves, 1-2 sentences)

### Work Items
- [ ] Specific work item 1
- [ ] Specific work item 2
- ...

### Target Files (Expected)
- `backend/src/domain/...`
- `frontend/src/components/...`

### Acceptance Criteria
- ... (Conditions for this task to be considered "done")
```

Breakdown guidelines:
- 1 task = 1 technical concern (endpoint addition, component creation, DB schema change, etc.)
- Clearly identify dependencies and tasks that can be parallelized
- When spanning multiple domains, split tasks by domain

### Step 6: Risk and Dependency Analysis

Output as `docs/plans/<feature-name>/04-risks.md`.

```markdown
# Risks and Dependencies

## Risk List

| # | Risk | Impact | Probability | Mitigation |
|---|------|--------|-------------|------------|
| 1 | ...  | High/Med/Low | High/Med/Low | ... |

## External Dependencies
- (External services, libraries, other team work, etc.)

## Technical Debt
- (Potential debt introduced by this implementation)

## Open Items
- (Decisions needed but not yet made)
```

### Step 7: Test Strategy

Output as `docs/plans/<feature-name>/05-testing.md`.

```markdown
# Test Strategy

## Testing Approach
(Overall approach)

## Unit Tests
- Backend: pytest (list of target modules)
- Frontend: Jest + Testing Library (list of target components)

## Integration Tests
- API tests (list of target endpoints)

## E2E Tests
- Playwright (list of target scenarios)

## Test Data
- (Required mock data, fixtures)

## Coverage Targets
- Unit: XX%
- E2E: XX main flow scenarios
```

## Output Structure

The following files are generated:

```
docs/plans/<feature-name>/
├── 00-requirements.md    # Requirements definition
├── 01-research.md        # Technical research
├── 02-architecture.md    # Architecture design
├── 03-steps.md           # Implementation steps
├── 04-risks.md           # Risks and dependencies
└── 05-testing.md         # Test strategy
```

`<feature-name>` should be a kebab-case name that concisely represents the feature (e.g., `realtime-notification`, `multi-agent-handoff`).

## Important Notes

- After outputting each step, always wait for user confirmation. Do not proceed to the next step on your own.
- Read the existing codebase and ensure the design is consistent with the current implementation.
- Follow the folder structure, technology stack, and glossary in CLAUDE.md.
- Implementation steps should be granular enough for Claude to execute one at a time later.
- When multiple features are involved, explicitly state cross-feature dependencies in 03-steps.md.

## Output Language

All documents must be written in Japanese.
