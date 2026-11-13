# Patterns and conventions

Keep business rules pure and UI code explicit. `AGENTS.md` defines the conventions; `.eslintrc.json`, `tsconfig.json`, and `.prettierrc` enforce parts of them.

## Money and validation

Store prices and totals as cents. Route every total through `lib/pricing.ts`, and format it with `lib/currency.ts`. The current bulk-discount implementation multiplies by a fractional rate and rounds to integer cents; do not duplicate that calculation in React.

Accept HTTP payloads as `unknown`, validate them in `lib/orders.ts`, and only then call `buildOrder`. Validation returns a discriminated union with either a clean request or a list of errors. The API must calculate totals from catalog data, not accept browser totals (`app/api/orders/route.ts`).

## Boundaries

- `lib/`: no React or I/O. Prefer named exports and explicit types.
- `components/` and `app/`: rendering, event handling, routing, and browser state.
- `server/`: server I/O, including logging and telemetry.
- `tests/`: module-oriented tests that cover boundaries, rounding, and malformed input.

`components/CartProvider.tsx` uses functional state updates and guards its initial storage write. Preserve those patterns when changing cart behavior.

## Names and limits

`.eslintrc.json` permits camelCase values, PascalCase types/components, module constants in uppercase, and Next.js HTTP method exports. `AGENTS.md` calls for kebab-case product ids, CSS classes, and branch slugs.

The lint limits are function complexity 10 and 400 lines per file excluding comments and blank lines. TypeScript strict checking is configured in `tsconfig.json`.

## Errors and telemetry

Wrap API handlers with `withTelemetry` in `server/telemetry.ts`. Expected validation errors return 400; unexpected exceptions become a generic 500 and are reported. Log structured fields through `server/logger.ts`, not raw request bodies.

Analytics event and flag names belong in `lib/analytics.ts`. Send events through `track` in `components/posthog.ts`, without pickup names or other personal data. Flag-off behavior must remain usable.

Sensitive-key redaction is not a substitute for avoiding personal data: free-text messages and Error messages/stacks are not scrubbed by key matching (`server/logger.ts`).

## Formatting and commits

Use two spaces, semicolons, double quotes, and an 80-column print width (`.prettierrc`). Markdown is excluded by `.prettierignore`, so formatting checks alone do not validate wiki prose or links.

`AGENTS.md` requests lowercase imperative commit subjects without a prefix and branches named `feature/<slug>`. Follow the [Development workflow](development-workflow.md) and run the [Testing](testing.md) checks before requesting review.

## Current-code implementations

Build each feature from the request and the current code (`AGENTS.md`). Do not read, reuse, or revert earlier attempts from Git history, including reverted commits, closed or merged PRs, and `Rehearsal-*` commits. Do not run `git show`, `git log -p`, or `git revert` on those attempts. This applies to implementation work; an old attempt is not a specification for a new change.
