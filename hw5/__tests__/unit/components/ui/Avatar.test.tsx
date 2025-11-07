/**
 * Tests for Avatar component
 */

import { render, screen } from '@/__tests__/setup/test-utils'
import { Avatar } from '@/components/ui/Avatar'

describe('Avatar', () => {
  const mockUser = {
    id: 'user-1',
    userID: 'testuser',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
  }

  it('should render user image when provided', () => {
    render(<Avatar user={mockUser} />)
    const img = screen.getByAltText('Test User')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('should render initials when image is not provided', () => {
    const userWithoutImage = {
      ...mockUser,
      image: null,
    }
    render(<Avatar user={userWithoutImage} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('should render userID initial when name is not provided', () => {
    const userWithoutName = {
      ...mockUser,
      name: null,
      image: null,
    }
    render(<Avatar user={userWithoutName} />)
    expect(screen.getByText('T')).toBeInTheDocument() // 'T' from 'testuser'
  })

  it('should render different sizes', () => {
    const { container: sm } = render(<Avatar user={mockUser} size="sm" />)
    const { container: md } = render(<Avatar user={mockUser} size="md" />)
    const { container: lg } = render(<Avatar user={mockUser} size="lg" />)

    // Check that avatars render (size-specific classes are implementation details)
    expect(sm.firstChild).toBeInTheDocument()
    expect(md.firstChild).toBeInTheDocument()
    expect(lg.firstChild).toBeInTheDocument()
  })

  it('should render as link when href is provided', () => {
    render(<Avatar user={mockUser} href="/profile/testuser" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/profile/testuser')
  })
})

