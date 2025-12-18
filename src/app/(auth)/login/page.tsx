import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back to Family Recipes
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
