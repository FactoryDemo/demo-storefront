# Lore

History checked **2026-11-12**, through `fbdb7e0` on `origin/main`. The repository's reachable history spans November 1–12, 2026: these are short implementation phases, not inferred organizational eras. Dates below use committer dates in America/New_York unless an author date is explicitly noted. Commit subjects and diffs establish what changed, not undocumented motives.

For the present design, read [Architecture](overview/architecture.md); for measurement methods, see [By the numbers](by-the-numbers.md).

## November 1–2: a small pricing storefront and PR automation

The root commit, `2f9a365` on **November 1**, introduced the catalog, cart UI, cents-based pricing, pricing tests, and CI. `components/Storefront.tsx` originally held cart state and quantity operations inside one client component, rendered five emoji products, and showed an inline cart panel. `lib/pricing.ts` already applied a 10% discount per line at quantity three, rather than discounting the entire mixed cart.

On **November 2**, `4cd074e` added `.github/workflows/droid.yml`, and `cd97f83` added the historical [droid-review workflow](https://github.com/FactoryDemo/demo-storefront/blob/49fd498/.github/workflows/droid-review.yml). `dfff38d` recorded automatic PR review in `README.md`. The linked workflow is historical, not a file to configure today.

## November 6 authored; November 8 landed: pricing extension and Finance checks

Three commits preserve **November 6 author dates**, but their committer dates are **November 8**:

| Commit | Verified change |
| --- | --- |
| `f05e813` | Added `lib/promotions.ts`, `PricedLine` in `lib/types.ts`, and optional promo-code handling in `lib/pricing.ts`, with updates to `tests/pricing.test.ts` |
| `3109594` | Added secret-supplied Finance checkout-rule execution to `.github/workflows/ci.yml` |
| `49fd498` | Updated the historical [droid-review workflow](https://github.com/FactoryDemo/demo-storefront/blob/49fd498/.github/workflows/droid-review.yml) for deep review on PR pushes |

The date distinction matters: reading only author dates would place these changes before their recorded landing in this graph. It does not establish why their dates differ.

The promotion extension is still present, not a deprecated customer feature: `lib/promotions.ts` has an empty `PROMOTIONS` registry, and neither `components/Checkout.tsx` nor `app/api/orders/route.ts` accepts a promo code. The checked-in history does not demonstrate a once-live checkout promo field. The Finance archive is not tracked; its actual rules cannot be reconstructed from this repository.

## November 8: tooling and the photo-menu rewrite

`aeafa9f` added ESLint, Prettier, ownership/configuration files, and repository hygiene. `f6fac49` added quality gates, Playwright coverage, architecture/runbook documentation, a health route, and server logging (`.github/workflows/quality.yml`, `e2e/storefront.spec.ts`, `app/api/health/route.ts`, `server/logger.ts`).

Later that day, **`3051fac` rewrote the storefront presentation and cart arrangement**:

- `lib/products.ts` grew from five emoji entries to 13 photo-backed products in four categories.
- `lib/types.ts` removed `Product.emoji`, replacing it with category, description, and image fields. The `beans` product id survived, while its label changed from “Bag of Beans (250g)” to “House Blend, 250g.”
- The old in-component cart operations and inline panel in `components/Storefront.tsx` gave way to shared state in `components/CartProvider.tsx`, pure updates in `lib/cart.ts`, and the drawer in `components/CartDrawer.tsx`.
- Mock pickup checkout arrived in `components/Checkout.tsx`, `lib/orders.ts`, and `app/api/orders/route.ts`. Confirmation was added through `components/lastOrder.ts`, `components/OrderConfirmation.tsx`, and `app/orders/[id]/page.tsx`.

This is evidence of a UI/state rewrite, not a replacement of the pure pricing boundary: the new checkout still uses `lib/pricing.ts`. See [Checkout](features/checkout.md) for the current flow.

## November 9: telemetry and a changing review gate

`cd561d2` added product analytics, flags, error reporting, metrics, profiling, alerts, and deploy markers. The concrete additions include `components/posthog.ts`, `components/Analytics.tsx`, `lib/analytics.ts`, `server/telemetry.ts`, `server/instrumentation-node.ts`, `observability/grafana/dashboard.json`, and `.github/workflows/deploy.yml`. These are optional integrations in the current code, not evidence that production traffic or alerts occurred.

Review execution changed several times in the same day's history:

- `9b06abb` deleted the historical [droid-review workflow](https://github.com/FactoryDemo/demo-storefront/blob/49fd498/.github/workflows/droid-review.yml) and moved automatic review into `.github/workflows/ci.yml` behind the test job.
- `20f63a2` updated `.github/workflows/droid.yml`; `2d6a235` then restored its mentions-only behavior.
- `38816b4` changed `AGENTS.md` to require stopping after opening a PR rather than waiting for CI.

The resulting instructions and workflows are implementation evidence; this history does not document an incident that caused those changes.

## November 10–11: separate workflows and tooling replacement

On **November 10**, `9bbbe61` separated mention handling into `.github/workflows/droid-tag.yml` and automatic review into `.github/workflows/droid.yml`, removing the review job from `.github/workflows/ci.yml`.

On **November 11**, `56c9650` aligned tooling and documentation with the practice repository, as its subject states. It deleted the historical [quality-summary script](https://github.com/FactoryDemo/demo-storefront/blob/9bbbe612896c8d076148d9216bfaa4b656a787cd/scripts/quality-summary.mjs) and added `scripts/ci-test-summary.mjs`, switching `.github/workflows/quality.yml` to the new helper. The old helper reported five slowest tests and a per-suite table; the new helper reports ten slowest tests and a total summary. The same commit revised `server/logger.ts` and `tests/logger.test.ts`; the diff alone does not establish an external compatibility requirement.

Also on November 11, `b5c81f5` added dependency-update exclusions in `.github/dependabot.yml`. Finally, **`9a60c53` removed the CI-wait/skip steps from `.github/workflows/droid.yml`**, allowing review alongside CI on PR pushes. That supersedes the earlier test-pass gate; it does not remove the tests themselves.

## November 12: rolling wiki refresh

`fbdb7e0` added `.github/workflows/droid-wiki-refresh.yml`: 123 inserted lines, with no application source changes. Main pushes now trigger wiki generation with read-only GitHub-token permissions, full history, and restoration of `droid-wiki/` from `factory/droid-wiki`. A separate write-scoped job receives the generated artifact and opens or updates the rolling documentation PR. This records automation configuration, not evidence that a run, cloud upload, or PR publication succeeded. See [Wiki refresh](how-to-contribute/wiki-refresh.md) for the token fallback and publishing boundaries.

## Oldest surviving features

These trace directly to the November 1 seed:

| Surviving element | Evidence in the current tree |
| --- | --- |
| Per-line bulk discount: three or more, 10% off, round the line total to cents | `lib/pricing.ts`, compared with the [seed pricing source](https://github.com/FactoryDemo/demo-storefront/blob/2f9a365/lib/pricing.ts) |
| USD display from cents | `lib/currency.ts` is unchanged between `2f9a365` and `9a60c53` |
| The original product ids and prices: `espresso` 295, `drip` 350, `latte` 475, `cold-brew` 425, `beans` 1500 | `lib/products.ts`, compared with the seed; descriptions/presentation changed later |
| Product-id/quantity cart items and a pure pricing core with tests | `lib/types.ts`, `lib/pricing.ts`, `tests/pricing.test.ts`; cart ownership changed in the November 8 rewrite |

## Replaced, not silently “deprecated”

The concrete retired pieces are the emoji product field and inline cart implementation (**November 8**), the historical [droid-review workflow](https://github.com/FactoryDemo/demo-storefront/blob/49fd498/.github/workflows/droid-review.yml) (**November 9**), the historical [quality-summary script](https://github.com/FactoryDemo/demo-storefront/blob/9bbbe612896c8d076148d9216bfaa4b656a787cd/scripts/quality-summary.mjs) (**November 11**), and the review workflow's CI-wait gate (**November 11**). Their replacements and commit evidence are listed above.

There is **no evidence of a formal feature-deprecation policy or scheduled removal window**, and no tracked history establishes a removed real-payment flow, login system, database, or server-side order archive. Do not describe those absent capabilities as deprecated features. Likewise, an empty promotion registry is not proof that live promotions were removed.
