---
paths:
  - "backend/**"
---

# Backend Rules

## General Principles

- Comply with PEP 8 and write Pythonic code
- Methods should have referential transparency and idempotency
- Return early and keep nesting shallow
- Follow the Single Responsibility Principle
- Keep third-party libraries to a minimum
- Always import at the top of the file
- No backward compatibility concerns — remove unnecessary code
- Minimize lines of code
- Avoid excessive commenting and logging
- Don't implement temporary measures — make fundamental changes
- 200-400 lines per file typical, 800 max
- NEVER mutate objects — always create new instances

## Clean Architecture

This project follows Clean Architecture with clear layer separation:

```
presentation/    → HTTP API layer (FastAPI routers, Pydantic models)
application/     → Business logic and use cases
domain/          → Core domain models and prompt templates
infrastructure/  → External integrations (Cognito, Bedrock, DynamoDB, OpenAI)
core/            → Cross-cutting concerns (logging, security, config)
```

### Layer Rules

- **presentation** depends on **application** only
- **application** depends on **domain** only
- **domain** has no dependencies on other layers
- **infrastructure** implements interfaces defined in **domain** or **application**
- **core** is shared across all layers

### Dependency Injection

Use FastAPI's dependency injection to wire layers together:

```python
from fastapi import Depends

async def get_session_service(
    db: Database = Depends(get_database),
) -> SessionService:
    return SessionService(db)

@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    service: SessionService = Depends(get_session_service),
) -> SessionResponse:
    return await service.get(session_id)
```

## Type Hints & Naming

- Use Python 3.12 standard types (`list[str]`, `str | None` instead of `List`, `Optional`)
- Avoid `Any` type, `cast`, and `type: ignore` comments
- Type hints for all function arguments and return values
- `snake_case` (functions/variables), `PascalCase` (classes), `UPPER_SNAKE_CASE` (constants)

```python
# GOOD
def get_user(user_id: str) -> User | None:
    ...

# BAD
def get_user(user_id) -> Any:
    ...
```

## FastAPI Conventions

- Utilize dependency injection for all services
- Define requests/responses with Pydantic models in `presentation/model/`
- Implement unified error handling
- Route handlers in `presentation/endpoint/`

```python
from pydantic import BaseModel

class CreateSessionRequest(BaseModel):
    agent_id: str
    user_id: str

class SessionResponse(BaseModel):
    id: str
    agent_id: str
    status: str
    created_at: datetime
```

## Async & Error Handling

- I/O bound operations: use `async`/`await`
- Parallel processing: use `asyncio.gather`
- Define appropriate exception classes
- Output structured logs
- Use exception chaining (`raise ... from e`)

```python
class SessionNotFoundError(Exception):
    def __init__(self, session_id: str) -> None:
        super().__init__(f"Session not found: {session_id}")
        self.session_id = session_id

async def get_session(session_id: str) -> Session:
    try:
        return await db.find_session(session_id)
    except DatabaseError as e:
        logger.error("Failed to fetch session", session_id=session_id, error=str(e))
        raise SessionNotFoundError(session_id) from e
```

## Input Validation

Validate at system boundaries using Pydantic:

```python
from pydantic import BaseModel, EmailStr, field_validator

class RegisterRequest(BaseModel):
    email: EmailStr
    name: str

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name must not be empty")
        return v.strip()
```

## Logging

- Use structured logging with JSON format
- Exclude sensitive information (tokens, passwords, PII)
- Use `src.core.log.get_logger()` instead of `print()`

```python
from src.core.log import get_logger

logger = get_logger(__name__)

logger.info("Session created", session_id=session.id, user_id=user.id)
# NEVER: logger.info(f"Token: {token}")
```

## Lint/Formatting

```bash
uv run ruff format .
uv run ruff check . --fix
uv run mypy .
```

## Testing

### Frameworks

- **Unit/Integration**: Pytest + pytest-asyncio
- **AWS Mocking**: moto (for Cognito, DynamoDB, etc.)
- Tests mirror `src/` structure in `backend/tests/`

### Test Guidelines

- Write in AAA pattern (Arrange, Act, Assert)
- Use Fixtures for common setup
- Minimize use of mock and patch — keep close to actual behavior
- Each test should be executable independently
- Use moto for AWS service mocking instead of manual mocks

```python
import pytest
from moto import mock_aws

@pytest.fixture
def dynamodb_table():
    with mock_aws():
        # Arrange: create table
        client = boto3.client("dynamodb", region_name="ap-northeast-1")
        client.create_table(
            TableName="sessions",
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        yield client

async def test_create_session(dynamodb_table):
    # Arrange
    service = SessionService(DynamoDBDatabase(dynamodb_table))
    request = CreateSessionRequest(agent_id="agent-1", user_id="user-1")

    # Act
    session = await service.create(request)

    # Assert
    assert session.agent_id == "agent-1"
    assert session.status == "active"
```

### Async Test Pattern

```python
import pytest

@pytest.mark.asyncio
async def test_realtime_connection():
    # Arrange
    client = RealtimeClient(api_key="test-key")

    # Act
    result = await client.connect()

    # Assert
    assert result.status == "connected"
```

### Test-Driven Development

1. Write test first (RED) — test should FAIL
2. Write minimal implementation (GREEN) — test should PASS
3. Refactor (IMPROVE)
4. Verify coverage (80%+)

## Code Quality Checklist

- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines), files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling with exception chaining
- [ ] No `print()` statements — use structured logging
- [ ] No hardcoded values
- [ ] No mutation (immutable patterns used)
- [ ] Type hints for all functions (no `Any`)
- [ ] Pydantic validation at system boundaries
- [ ] `ruff format`, `ruff check`, `mypy` pass
