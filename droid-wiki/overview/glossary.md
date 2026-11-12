# Glossary

These terms describe the storefront's code and storage model. Types are defined in `lib/types.ts` and `lib/orders.ts` unless noted.

| Term | Meaning |
| --- | --- |
| Bean & Byte | The demo coffee shop rendered by `components/Storefront.tsx`. |
| Catalog | Static `PRODUCTS` and `CATEGORIES` in `lib/products.ts`. |
| Cart item | A product id and quantity, without a price. |
| Cents | Integer amounts at the pricing and order boundaries; display formatting happens in `lib/currency.ts`. |
| Bulk discount | 10% off a line with quantity at least three, rounded once for the whole line (`lib/pricing.ts`). |
| Priced line | Product id, quantity, and `lineTotalCents`. |
| Promotion | A code and function returning cents off already bulk-priced lines. The registry is empty (`lib/promotions.ts`). |
| Pickup slot | One of `asap`, `in-15`, `in-30`, `in-45`, or `in-60`; no inventory or scheduling service is involved. |
| Order | A server-priced mock result, with id, name, pickup slot, lines, total, and placement timestamp. |
| Last order | The single order saved under `bean-and-byte:last-order` in sessionStorage (`components/lastOrder.ts`). |
| Cart hydration | Reading the saved cart before allowing persistence writes (`components/CartProvider.tsx`). |
| Feature flag | A PostHog-controlled boolean that defaults to false (`components/posthog.ts`). |
| Release properties | Repo, short commit, and environment tags produced by `lib/analytics.ts` and `server/release.ts`. |
| OTLP | OpenTelemetry's export protocol, configured in `server/instrumentation-node.ts`. |
| Pyroscope | Optional continuous profiler started by `server/instrumentation-node.ts`. |
| Finance rules | Additional CI tests supplied by a secret archive, not present in the checked-in source (`.github/workflows/ci.yml`). |

See [Architecture](architecture.md) for how these concepts connect and [Data models](../reference/data-models.md) for their fields.
