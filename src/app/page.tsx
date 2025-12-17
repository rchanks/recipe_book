import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center text-center">
        <h1 className="mb-4 text-4xl font-bold">Family Recipes</h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-400">
          Foundation established - Phase 1 complete ✅
        </p>

        <div className="mb-12 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Try toggling between light and dark modes. Your choice will be
            remembered when you refresh the page.
          </p>
          <ThemeToggle />
        </div>

        <div className="space-y-4 text-left">
          <h2 className="text-lg font-semibold">Phase 1 Status:</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>✅ App runs locally</li>
            <li>✅ Light/dark mode toggle working</li>
            <li>✅ Database connection verified</li>
            <li>✅ Example tests passing</li>
            <li>✅ Development setup complete</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
