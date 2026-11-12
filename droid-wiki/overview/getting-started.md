# Getting started

Use Node.js 20 and npm to run the storefront. No login or external-service credentials are required (`docs/runbooks/local-development.md`, `.devcontainer/devcontainer.json`).

## Install and run

From the repository root:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. `npm ci` installs the lockfile versions and runs the Husky setup through the `prepare` script in `package.json`.

For a production run:

```bash
npm run build
npm run start
```

The devcontainer in `.devcontainer/devcontainer.json` provides Node 20, forwards port 3000, and installs dependencies.

## Verify a change

Run the checks required by `AGENTS.md`:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
```

For browser coverage, install Chromium once and run:

```bash
npx playwright install chromium
npm run test:e2e
```

`playwright.config.ts` builds and starts a production server, but reuses an existing port-3000 server outside CI. Stop a stale server you own before relying on a fresh-build test.

## Try checkout

1. Add Drip Coffee three times and open the cart. The discounted line and total should be $9.45.
2. Add one Espresso. The total should become $12.40.
3. Open checkout, enter a synthetic pickup name, and place the order.
4. Confirm the same $12.40 total and an empty cart.

These expectations come from `AGENTS.md`, `.factory/skills/storefront-qa/SKILL.md`, and `e2e/storefront.spec.ts`.

`GET /api/health` should return HTTP 200 with `{"status":"ok"}` (`app/api/health/route.ts`). It confirms the handler runs, not the availability of external telemetry services.

## Optional configuration

Variable names are documented in `.env.example`. Leave telemetry variables unset for an offline-service local experience. Never commit environment files or credentials (`AGENTS.md`). See [Configuration](../reference/configuration.md) for the split between browser, server, and CI variables.

For setup failures, see [Debugging](../how-to-contribute/debugging.md).
