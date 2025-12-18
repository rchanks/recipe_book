import { auth } from '@/lib/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LogoutButton } from '@/components/auth/LogoutButton'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center text-center">
        <h1 className="mb-4 text-4xl font-bold">Family Recipes</h1>

        {session ? (
          <div className="mb-8 space-y-4">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Welcome back, {session.user?.email}!
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Go to Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        ) : (
          <div className="mb-8 space-y-4">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your private family recipe collection
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gray-200 px-6 py-2 font-medium transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        <div className="mb-12 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Try toggling between light and dark modes. Your choice will be
            remembered when you refresh the page.
          </p>
          <ThemeToggle />
        </div>

        <div className="space-y-4 text-left">
          <h2 className="text-lg font-semibold">Phase 2 Status:</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>✅ User authentication implemented</li>
            <li>✅ Signup and login working</li>
            <li>✅ Session management active</li>
            <li>✅ Protected routes enforced</li>
            <li>✅ All tests passing</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
