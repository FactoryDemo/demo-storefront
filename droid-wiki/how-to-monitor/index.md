# Monitoring

Server JSON logs work without service credentials. Optional PostHog, OTLP, and Pyroscope integrations add events/errors, metrics/traces, and profiles (`server/logger.ts`, `server/telemetry.ts`, `server/instrumentation-node.ts`).

## Signal map

| Signal | Implementation and destination | Guide |
| --- | --- | --- |
| JSON logs | stdout/stderr; Vercel function logs when hosted there | [Logging](logging.md) |
| Order/error/health instruments | OpenTelemetry to configured OTLP endpoint; Grafana Prometheus dashboard | [Metrics](metrics.md) |
| Request traces | Vercel OpenTelemetry registration; Grafana Tempo in the runbook | [Tracing](tracing.md) |
| CPU profiles | Optional Pyroscope native profiler | [Tracing and profiles](tracing.md) |
| Browser events, flags and exceptions | Lazy PostHog browser client | [Analytics](../features/analytics.md) |
| Unexpected API exceptions | PostHog server client plus logs and counter | [Alerting](alerting.md) |
| Deploy markers | Successful Vercel status triggers GitHub record and optional annotations | [Deployment](../deployment.md) |

`docs/runbooks/observability.md` describes destination UIs. This documentation does not verify that remote accounts, dashboards, notification routes, or secrets are currently configured.

## Request completion and flushing

Both API routes use `withTelemetry` in `server/telemetry.ts`. It returns successful/expected-error responses unchanged; unexpected exceptions increment `server_errors`, log, and call PostHog exception capture before returning a generic 500.

The `finally` block always calls `waitUntil(flushTelemetry())`, scheduling background completion before a Vercel function freezes. `flushTelemetry` awaits `Promise.allSettled` over optional metric-provider `forceFlush` and the initialized PostHog client's `flush`. It does not explicitly flush traces or Pyroscope, and settled flush failures are not rethrown. This is best-effort export, not a durable delivery guarantee.

## Triage order

1. Read the alert/error issue's repo, environment, version, and time range.
2. Compare deploy annotations and GitHub deployment history.
3. Inspect route logs and PostHog stack/session; follow any active `traceId` into Tempo.
4. For CPU-heavy behavior, inspect the configured profile panel.

Health success only means the health handler ran. There is no checked-in uptime scheduler, latency SLO, or exporter-health alert. See [Configuration](../reference/configuration.md) before enabling local exports.
