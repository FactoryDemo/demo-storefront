# Debugging

Start with the failing boundary: local process, browser state, validation, or optional telemetry. `docs/runbooks/local-development.md` and `docs/runbooks/observability.md` are the source runbooks.

## Local setup

| Symptom | Check and recovery |
| --- | --- |
| Port 3000 busy or Next chooses another port | Inspect `lsof -i :3000`; stop only a process you own, or use `npm run dev -- -p 3001`. Playwright still targets 3000. |
| Stale pages or missing modules under `.next` | Stop the local server, clear only generated `.next` output, and restart/rebuild. Do not discard source changes. |
| `npm ci` reports lockfile drift | If intentionally changing dependencies, update and commit `package.json` and `package-lock.json` together; do not delete the lockfile to bypass failure. |
| Chromium executable missing | Run `npx playwright install chromium`; Linux may need `--with-deps`. |
| Hook absent | Run `npm run prepare`; the hook runs lint-staged, not tests. |

The devcontainer uses Node 20 (`.devcontainer/devcontainer.json`), matching workflow setup. A failed production build is real failure even when shown in the Analysis workflow's report-only summary.

## Browser state and checkout

- **Missing cart after reload:** inspect `bean-and-byte:cart` in localStorage and browser storage errors. `lib/cart.ts` drops malformed/unknown entries; `components/CartProvider.tsx` waits for hydration before persisting but does not catch storage access exceptions.
- **400 on checkout:** read the returned `errors` array. `lib/orders.ts` checks name, pickup, known products, and integer quantities 1–99 per submitted line. UI quantity edits have no matching cap.
- **Unexpected total:** compare `lib/products.ts` and `lib/pricing.ts`; the server merges duplicate products before repricing. See [Pricing](../features/pricing.md).
- **“Order not found”:** confirmation reads only the last matching id in this tab's sessionStorage. A different tab, replaced receipt, or failed storage can lose confirmation after successful placement (`components/lastOrder.ts`, `components/OrderConfirmation.tsx`). There is no recovery GET endpoint.
- **500:** `server/telemetry.ts` returns a generic message; inspect structured server logs and optional PostHog exceptions rather than expecting the client to receive a stack.

## Missing operational signals

`GET /api/health` proves the handler runs, not that PostHog, OTLP, or profiling exports work. With optional variables unset, missing external signals and a disabled menu announcement are expected. Check variable names without printing credential values; public analytics values are built into the browser bundle.

For a deployed incident, compare release/version and deploy markers, inspect [Logs](../how-to-monitor/logging.md), then correlate [Traces](../how-to-monitor/tracing.md). `profiling unavailable` is a caught warning: native profiler failure is designed not to stop the storefront. See [Configuration](../reference/configuration.md).
