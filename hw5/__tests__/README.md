# Testing Guide

This directory contains all tests for the application.

## Structure

```
__tests__/
  ├── setup/
  │   ├── test-utils.tsx      # Custom render and utilities
  │   ├── msw-handlers.ts      # API mock handlers
  │   └── msw-server.ts        # MSW server setup
  ├── unit/                    # Unit tests
  │   ├── lib/                 # Utility function tests
  │   └── components/          # Component tests
  └── integration/             # Integration tests (future)
      └── api/                 # API route tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@/__tests__/setup/test-utils'
import { Avatar } from '@/components/ui/Avatar'

test('renders avatar', () => {
  const user = {
    id: '1',
    userID: 'testuser',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  }
  
  render(<Avatar user={user} />)
  expect(screen.getByAltText('Test User')).toBeInTheDocument()
})
```

### Utility Tests

```typescript
import { calculateCharacterCount } from '@/lib/postUtils'

test('counts characters', () => {
  expect(calculateCharacterCount('Hello')).toBe(5)
})
```

### API Mocking with MSW

```typescript
import { server } from '@/__tests__/setup/msw-server'
import { http, HttpResponse } from 'msw'

test('handles API error', async () => {
  server.use(
    http.get('/api/posts/1', () => {
      return HttpResponse.json(
        { error: 'Not found' },
        { status: 404 }
      )
    })
  )
  
  // Test error handling
})
```

## Test Utilities

- `render()` - Custom render with providers
- `mockSession` - Mock session for testing
- `waitForAsync()` - Wait for async operations

## Coverage

Coverage reports are generated in the `coverage/` directory after running `npm run test:coverage`.

