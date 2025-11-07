/**
 * Test utilities
 * Shared utilities for testing React components
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { SessionProvider } from 'next-auth/react'

/**
 * Custom render function that includes providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    session?: {
      user?: {
        id: string
        userID: string
        name?: string | null
        email?: string | null
        image?: string | null
      }
    }
  }
) {
  const { session, ...renderOptions } = options || {}

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <SessionProvider
        session={session || null}
      >
        {children}
      </SessionProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override render method
export { customRender as render }

/**
 * Mock session for testing
 */
export const mockSession = {
  user: {
    id: 'test-user-id',
    userID: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

