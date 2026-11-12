# Reference

These pages describe the current configuration, shared types, and declared dependencies rather than introducing additional subsystems.

| Reference | Source of truth |
| --- | --- |
| [Configuration](configuration.md) | `.env.example`, `components/posthog.ts`, `server/`, `.github/workflows/` |
| [Data models](data-models.md) | `lib/types.ts`, `lib/orders.ts`, `lib/promotions.ts`, `lib/analytics.ts` |
| [Dependencies](dependencies.md) | `package.json`, `package-lock.json`, `.github/dependabot.yml` |
| [HTTP API](../api/index.md) | `app/api/health/route.ts`, `app/api/orders/route.ts` |
| [Tooling](../how-to-contribute/tooling.md) | `package.json`, root tool configs, `scripts/` |

Start with [Architecture](../overview/architecture.md) for boundaries, or [Features](../features/index.md) for behavior. There is no database schema, account model, or payment API to configure.
