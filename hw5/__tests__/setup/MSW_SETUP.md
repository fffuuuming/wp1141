# MSW Setup Notes

## Current Status

MSW (Mock Service Worker) is configured but requires additional dependencies to work fully.

## Required Dependencies

MSW v2 requires the `@mswjs/interceptors` package. To fully enable MSW:

```bash
npm install --save-dev @mswjs/interceptors
```

## Current Behavior

- Tests can run without MSW (MSW setup is optional)
- Basic tests (like `constants.test.ts`) work without MSW
- MSW-dependent tests will show a warning but continue

## Future Setup

Once `@mswjs/interceptors` is installed, MSW will automatically work for:
- API route mocking in tests
- Integration tests
- Component tests that make API calls

## Alternative: Manual Fetch Mocking

For now, you can manually mock `fetch` in tests:

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
  })
)
```

