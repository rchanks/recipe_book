# Family Recipes App

A private, group-based recipe repository for families to store, organize, and share recipes together.

## Current Status: Phase 1 Complete ✅

Foundation established with working development environment, database connection, light/dark mode support, and automated testing.

---

## Prerequisites

Before you begin, ensure you have the following installed on your Windows machine:

### Required

- **Node.js 18+** ([Download](https://nodejs.org/))
  - Check version: `node --version`
  - Should show v18.0.0 or higher

- **npm** (comes with Node.js)
  - Check version: `npm --version`

- **PostgreSQL 16 or 18** ([Download for Windows](https://www.postgresql.org/download/windows/))
  - Check if running: Open Windows Services and search for "postgresql"
  - Should show status as "Running"
  - pgAdmin 4 (included with PostgreSQL) for database management

- **Git** (already installed if you cloned this repo)
  - Check version: `git --version`

### Optional

- **Cursor IDE** (what we're using) or VS Code
  - Both support the same extensions
  - Recommended extensions:
    - ESLint
    - Prettier
    - Prisma
    - Tailwind CSS IntelliSense
    - GitLens

---

## First-Time Setup (5-10 minutes)

### 1. Clone the Repository (if you haven't already)

```bash
git clone <your-repo-url>
cd recipe_book
```

### 2. Install Dependencies

```bash
npm install
```

This downloads and installs all required packages (~400MB). Takes 2-5 minutes on first run.

### 3. Verify PostgreSQL is Running

1. Open **Windows Services** (search "Services" in Windows Start menu)
2. Look for "postgresql-x64-16" or similar
3. It should show "Running" status
4. If not running, right-click it and select "Start"

### 4. Create the Database

We use **pgAdmin 4** (web-based GUI for PostgreSQL):

1. Open pgAdmin 4 (search in Windows Start menu)
2. If prompted for master password, create one or skip
3. In the left sidebar, find "PostgreSQL 16" (or your version) under "Servers"
4. Right-click "Databases" and select "Create" → "Database"
5. Name it: `recipe_book_dev`
6. Click "Save"

You should now see `recipe_book_dev` in the database list.

### 5. Configure Environment Variables

1. In the project root, create a new file called `.env.local`
2. Copy the contents from `.env.example` (there's already one in the project)
3. Update `DATABASE_URL` with your PostgreSQL credentials:

```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/recipe_book_dev"
```

**Replace `your_password`** with the password you set when installing PostgreSQL (the `postgres` superuser password).

### Example (if your password was "postgres123"):

```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/recipe_book_dev"
```

**⚠️ IMPORTANT**: `.env.local` is in `.gitignore` and will NOT be committed. Your secrets are safe.

### 6. Start the Development Server

```bash
npm run dev
```

You should see:

```
> recipe_book@0.1.0 dev
> next dev

  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Environments: .env.local

```

Visit **http://localhost:3000** in your browser. You should see:

- Title: "Family Recipes"
- Subtitle: "Foundation established - Phase 1 complete ✅"
- Theme toggle button (☀️ Light Mode / 🌙 Dark Mode)
- A checklist showing what's working

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (with hot reload) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode (reruns on file changes) |
| `npm run lint` | Check code quality with ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create and apply database migrations |
| `npm run prisma:studio` | Open database GUI at http://localhost:5555 |

---

## Verifying Everything Works

### 1. Development Server

```bash
npm run dev
```

- Visit http://localhost:3000
- You should see the homepage with theme toggle

### 2. Theme Toggle

- Click the theme button
- Page should switch between light and dark modes
- Refresh the page - your theme choice persists ✅

### 3. Database Connection

Visit http://localhost:3000/api/health in your browser.

You should see JSON like:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-16T10:30:00.000Z"
}
```

### 4. Tests

```bash
npm test
```

Expected output:

```
PASS tests/unit/example.test.ts
PASS tests/unit/ThemeToggle.test.tsx

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
```

### 5. Linter

```bash
npm run lint
```

Should show no errors.

### 6. Database Visualization

```bash
npm run prisma:studio
```

Opens http://localhost:5555 with a GUI showing your database tables (should see `system_health` table).

---

## Project Structure

```
recipe_book/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/
│   │   │   └── health/route.ts        # Health check endpoint
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Home page
│   ├── components/
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx      # Theme context
│   │   └── ui/
│   │       └── ThemeToggle.tsx        # Theme toggle button
│   ├── lib/
│   │   └── prisma.ts                  # Database client
│   └── types/
│       └── index.ts                   # Shared types
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Database migration history
├── tests/
│   └── unit/
│       ├── example.test.ts            # Unit tests
│       └── ThemeToggle.test.tsx       # Component tests
├── public/
│   └── favicon.ico
├── .env.example                       # Environment variables template
├── .env.local                         # Your actual env vars (gitignored)
├── jest.config.js                     # Jest test config
├── jest.setup.js                      # Jest setup
├── next.config.js                     # Next.js config
├── package.json                       # Dependencies
├── tailwind.config.ts                 # Tailwind CSS config
└── tsconfig.json                      # TypeScript config
```

---

## Tech Stack

| Technology | Purpose | Why This Choice |
|-----------|---------|----------------|
| **Next.js 16** | Full-stack framework | Frontend + backend API routes in one framework |
| **TypeScript** | Language | Type-safe code, catches errors before runtime |
| **Tailwind CSS** | Styling | Utility-first CSS, easy dark mode support |
| **PostgreSQL** | Database | Reliable relational database, great for complex data |
| **Prisma** | ORM | Type-safe database access, auto-migrations |
| **Jest** | Testing | Industry standard test runner |
| **React 19** | UI Library | Latest React features, Server Components |
| **next-themes** | Theme Management | Simple light/dark mode with localStorage |

---

## Common Tasks

### Making Code Changes

1. Edit any file in `src/`
2. Save the file
3. The dev server automatically refreshes your browser (hot reload)
4. No restart needed!

### Creating New Pages

1. Create a new file in `src/app/`
   - Example: `src/app/recipes/page.tsx` → Route becomes `/recipes`
   - Folders automatically become URL segments

2. Export a React component:

```typescript
export default function RecipesPage() {
  return <h1>My Recipes</h1>
}
```

### Adding Database Models

1. Edit `prisma/schema.prisma`
2. Add a new `model` section
3. Run `npm run prisma:migrate` to create the migration
4. Prisma Client is automatically regenerated

### Creating API Endpoints

1. Create a file in `src/app/api/path/route.ts`
   - Example: `src/app/api/recipes/route.ts` → GET `/api/recipes`

2. Export a handler function:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file change)
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

---

## Troubleshooting

### "Port 3000 already in use"

Something else is using the port. Either:

```bash
# Kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Or use a different port
npm run dev -- -p 3001
```

### "Can't connect to database"

Checklist:

- [ ] Is PostgreSQL running? (Check Windows Services)
- [ ] Is `DATABASE_URL` correct in `.env.local`?
- [ ] Does database `recipe_book_dev` exist? (Check in pgAdmin)
- [ ] Is the password correct?
- [ ] Is port 5432 available?

**To verify database connection:**

```bash
npm run prisma:studio
```

Should open http://localhost:5555 with the database GUI.

### "Module not found: @/components/..."

Path alias issue. In VS Code/Cursor:

1. Press `Ctrl+Shift+P`
2. Type "TypeScript: Restart TS Server"
3. Press Enter

### "Prisma Client did not initialize"

```bash
npm run prisma:generate
npm run dev
```

### "hydration failed"

Usually means server and client rendered different content. Check:

- Is `suppressHydrationWarning` on the `<html>` tag in `layout.tsx`?
- Does ThemeToggle have a `mounted` check before rendering?

These are usually already correct, so just restart the dev server.

### TypeScript errors in IDE

```bash
npm install
npm run prisma:generate
```

Then restart your IDE.

---

## Development Workflow

### Starting Your Day

```bash
# Make sure PostgreSQL is running (Windows Services)
# Then in a terminal:
npm run dev
```

Visit http://localhost:3000 - you're ready to develop!

### Before Committing

```bash
# Run tests
npm test

# Check code quality
npm run lint

# Build for production
npm run build
```

If all pass, you're good to commit!

### Pushing Changes

```bash
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name
```

---

## What's Included in Phase 1

✅ Full-stack TypeScript setup
✅ Next.js 16 with modern App Router
✅ Tailwind CSS with light/dark mode
✅ PostgreSQL database connected via Prisma ORM
✅ Jest testing framework with example tests
✅ ESLint and Prettier for code quality
✅ Health check API endpoint
✅ Development documentation

---

## What's Next (Phase 2)

Phase 2 will add:

- User authentication (email/password)
- Signup and login pages
- Session management
- Protected routes
- User model in database

See `development-phases.md` for the full roadmap.

---

## Learning Resources

- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

---

## Project Requirements

Full MVP requirements are in `requirements.md`.

Key points:

- Private, group-based recipe repository
- Mobile-first design
- Role-based access control (Admin, Power User, Read-only)
- Recipes with structured ingredients
- Comments and favorites
- Photos (later phase)
- AI-assisted recipe import (optional)

---

## Need Help?

If something isn't working:

1. Check this README for your issue (Troubleshooting section)
2. Verify all prerequisites are installed
3. Try restarting the dev server: `npm run dev`
4. Check the browser console for errors (F12)
5. Read the error message carefully - it usually tells you what's wrong

---

## Phase 1 Verification Checklist

Before moving to Phase 2, verify ALL of these work:

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads the home page
- [ ] Theme toggle button works and persists on refresh
- [ ] http://localhost:3000/api/health returns `"status": "ok"` and `"database": "connected"`
- [ ] `npm test` passes all 15 tests
- [ ] `npm run lint` shows no errors
- [ ] `npm run prisma:studio` opens database GUI at http://localhost:5555
- [ ] `npm run build` completes without TypeScript errors

If any of these fail, troubleshoot before moving forward!

---

**Happy cooking! 👨‍🍳**
