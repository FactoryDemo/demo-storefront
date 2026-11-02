# ☕ Bean & Byte — Demo Storefront

A deliberately small storefront: a Next.js catalog and cart backed by a
pure TypeScript pricing core and a fast Vitest suite.

It has just enough surface area to be worth reading — pricing rules, edge
cases, tests, CI — and nothing else to distract.

## What's inside

- `app/` — App Router pages and global styles
- `components/` — the storefront UI (catalog + cart)
- `lib/` — pure, well-tested business logic:
  - `pricing.ts` — line and cart totals with a per-line bulk discount
    (buy 3+ of one item, that line is 10% off)
  - `products.ts` — the catalog
  - `currency.ts` — cents to display strings
- `tests/` — Vitest unit tests covering the pricing rules, boundaries, and
  formatting

## Running it

```bash
npm ci
npm run dev        # http://localhost:3000
npm test           # the pricing suite
npm run typecheck  # strict TypeScript check
```

CI runs install, typecheck, and tests on every push and pull request.

## The pricing rule

All money is integer cents. A line of 3 or more identical items gets 10%
off that line, rounded to the nearest cent. Mixed carts can hold
discounted and undiscounted lines at once — `tests/pricing.test.ts` pins
the behavior down.
