# Tracing and profiles

Next instrumentation registers OpenTelemetry on startup, and optionally starts a native CPU profiler. `instrumentation.ts`, `server/instrumentation-node.ts`, and `next.config.mjs` are the integration points.

## Trace initialization

For `NEXT_RUNTIME=nodejs`, `instrumentation.ts` dynamically imports Node setup. Other runtimes call `registerOTel` with the service name only. Node registration adds service namespace, short version, environment, and random instance id; OTLP export uses the configured endpoint/headers.

The code relies on `@vercel/otel` and framework instrumentation; there are no custom business-operation spans in the application. The runbook points to Grafana Tempo Explore for service `bean-and-byte`.

## Error correlation

`components/posthog.ts` configures PostHog tracing headers for the current hostname. On an unexpected API exception, `server/telemetry.ts` reads `x-posthog-distinct-id` and `x-posthog-session-id` to associate the exception with browser context, and reads the active OpenTelemetry span's trace id.

The captured PostHog exception includes route, method, optional `traceId`, session id, and release properties. A trace id is available only if an active span exists; ordinary structured error logs do not explicitly include it. PostHog correlation headers are not themselves a guarantee of distributed OpenTelemetry parent propagation.

Copy a present exception `traceId` into Tempo for the matching environment/time range. Route-finalization flushing explicitly covers metrics and PostHog, not trace-provider flushing; exporter lifecycle belongs to the registered integration. See [Monitoring](index.md).

## CPU profiles

`PYROSCOPE_SERVER_ADDRESS` enables lazy `@pyroscope/nodejs` loading. Configuration uses service app name, optional basic-auth credentials, and tags `namespace`, `environment`, and `version`. Initialization failure is caught and logged as `profiling unavailable`; the app continues.

`next.config.mjs` externalizes native profiler dependencies and explicitly includes Linux x64 pprof binaries in output tracing. The dashboard profile panel uses datasource UID `grafanacloud-profiles`, profile type `process_cpu:cpu:nanoseconds:cpu:nanoseconds`, and selector `{service_name="bean-and-byte"}` (`observability/grafana/dashboard.json`). It does not apply the dashboard's metrics deployment selector.

No profile or trace is required for local checkout. See [Configuration](../reference/configuration.md) for optional credentials and [Logging](logging.md) for the limits of sensitive-data redaction.
