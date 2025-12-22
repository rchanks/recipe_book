import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { signOut } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

describe('LogoutButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders logout button', () => {
    render(<LogoutButton />)
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  test('calls signOut without redirect when clicked', async () => {
    ;(signOut as jest.Mock).mockResolvedValue(undefined)

    render(<LogoutButton />)
    const button = screen.getByRole('button', { name: /log out/i })

    fireEvent.click(button)

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ redirect: false })
    })
  })

  test('shows loading state while logging out', async () => {
    ;(signOut as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<LogoutButton />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/logging out/i)).toBeInTheDocument()
    })
  })
})
