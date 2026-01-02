# Python Coding Guidelines

## General Principles

- Comply with PEP 8
- Write Pythonic code
- Methods should have referential transparency and idempotency
- Methods should return early and keep nesting shallow
- Methods and classes should follow the Single Responsibility Principle
- Keep third-party libraries to a minimum

## Type Hints & Naming

- Use Python 3.9+ standard types (use `list[str]`, `| None` instead of `List`, `Optional` from typing)
- Avoid using Any type, cast, and type ignore comments
- Type hints for all function arguments and return values
- `snake_case` (functions/variables), `PascalCase` (classes), `UPPER_SNAKE_CASE` (constants)

## FastAPI Conventions

- Utilize dependency injection
- Define requests/responses with Pydantic models
- Implement unified error handling

## Async & Error Handling

- I/O bound: use `async`/`await`
- Parallel processing: use `asyncio.gather`
- Define appropriate exception classes, output logs, use exception chaining

## Testing & Logging

- Use pytest and write in AAA pattern
- Use Fixtures for common setup
- Minimize use of mock and patch, keep close to actual behavior
- Each test should be executable independently
- Use structured logging, exclude sensitive information, JSON format

## Lint/Formatting

execute with the following commands:

```bash
- uv run ruff format .
- uv run ruff check . --fix
- uv run mypy .
```
