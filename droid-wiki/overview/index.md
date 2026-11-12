# Bean & Byte

Bean & Byte is a demo coffee storefront for exercising agent-driven development. It uses Next.js 14 App Router, React 18, and a pure TypeScript pricing core. Orders are pretend: there is no payment processor, database, or server-side order history (`package.json`, `lib/orders.ts`, `app/api/orders/route.ts`).

## What you can do

Browse 13 products in four categories, add quantities to a saved cart, and place a mock pickup order. The menu is defined in `lib/products.ts`; checkout collects a pickup name and time in `components/Checkout.tsx`.

Buying at least three of one product discounts that line by 10%. Three Drip Coffees cost $9.45; adding one Espresso makes $12.40. The server calculates prices again rather than trusting the browser (`lib/pricing.ts`, `app/api/orders/route.ts`).

## Start reading

- [Architecture](architecture.md): component boundaries and request flow.
- [Getting started](getting-started.md): local setup and checks.
- [Features](../features/index.md): catalog, cart, pricing, checkout, and analytics.
- [Contribution guide](../how-to-contribute/index.md): workflow and quality gates.
- [Monitoring](../how-to-monitor/index.md): logs, metrics, traces, profiles, and alerts.
- [Reference](../reference/index.md): configuration, types, and dependencies.

## Scope

The cart persists in localStorage, while only the last order persists in sessionStorage in the current tab (`components/CartProvider.tsx`, `components/lastOrder.ts`). An order URL is not a server-backed receipt lookup.

Optional PostHog and Grafana Cloud integrations report analytics and telemetry when configured. The storefront needs neither service for local use (`components/posthog.ts`, `server/instrumentation-node.ts`).
