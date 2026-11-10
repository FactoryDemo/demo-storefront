# AGENTS.md

## Project

Bean & Byte is a small demo storefront: a Next.js (App Router) menu, cart,
and mock pickup checkout with a pure TypeScript pricing core. It exists to be worked on by
agents, so keep the code plain, typed, and well tested.

## Commands

- `npm ci` — install dependencies
- `npm test` — run the test suite (Vitest, non-interactive)
- `npm run typecheck` — TypeScript check without emitting
- `npm run lint` — ESLint via `next lint` (`next/core-web-vitals` rules)
- `npm run format` — format all files with Prettier
- `npm run format:check` — verify formatting without writing changes
- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm run test:ci` — tests with coverage thresholds, retries, and a JUnit report (what CI runs)
- `npm run test:e2e` — Playwright end-to-end tests; builds and starts the app on port 3000 (first run: `npx playwright install chromium`)
- `npm run knip` — report unused files, exports, and dependencies
- `npm run dup:check` — report duplicated code (jscpd)
- `npm run size` — check client bundle size budgets in `.size-limit.json` (run `npm run build` first)
- `npm run todo:report` — list TODO, FIXME, and HACK comments in source
- `npm run docs:generate` — generate TypeDoc API docs for `lib/` into docs/api (gitignored)
- `npm run agents:check` — verify the commands and paths in this file still exist
- `npm run prepare` — install the Husky pre-commit hook (runs automatically on `npm ci`)

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run format:check`
before considering any change done.

The pre-commit hook (`.husky/pre-commit`) runs lint-staged: ESLint `--fix` on
staged TypeScript in `app/`, `lib/`, and `components/`, then Prettier on all
staged files. It never runs tests.

## Trying the app

1. `npm ci`, then `npm run dev`, and open http://localhost:3000. No login or
   environment variables are needed.
2. Click "Add to cart" on one item three times (for example Drip Coffee,
   $3.50), then open the cart from the header.
3. Confirm that cart line is 10% off: 3 × $3.50 = $10.50, shown as $9.45.
4. Check the cart total: $9.45 for that cart. Adding one Espresso ($2.95)
   makes it $12.40.
5. Click Checkout, enter a name, and place the order. The confirmation page
   shows an order number and the same $12.40 total. Nothing is charged.

The full checklist, including the health check, is in
`.factory/skills/storefront-qa/SKILL.md`.

## Conventions

- **Money is integer cents.** No floats, no `Number` math on currency. All
  totals flow through `lib/pricing.ts` and display through
  `lib/currency.ts`.
- `lib/` is pure logic with no React and no I/O; UI lives in `components/`
  and `app/`. Keep it that way.
- The cart is shared by every page through `components/CartProvider.tsx`.
  Checkout posts to `app/api/orders/route.ts`, which re-prices the order
  with `lib/orders.ts`; never trust a total sent by the browser.
- Tests live in `tests/` and mirror the module they cover
  (`tests/pricing.test.ts` covers `lib/pricing.ts`). Cover edge cases:
  zero quantities, boundaries (e.g. the bulk discount threshold), and
  rounding.
- Prefer named exports and explicit types over cleverness. TypeScript
  strict mode is on; do not silence it.
- Analytics event names and feature flag keys live in `lib/analytics.ts`.
  Send events with `track()` from `components/posthog.ts`, and never put the
  customer's name or other personal data in event properties. Every flag is
  off until PostHog answers, so the app must work with all flags off.
- Wrap API route handlers in `withTelemetry` from `server/telemetry.ts` so
  errors are reported and metrics are flushed.
- Commit messages: one line, imperative, lowercase, no prefix. Example:
  `apply bulk discount per cart line, not per cart`.

### Naming

- camelCase for functions, variables, parameters, and properties
  (`calculateLineTotal`, `priceCents`).
- PascalCase for types and React components (`CartItem`, `Storefront`).
  Component files use the component name (`components/Storefront.tsx`).
- SCREAMING_SNAKE_CASE for module-level constants (`BULK_DISCOUNT_THRESHOLD`,
  `PRODUCTS`).
- kebab-case for ids and slugs: product ids (`cold-brew`), branch slugs, and
  skill names.
- Route handlers keep the HTTP method names Next.js requires (`GET`).
- `npm run lint` enforces the identifier rules in `app/`, `components/`, and
  `lib/` with `@typescript-eslint/naming-convention`, and also caps cyclomatic
  complexity at 10 per function and files at 400 lines (`.eslintrc.json`).

## Docs

- `docs/architecture.md` — how the catalog, cart, pricing core, checkout,
  and currency formatting fit together, and where UI and pure logic live.
- `docs/runbooks/local-development.md` — setup, common local failures, and
  the health check.
- `docs/runbooks/observability.md` — where analytics, errors, traces,
  metrics, profiles, deploys, and alerts go, and what to do when one fires.
- Server code that does I/O (logging, telemetry) lives in `server/`, not `lib/`.

## Pull requests

- Branch from `main`, name branches `feature/<slug>`.
- The PR description states what changed, why, and which tests cover it
  (`.github/pull_request_template.md`).
- Run the local checks above before opening the PR, then stop: opening the
  PR is the end of the task. Do not wait for, poll, or watch CI afterwards
  (no `gh pr checks`, `gh run watch`, or `gh run view`, and no sleeping until
  checks finish). CI and review happen on the PR, and the team follows up
  there.
- Read CI results only when a task asks you to fix a failing check on a PR.
  Push that fix to the same PR and stop again.
- Never commit `.env*` files or secrets.
