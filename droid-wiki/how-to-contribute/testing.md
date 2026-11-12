# Testing

Unit tests protect pure rules and server helpers; Playwright checks the browser and HTTP boundary. `package.json`, `vitest.config.ts`, and `playwright.config.ts` define the commands and scope.

## Required local checks

From the repo root, run:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

`AGENTS.md` requires all four before considering a change done. Husky does not run tests. Markdown is excluded by `.prettierignore`, so formatting success does not validate wiki content or links.

## Unit coverage

Vitest runs `tests/**/*.test.ts` in the Node environment. The checked-in suite contains 70 tests across seven files:

| Repo-root path | Tested behavior |
| --- | --- |
| `tests/pricing.test.ts` | Discount boundary, mixed lines, ignored inputs/codes, currency formatting |
| `tests/cart.test.ts` | Immutable updates, removal, counts, stored-cart filtering |
| `tests/products.test.ts` | Id/category/price invariants, photo path strings, lookup |
| `tests/orders.test.ts` | Validation, trimmed names, duplicate merge, server pricing, pickup labels |
| `tests/analytics.test.ts` | Event/flag names, release defaults, safe property builders |
| `tests/logger.test.ts` | Levels, protected fields, key redaction, serialization |
| `tests/telemetry.test.ts` | Handler passthrough, generic 500/logging, unconfigured telemetry |

`npm run test:ci` adds V8 coverage, up to two retries, and `reports/junit.xml`. Coverage includes only `lib/**/*.ts`, with thresholds of 87% statements, 86% branches, 90% functions, and 87% lines. Server-helper tests do not make these thresholds application-wide coverage.

`.github/workflows/quality.yml` uploads coverage and reports even after failure when available. `scripts/ci-test-summary.mjs` reads `coverage/coverage-summary.json` and JUnit, printing coverage and the ten slowest tests; missing files are reported rather than treated as successful coverage.

## Additional Finance rules

`.github/workflows/ci.yml` requires `FINANCE_RULES`. It base64-decodes a gzipped archive into the workspace, runs `npx vitest run --config vitest.rules.config.ts`, and removes injected `rules` and config on exit. A missing secret explicitly fails the step. The archive and its rules are not checked in or available locally; passing the public suite does not establish that these tests pass. Do not guess their contents or expose the secret to reproduce them.

## Browser and API checks

Install Chromium once with `npx playwright install chromium`, then run `npm run test:e2e`. `e2e/storefront.spec.ts` has six checks: menu, bulk-discount display, reload persistence, checkout/confirmation/cart clearing, API repricing/rejection, and health.

Playwright uses desktop Chromium, retains traces on failure, and waits on `/api/health` at port 3000. Its server command is `npm run build && npm run start`; outside CI it may reuse an existing server instead. Stop a stale server you own before expecting a fresh production-build run. CI forbids `test.only`, installs Chromium system dependencies, and uploads failure reports/traces for seven days (`.github/workflows/e2e.yml`).

Manual QA is specified in `.factory/skills/storefront-qa/SKILL.md`: three Drip Coffees cost $9.45; one added Espresso makes $12.40; checkout returns the same total without charging anything. See [Debugging](debugging.md) for failure isolation. These tests do not establish browser-SDK delivery, live external-service availability, or durable order storage.
