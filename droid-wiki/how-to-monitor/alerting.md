# Alerting and issue sync

Checked-in Grafana rules define two API-outcome alerts. Separate scheduled scripts turn current Grafana alerts and recent PostHog exceptions into GitHub issues; this is polling, not a real-time pager (`observability/grafana/alert-rules.json`, `.github/workflows/error-issues.yml`).

## Exact rules

The `bean-and-byte` rule group evaluates every 60 seconds:

| Rule UID | Query window and threshold | Pending hold | Severity |
| --- | --- | --- | --- |
| `bb-server-errors` | `sum by (job) (increase(server_errors_total{job=~".+/bean-and-byte"}[5m])) > 0` | `0s` | critical |
| `bb-order-rejections` | `sum by (job) (increase(orders_rejected_total{job=~".+/bean-and-byte"}[15m])) > 25` | `5m` | warning |

Both have `noDataState: OK` and `execErrState: Error`. The query lookback metadata is 900 seconds, but the server-error expression itself uses five minutes. Rules group by job, not environment; they do not exclude preview/local namespaces that reach the shared backend. Missing metrics therefore do not trigger an outage alert.

## Applying configuration

`.github/workflows/observability.yml` runs on main changes under `observability/**` or to `scripts/grafana-sync.mjs`, plus manual dispatch. The script skips if either Grafana URL or token is missing. Otherwise it creates the folder if absent, overwrites the dashboard by UID, finds a Prometheus datasource with a name ending in `-prom`, resolves `__PROMETHEUS__`, and PUTs the rule group. It sets `x-disable-provenance: true` so rules remain UI-editable; later sync can overwrite UI edits.

This writes to Grafana; it is not a local check. No contact points, notification policies, email/Slack routes, or uptime alerts are provisioned by these files.

## Polling into GitHub issues

`.github/workflows/error-issues.yml` runs every 30 minutes or manually, serializing runs under one concurrency group. It uses `GITHUB_TOKEN` with issue write permission:

- `scripts/posthog-error-issues.mjs` skips without key/project id; otherwise queries up to 20 exception issue groups for this sanitized repo slug in production or preview. `LOOKBACK_HOURS` defaults to 24 and is clamped to 1–168. It creates `error-tracking` labels/issues with bug metadata, recent version, and up to six stack frames.
- `scripts/grafana-alert-issues.mjs` skips without Grafana URL/token; otherwise selects state `Alerting`, service `bean-and-byte`, and job prefix matching the repo slug. It requests `alert` plus a severity label. The script explicitly ensures only `alert`; it does not create severity labels itself.

`scripts/lib/github-issues.mjs` searches labeled open/closed issues for hidden markers, up to ten pages of 100 issues. PostHog markers use exception issue id; Grafana markers use alert name and job. Existing open issues are left unchanged; closed issues reopen only when last-seen/active-at is later than closure. The scripts do not automatically close resolved issues.

PostHog issue bodies copy exception messages, URLs and frames into GitHub; logger redaction is not applied. Treat those messages as potentially sensitive. For triage, compare version to deploy markers, inspect PostHog and [Logs](logging.md), and follow a [Trace](tracing.md) when present. Thresholds and issue timing are not response-time commitments.
