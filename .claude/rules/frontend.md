---
paths:
  - "frontend/**"
---

# Frontend Rules

## General Principles

- Follow DRY and SOLID principles
- Prioritize early returns over complex conditions
- Minimize side effects and prioritize pure functions
- Prioritize functions and Composition API over classes
- NEVER mutate objects or state — always create new objects
- 200-400 lines per file typical, 800 max
- Organize by feature/domain, not by type

## TypeScript Conventions

- Use explicit type definitions for all functions and variables
- Avoid using `any` type; use `unknown` when necessary
- Prefer type aliases (`type`) over interfaces
- Use runtime type validation with Zod
- Add explanatory comments for complex types
- Avoid using index signatures

```typescript
// GOOD: Explicit types with type alias
type User = {
  id: string
  name: string
  email: string
}

function getUser(id: string): User | null {
  // ...
}

// BAD: any type
function getUser(id: any): any {
  // ...
}
```

## React Component Conventions

- Components should follow Atomic Design principles
- Avoid using `React.FC` (leverage TypeScript's type inference)
- Define Props types immediately before each component
- Use ES6 default parameters for default Props values
- Use PascalCase for component file names
- Separate logic and UI, extract into custom hooks

```typescript
type ButtonProps = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({
  label,
  onClick,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {label}
    </button>
  )
}
```

## State Management

- Use `useState` for local state
- Use `useReducer` for complex state
- Use Context API for global state (auth, chatSession)
- Maintain immutability when updating state
- Use memoization appropriately for optimization

```typescript
// GOOD: Immutable state update
const [user, setUser] = useState<User>(initialUser)

const updateName = (name: string) => {
  setUser({ ...user, name })
}

// BAD: Mutation
const updateName = (name: string) => {
  user.name = name  // MUTATION!
  setUser(user)
}
```

## Custom Hooks Pattern

Extract business logic into custom hooks in `hooks/`:

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

## API Communication

- API clients live in `services/` (auth, session, audio/, websocket/)
- Handle errors with consistent patterns
- Handle access tokens with care
- Make API calls type-safe
- Always validate responses with Zod

```typescript
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
})

export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`)
  }

  const data = await response.json()
  return UserSchema.parse(data)
}
```

## API Response Format

```typescript
type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}
```

## Input Validation

Always validate user input at system boundaries:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Error Handling

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## Testing

### Frameworks

- **Unit**: Jest + Testing Library (`@testing-library/react`)
- **E2E**: Playwright (`frontend/tests/`)

### Unit Test Guidelines

- Test component rendering and user interactions
- Test custom hooks with `renderHook`
- Test API service functions with mocked fetch
- Prefer integration-style tests over isolated unit tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    render(<Button label="Submit" onClick={onClick} />)

    fireEvent.click(screen.getByText('Submit'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Test Guidelines

- Test critical user flows (login, chat, summary)
- Use Page Object Model pattern
- Tests live in `frontend/tests/`
- Keep tests independent and idempotent

```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/')
})
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
- [ ] Proper error handling
- [ ] No console.log statements in production code
- [ ] No hardcoded values
- [ ] No mutation (immutable patterns used)
- [ ] All types explicit (no `any`)
- [ ] Zod validation at system boundaries
