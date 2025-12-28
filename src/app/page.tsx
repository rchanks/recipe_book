import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()

  // Redirect authenticated users to recipes page
  if (session) {
    redirect('/recipes')
  }

  // Landing page for unauthenticated users
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
          Family Recipes
        </h1>

        <div className="mb-12 space-y-6">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your private family recipe collection
          </p>

          {/* Value proposition */}
          <div className="mx-auto max-w-2xl space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              Keep your family's cherished recipes safe and organized in one place.
            </p>
            <p>
              Share recipes with family members, preserve culinary traditions, and
              create your own digital cookbook.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gray-200 px-6 py-3 font-medium transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              🔒 Private & Secure
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your recipes are private to your family group
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              📚 Easy Organization
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Categories, tags, and photos keep everything organized
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              👨‍👩‍👧 Share with Family
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Collaborate and share recipes with family members
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
