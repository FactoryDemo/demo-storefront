# Metrics

`server/telemetry.ts` defines five OpenTelemetry instruments for API outcomes. `server/instrumentation-node.ts` registers an OTLP metric exporter only when `OTEL_EXPORTER_OTLP_ENDPOINT` is set.

## Instruments and dimensions

| Instrument | Kind | Explicit attributes |
| --- | --- | --- |
| `orders_placed` | Counter | `pickup` |
| `orders_rejected` | Counter | `reason`: `invalid_json` or `validation` |
| `order_value_cents` | Histogram | `pickup` |
| `server_errors` | Counter | `route` |
| `health_checks` | Counter | None |

The order-value histogram advises boundaries at 300, 500, 1000, 1500, 2000, 3000, 5000, and 10000 cents. No customer name or order id is a metric label.

The reader exports every 30 seconds; route completion also schedules metric `forceFlush` through `waitUntil`. Flush rejection is settled without rethrowing; see [Monitoring](index.md). No endpoint means no configured OTLP metric export.

## Resource labels and queries

The registered service is `bean-and-byte`. Resource attributes are `service.namespace` (repo slug), `service.version` (seven-character SHA), `deployment.environment.name`, and a random `service.instance.id` for each registering process/instance. Defaults from `lib/analytics.ts` and `server/release.ts` are `local`, `dev`, and `development`.

Grafana queries expect the OTLP gateway's Prometheus translation: counters such as `orders_placed_total`, histogram `_bucket`/`_sum`/`_count` series, and `job` composed from namespace/service, for example `demo-storefront/bean-and-byte` or `local/bean-and-byte`. The dashboard discovers jobs from `target_info{service_name="bean-and-byte"}`. These are integration expectations, not labels manually attached to every instrument call.

`observability/grafana/dashboard.json` contains accepted/rejected order counts, average order value, orders/rejections per five minutes, p50/p95 order value over 15-minute rates, server errors, health checks, and a CPU profile panel. Cents are divided by 100 for USD display. It defaults to the last 24 hours, refreshes every minute, and selects Prometheus data sources whose names end in `-prom`.

The profile panel is not controlled by the metric job variable: its selector is service-wide. There are no custom request-duration or export-success instruments. A zero-filled server-error panel or a no-data alert state is not proof of service health. See [Alerting](alerting.md) for actual thresholds and missing-data behavior.
