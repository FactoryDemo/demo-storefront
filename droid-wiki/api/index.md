# HTTP API

The app has two force-dynamic JSON endpoints: health and mock order placement. There is no authentication, payment, database, or order-read API (`app/api/health/route.ts`, `app/api/orders/route.ts`).

## GET /api/health

Returns HTTP 200 with `{"status":"ok"}`. The handler logs uptime and increments health checks; it does not probe external services. `playwright.config.ts` and `.github/workflows/dast.yml` use it for readiness.

## POST /api/orders

Send a JSON object:

```json
{
  "name": "Ada",
  "pickup": "in-15",
  "items": [{ "productId": "drip", "quantity": 3 }]
}
```

`lib/orders.ts` validates unknown input:

- `name`: nonblank string, trimmed, at most 60 characters after trimming.
- `pickup`: `asap`, `in-15`, `in-30`, `in-45`, or `in-60`.
- `items`: nonempty array; each product must exist in `lib/products.ts` and each quantity must be an integer from 1 to 99.

Errors across fields are collected. Duplicate products are merged **after** per-line validation, so merged quantity can exceed 99. Unknown extra fields, including submitted totals, are not used to price the order. No promo field is handled.

### Success

HTTP 201 returns the order directly:

```json
{
  "id": "BB-ABC123",
  "name": "Ada",
  "pickup": "in-15",
  "lines": [{ "productId": "drip", "quantity": 3, "lineTotalCents": 945 }],
  "totalCents": 945,
  "placedAt": "2026-01-02T03:04:05.000Z"
}
```

The id is `BB-` plus six uppercase UUID characters; the timestamp is server-generated ISO text. The server prices from its catalog using `lib/pricing.ts`, not browser totals. The sample id/date are illustrative, not stable identifiers.

### Failure

| Status | Body |
| --- | --- |
| 400, malformed JSON | `{"errors":["Request body must be JSON."]}` |
| 400, invalid order | `{"errors":[...]}` with validation messages |
| 500, unexpected exception | `{"errors":["Something went wrong on our side. Try again."]}` |

There is no idempotency key, durable write, inventory reservation, rate limiter, or application-defined request-size cap in these handlers. Repeated successful submissions generate fresh mock ids. Browser confirmation saves only the returned last order in tab-local storage; `/orders/[id]` is a UI route, not a retrieval API.

Both handlers use `withTelemetry` in `server/telemetry.ts` for error reporting and scheduled flushing. See [Checkout](../features/checkout.md), [Data models](../reference/data-models.md), and [Security](../security.md).
