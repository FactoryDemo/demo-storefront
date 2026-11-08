---
name: storefront-qa
description: Manually QA the Bean & Byte storefront end to end. Starts the dev server, adds three of one item, confirms that line is 10% off and the cart total matches, and checks GET /api/health. Use after changing pricing, cart, or UI code, or when asked to verify the app works in a browser.
---

# Storefront QA

Use this to confirm the storefront works for a real user after a change.
No login, credentials, or environment variables are needed.

## 1. Start the app

```bash
npm ci
npm run dev
```

Wait for `Ready` in the output, then open http://localhost:3000. If port
3000 is busy, see `docs/runbooks/local-development.md`.

## 2. Check the catalog

- The page heading reads "Bean & Byte".
- Each product card shows a name, a price (Drip Coffee is $3.50), and an "Add to cart" button.
- The cart panel ("Your cart") says it is empty.

## 3. Add three of one item

- Click "Add to cart" on Drip Coffee three times.
- The cart shows one Drip Coffee line with quantity 3.
- That line is 10% off: 3 × $3.50 = $10.50, so the line shows **$9.45**.

## 4. Check the cart total

- With only that line, the Total row shows **$9.45**.
- Add one Espresso ($2.95). Its line stays at full price ($2.95) and the
  total becomes **$12.40**.
- Click "−" on Drip Coffee once. Quantity 2 is below the threshold, so the
  line becomes $7.00 and the total $9.95.

## 5. Check the health endpoint

```bash
curl localhost:3000/api/health
```

Expect HTTP 200 with `{"status":"ok"}`. The dev server log shows one JSON
line with `"message":"health check"`.

## Report

State what you checked, the amounts you saw, and anything that did not
match. The automated version of steps 2, 3, and 5 is `npm run test:e2e`.
