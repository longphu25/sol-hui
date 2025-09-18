# Repository Guidelines

## Project Structure & Module Organization
- `src/app` contains App Router routes, layouts, and metadata; treat each folder as its own feature flow.
- `src/components` houses reusable UI, grouped by domain folders (`account`, `dashboard`, `profile`) plus shared `ui/`.
- Shared logic lives in `src/hooks`, `src/lib`, `src/constants`, and `src/utils`; prefer the `@/*` alias from `tsconfig.json` over deep relative paths.
- Static assets belong in `public/`; refer to them via `/asset.png` so Next.js can optimize delivery.

## Build, Test, and Development Commands
- `npm run dev` starts the local server on port 3003 with Turbopack.
- `npm run build` runs the production compiler; fix warnings here before tagging a release.
- `npm run start` serves the optimized build to mirror deployment.
- `npm run lint` applies the shared ESLint/Next rules with zero-warning tolerance.
- `npm run check-types` executes `tsc --noEmit`; keep it clean before opening a pull request.

## Coding Style & Naming Conventions
- Format with Prettier plus the repo ESLint config (two-space indent, trailing commas). Run `npx prettier --write src` if your editor is not wired up.
- Feature folders stay lowercase or kebab-case; exported React components remain PascalCase, hooks start with `use`, utilities use camelCase.
- Favor Tailwind utilities with `clsx`/`tailwind-merge`; keep inline styles and hard-coded colors out of components.

## Testing Guidelines
- Automated tests are not yet wired in; rely on `npm run lint`, `npm run check-types`, and focused manual QA (wallet connect, transfers, profile edits).
- When adding tests, collocate `*.test.tsx` beside the source or under `src/__tests__`, use React Testing Library patterns, and mock Solana RPC calls.
- Capture manual steps or edge cases in your PR description so reviewers can reproduce them.

## Commit & Pull Request Guidelines
- Write short, imperative commit titles (`Update layout: profile sidebar`) similar to recent history; keep body text focused on why.
- Every PR needs a summary, linked issue or ticket, screenshots for UI changes, and a verification checklist covering lint, type-check, and critical manual flows.
- Tag reviewers who own the touched area and resolve TODOs or debug code before requesting approval.

## Environment & Configuration Tips
- Store secrets in `.env.local`; only expose browser values with a `NEXT_PUBLIC_` prefix.
- Use the helpers under `src/components/cluster` for Solana endpoints instead of hard-coded URLs to keep environments consistent.
