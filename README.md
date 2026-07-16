# GrantHelper

Match students with grants and scholarships based on their real academic profile, not guesswork.

GrantHelper collects a student's GPA, standardized test scores, activities and documents, then compares them against the structured eligibility requirements of each grant. Every match comes with a transparent, criterion-by-criterion breakdown so students know exactly where they stand and what to improve.

## Features

- **Profile and onboarding** — a resumable wizard captures basics, GPA (normalized across scales), standardized tests and activities. Volunteer hours are recalculated automatically.
- **Matching engine** — a pure, fully tested TypeScript module scores every grant and classifies it as eligible, borderline, incomplete or not eligible.
- **Grants catalog** — searchable and filterable list with live status counts, plus a detail page showing the full requirements breakdown and required documents.
- **Applications tracker** — group applications by status, change status inline, keep notes and delete with an inline confirmation.
- **Documents and essays** — write essays in-app or upload files (PDF, DOC, DOCX, TXT, PNG, JPG) to a private Storage bucket, mark them ready, and see readiness reflected on grants that require them.
- **Dashboard** — profile strength, eligible grant count, active applications, nearest deadline, top matches and upcoming deadlines at a glance.
- **Localization** — full English and Russian translations with a live language switch.
- **Accessible and monochrome** — a calm black-and-white design system, keyboard friendly, with translated labels throughout.

## Tech stack

- **React 19** and **TypeScript** on **Vite**
- **Tailwind CSS v4** for styling
- **React Router** for routing with route-level code splitting
- **Supabase** for authentication, Postgres with row level security, and Storage
- **i18next** and **react-i18next** for localization
- **lucide-react** for icons
- **Vitest** for unit tests

## Project structure

```
src/
  landing/       Presentational marketing pages (public "/")
  frontend/      The product application
    pages/       Route level screens (auth, dashboard, grants, documents, ...)
    layouts/     App shell for authenticated pages
    components/   Shared UI kit and feature components
    providers/   Auth and Profile React contexts
    hooks/       Reusable hooks (for example useMatches)
  backend/       All Supabase access lives here and only here
    services/    Typed data access functions
    types/       Database row types
  lib/           Framework agnostic helpers (matching engine, dates, i18n, ...)
  locales/       en and ru translation files
supabase/
  migrations/    SQL migrations, applied in order
```

The `backend` folder is the single boundary for Supabase. No other part of the app imports the Supabase client directly.

## Local setup

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd granthelper
   npm install
   ```

2. Create a `.env.local` file in the project root with your Supabase project credentials:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Apply the database migrations. Open the Supabase SQL editor and run the files in `supabase/migrations/` in order:

   - `0001_initial_schema.sql` — tables, row level security and the signup trigger.
   - `0002_documents_storage.sql` — the private `documents` Storage bucket and its folder-scoped policies.

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app runs on the port printed in the terminal (Vite default `5173`).

## Scripts

| Script            | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Start the Vite development server          |
| `npm run build`   | Type check and build the production bundle |
| `npm run preview` | Serve the production build locally         |
| `npm test`        | Run the Vitest unit tests once             |
| `npm run lint`    | Run oxlint over the source                 |

## The matching engine

The engine lives in `src/lib/matching` and imports nothing from Supabase or React, which keeps it pure and easy to test. For each grant it builds a list of criteria from the requirements that grant actually specifies (degree level, citizenship, age, GPA, English test, SAT, volunteer hours) and evaluates each one to a state:

- **met** — the requirement is satisfied.
- **close** — just below the requirement, within a small tolerance.
- **failed** — the requirement is not met.
- **unknown** — the profile does not yet have the data to decide.

The overall status aggregates those states:

- **not eligible** — any criterion failed.
- **borderline** — no failures, but at least one criterion is close.
- **incomplete** — no failures or close calls, but some data is missing.
- **eligible** — every criterion is met.

A weighted score (met counts fully, close counts half, unknown counts a quarter) drives the ordering within each status group, so the strongest matches always surface first.
