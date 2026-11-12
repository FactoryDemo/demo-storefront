# Analytics and feature flags

Active contributors: nicolasschmidt2001 (Nicolas Schmidt)

## Purpose

Optional PostHog integration records product interactions, reports browser errors, and gates a menu notice. The storefront works without a PostHog key, and flags default to off (`components/posthog.ts`, `components/MenuAnnouncement.tsx`).

## Layout and abstractions

`lib/analytics.ts` owns typed event and flag names plus pure property builders. `components/posthog.ts` owns browser I/O: lazy client loading, event capture, exception capture, and the React flag hook. `components/Analytics.tsx`, mounted in `app/layout.tsx`, starts loading after the first render and renders no UI.

`loadAnalytics` returns null without `NEXT_PUBLIC_POSTHOG_KEY` or outside the browser. Otherwise it caches a dynamic-import promise, initializes the client, and registers release properties. A failed dynamic import resolves to null. The host uses `NEXT_PUBLIC_POSTHOG_HOST` or defaults to `https://us.i.posthog.com`.

The client configuration enables exception capture, disables session recording, uses identified-only person profiles, and sends tracing headers to the current hostname (`components/posthog.ts`). Release fields use public Vercel repo, commit, and environment variables; defaults are `local`, `dev`, and `development`, and commits are shortened to seven characters (`lib/analytics.ts`).

## Event flow

| Event | Emission point | Explicit event properties |
| --- | --- | --- |
| `product_added` | `components/ProductCard.tsx` | Product id, category, unit cents, next quantity in cart |
| `cart_opened` | `components/CartProvider.tsx` | Line count, item count, computed total cents |
| `checkout_started` | `components/Checkout.tsx` | Same cart summary, once per mount after a nonempty cart loads |
| `order_placed` | `components/Checkout.tsx` | Order id, pickup id, line/item counts, server total cents |
| `order_failed` | `components/Checkout.tsx` | Error count, not error text |

Property builders use shared catalog, cart, and pricing rules (`lib/analytics.ts`). `track` waits on the loader and calls capture only when a client exists (`components/posthog.ts`). Release properties are registered globally rather than repeated at each event call site.

`app/error.tsx` reports errors with boundary `app`; `app/global-error.tsx` handles root-layout errors with boundary `root`. Both include a digest or `none` and provide a retry action. Server error capture and operational signals are separate; see [Monitoring](../how-to-monitor/index.md).

## Feature-flag behavior

`FEATURE_FLAGS.menuAnnouncement` maps to `menu-announcement` in `lib/analytics.ts`. `useFeatureFlag` starts false, subscribes to PostHog flag updates, and becomes true only when `isFeatureEnabled` returns exactly true. Cleanup unsubscribes and prevents a pending load from subscribing after unmount (`components/posthog.ts`).

`components/MenuAnnouncement.tsx` renders a Cardamom Bun notice only when the flag is true. It does not change product availability, pricing, or checkout validation. The flag-off path must remain usable.

## Integration and modification points

Add new event names or flag keys in `lib/analytics.ts`, then call `track` or `useFeatureFlag` from the UI. Keep pure property construction in `lib/analytics.ts` and service loading in `components/posthog.ts` rather than importing the SDK throughout the application.

Do not add pickup names or other personal data to event properties (`AGENTS.md`). `orderProperties` deliberately omits the name, and `tests/analytics.test.ts` checks that omission. This explicit-property rule is not a claim that every SDK-generated event or exception is scrubbed of personal data.

Public configuration belongs in the [Configuration reference](../reference/configuration.md). Keep analytics changes compatible with the key-unset path and the [Checkout](checkout.md) flow.

## Scope and measurements

The table defines six source files and one dedicated unit-test file, for a test/code file-count ratio of 1/6 (0.17 rounded). Event-emitting product/cart/checkout files, the layout, server telemetry, and shared E2E file are integration points excluded from this scope. The unit tests cover names and property builders, not browser SDK loading or flag subscriptions; the ratio is not coverage.

`git log origin/main` over these seven paths has one unique human author, Nicolas Schmidt, after excluding `[bot]` accounts and deduplicating identities. `.github/CODEOWNERS` assigns nicolasschmidt2001, the same person.

## Key source files

| Repo-root path | Role |
| --- | --- |
| `lib/analytics.ts` | Event/flag types, release fields, and property builders |
| `components/posthog.ts` | Lazy PostHog client, capture wrappers, and flag hook |
| `components/Analytics.tsx` | Post-render initialization |
| `components/MenuAnnouncement.tsx` | Flag-gated menu notice |
| `app/error.tsx` | App-render error capture and retry |
| `app/global-error.tsx` | Root-layout error capture and retry |
| `tests/analytics.test.ts` | Naming, release tags, cart/order properties, and name omission |
