# Data models

The domain uses plain TypeScript objects, not database entities. Cents are numbers with integer-valued prices/totals at validated boundaries; currency formatting is a presentation operation (`lib/types.ts`, `lib/orders.ts`, `lib/currency.ts`).

## Catalog and cart

| Type in `lib/types.ts` | Fields |
| --- | --- |
| `ProductCategory` | `"hot" \| "cold" \| "beans" \| "bakery"` |
| `Category` | `id: ProductCategory`, `name: string`, `description: string` |
| `Product` | `id`, `name`, `description`, `image`: strings; `priceCents: number`; `category: ProductCategory` |
| `CartItem` | `productId: string`, `quantity: number` |
| `PricedLine` | `productId: string`, `quantity: number`, `lineTotalCents: number` |
| `Cart` | `items: CartItem[]` |

Catalog ids link cart items and priced lines to `lib/products.ts`. Product names/prices are not embedded in cart items; priced lines snapshot only the line total. Display names resolve from the current catalog.

`bean-and-byte:cart` in localStorage holds a `CartItem[]`, not the `Cart` wrapper (`components/CartProvider.tsx`). Parsing filters unknown ids and nonpositive/noninteger quantities but does not merge duplicates or apply 99 as a cap (`lib/cart.ts`).

## Orders

`lib/orders.ts` declares:

```ts
type PickupSlotId = "asap" | "in-15" | "in-30" | "in-45" | "in-60";
type PickupSlot = { id: PickupSlotId; label: string };
type OrderRequest = { name: string; pickup: PickupSlotId; items: CartItem[] };
type Order = {
  id: string;
  name: string;
  pickup: PickupSlotId;
  lines: PricedLine[];
  totalCents: number;
  placedAt: string;
};
type OrderValidation =
  | { ok: true; request: OrderRequest }
  | { ok: false; errors: string[] };
```

Validation trims names, enforces 60 characters and per-raw-line integer quantities 1–99, then merges repeated products. `buildOrder` accepts a validated request plus caller-supplied id and Date, calculates catalog prices, and writes an ISO timestamp.

Only one `Order` is saved under `bean-and-byte:last-order` in sessionStorage. Loaded JSON is cast, not runtime-schema-validated (`components/lastOrder.ts`). There is no database relationship, durable receipt, payment status, or order GET resource; see [Checkout](../features/checkout.md) and [API](../api/index.md).

## Promotions, analytics and operational types

- `Promotion` in `lib/promotions.ts`: `code: string`, `description: string`, `discountCents(lines: PricedLine[]): number`. The registry is empty; checkout does not accept a promo code.
- `AnalyticsEvent` and `FeatureFlag` in `lib/analytics.ts` are unions derived from constant registries. `AnalyticsProperties` is `Record<string, string | number | boolean>`.
- `ReleaseInfo` in `lib/analytics.ts` has optional strings `repo?`, `commitSha?`, `environment?`; builders supply local defaults.
- `RejectionReason` in `server/telemetry.ts` is `"invalid_json" | "validation"`.
- `LogLevel`, `LogFields`, `LogWriter`, `Logger`, and `LoggerOptions` in `server/logger.ts` define structured logging; options `level?`, `write?`, and `now?` support controlled output and tests.

`formatCurrency(cents)` in `lib/currency.ts` divides by 100 and renders en-US USD with two decimals. `lib/pricing.ts` applies the fractional bulk-discount rate and rounds the whole line once; the implementation is not entirely integer arithmetic. See [Pricing](../features/pricing.md).
