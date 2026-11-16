# Checkout

Active contributors: nicolasschmidt2001 (Nicolas Schmidt)

## Purpose

Checkout collects a pickup name and time, posts cart quantities and an optional applied promo code, and shows a server-priced mock order. Nothing is charged, reserved, or saved to a server-side order store (`components/Checkout.tsx`, `app/api/orders/route.ts`).

## Layout and abstractions

`app/checkout/page.tsx` renders `components/Checkout.tsx`. The component waits for cart hydration, shows a browse-menu link for an empty cart, and otherwise displays the form and `components/OrderLines.tsx` summary.

`lib/orders.ts` defines `OrderRequest`, `Order`, the validation union, and five pickup ids: `asap`, `in-15`, `in-30`, `in-45`, and `in-60`. These are fixed labels, not live scheduling availability. Both request and order support optional `promoCode`. `buildOrder` receives an id and Date from the caller, calculates lines and total using the catalog and validated code, and emits an ISO placement timestamp.

The code is entered in `components/CartDrawer.tsx`, not the pickup form. Checkout reads `promoCode` from `components/CartProvider.tsx` for its total preview and submit-button amount, and includes the field in the request only when a code is applied. Reloading checkout keeps saved quantities but loses the in-memory code. See [Cart](cart.md).

## Request and confirmation flow

```mermaid
sequenceDiagram
    participant UI as Checkout
    participant API as POST /api/orders
    participant Core as lib/orders.ts
    participant Tab as sessionStorage
    UI->>API: name, pickup, items, optional promoCode
    API->>Core: Validate unknown body
    Core-->>API: Errors or trimmed name, merged items, normalized promoCode
    API->>Core: Build order with generated id and date
    API-->>UI: 201 order or 400 errors
    UI->>Tab: Save last order
    UI->>UI: Clear cart and promo, navigate to /orders/id
```

`components/Checkout.tsx` disables the submit button while submitting. Rejected requests display returned errors; fetch or JSON-processing failures display a connection/retry message. Failure keeps the cart and applied code. Success tracks order facts, saves the response, clears the cart and code, and navigates.

`app/api/orders/route.ts` rejects malformed JSON, calls validation, and creates an id in the form `BB-` plus six uppercase UUID characters. It returns 201 for a placed order or 400 with an errors array for invalid input. `withTelemetry` handles unexpected exceptions; see the [API contract](../api/index.md) and [Monitoring](../how-to-monitor/index.md).

## Validation boundaries

`validateOrderRequest` in `lib/orders.ts` requires a nonblank string name of at most 60 characters after trimming, a known pickup id, and a nonempty array of known products with integer quantities from 1 through 99.

The 99-unit limit is checked **per raw input line before merging**. Two valid lines for the same product can merge into a quantity above 99; there is no second merged-quantity cap. Duplicate merging also lets repeated lines reach the bulk-discount threshold before server pricing.

Optional `promoCode` accepts omission, `null`, or a blank/whitespace-only string as no code; the validated request omits that field. Known codes are trimmed and uppercased, so ` save10 ` becomes `SAVE10`. Unknown strings and non-string values other than `null` are rejected with “That promo code isn't valid.” (`lib/orders.ts`, `lib/promotions.ts`).

The API accepts no authoritative browser total. `buildOrder` uses `priceLines(request.items)` for bulk-only line snapshots and `calculateCartTotal(request.items, request.promoCode)` for the final total. It includes the accepted code on the returned order. SAVE10 applies only below the bulk threshold after duplicate merging: Espresso quantities one and two become a single bulk-priced line totaling 797 cents, with no further promo discount (`tests/orders.test.ts`). See [Pricing](pricing.md) for exact filtering and rounding.

## Tab-local receipt

`components/lastOrder.ts` saves only one order under `bean-and-byte:last-order` in sessionStorage. Storage and parse failures are caught; loaded JSON is cast to `Order`, not schema-validated.

`app/orders/[id]/page.tsx` passes the URL id to `components/OrderConfirmation.tsx`, which loads that one saved order and requires its id to match. Missing or replaced data shows “Order not found.” There is no order GET endpoint or server receipt lookup; the page cannot recover an older order from its URL alone. If storage is unavailable, placement can succeed and clear the cart but confirmation will be missing.

`components/OrderLines.tsx` displays returned cents but resolves product names from the current catalog. Its line amounts and “10% off” tags describe bulk pricing only. The total includes any order-level promo, so line amounts need not sum to that total. Neither checkout nor confirmation adds a separate promo-discount row or applied-code label.

For three Drip Coffees and one Espresso with SAVE10, the order stores lines of 945 and 295 cents, `promoCode: "SAVE10"`, and `totalCents: 1210`. The 30-cent promo deduction is represented in the total, not allocated to the Espresso line. The saved receipt retains the order's code even though successful placement clears the provider's code. See [Data models](../reference/data-models.md). The order is a local demo receipt, not a durable financial record.

## Integration and modification points

Add request fields in `lib/orders.ts`, validate them there, and wire them through `components/Checkout.tsx` and `app/api/orders/route.ts`. Keep pricing in the shared [Pricing](pricing.md) core. Extending pickup ids requires updating both the union and `PICKUP_SLOTS` in `lib/orders.ts`.

Keep the pickup name out of events and logs. `lib/analytics.ts` produces name-free order properties, and `app/api/orders/route.ts` logs selected order facts rather than the request body.

## Scope and measurements

The table defines eight source files and one dedicated unit-test file: test/code file-count ratio 1/8 (0.125). Imported cart, pricing, analytics, logger, and telemetry modules and the shared `e2e/storefront.spec.ts` are excluded. This is a file ratio, not coverage.

`git log origin/main` over these nine paths has one unique human author, Nicolas Schmidt, after excluding `[bot]` accounts and deduplicating identities. `.github/CODEOWNERS` assigns the same person as nicolasschmidt2001.

## Key source files

| Repo-root path | Role |
| --- | --- |
| `app/checkout/page.tsx` | Checkout route |
| `app/orders/[id]/page.tsx` | Confirmation route |
| `app/api/orders/route.ts` | JSON boundary, id generation, pricing, and response |
| `lib/orders.ts` | Request and promo validation, merge, pickup labels, and order assembly |
| `components/Checkout.tsx` | Form, promo-aware preview/request, errors, and completion actions |
| `components/OrderLines.tsx` | Bulk-only line display and separate order total |
| `components/OrderConfirmation.tsx` | Matching tab-local receipt or missing state |
| `components/lastOrder.ts` | Session storage helper |
| `tests/orders.test.ts` | Validation, promo normalization/rejection, duplicate merge, order totals, and pickup labels |

`e2e/storefront.spec.ts` covers the happy-path receipt, API repricing/rejection, and SAVE10 through quantity threshold changes, checkout, and confirmation. See [Testing](../how-to-contribute/testing.md) for checks.
