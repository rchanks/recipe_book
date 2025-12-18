import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { signOut } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}))

describe('LogoutButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders logout button', () => {
    render(<LogoutButton />)
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  test('calls signOut with correct callback URL when clicked', async () => {
    ;(signOut as jest.Mock).mockResolvedValue(undefined)

    render(<LogoutButton />)
    const button = screen.getByRole('button', { name: /log out/i })

    fireEvent.click(button)

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' })
    })
  })

})
