# Logging

`server/logger.ts` writes structured JSON lines to process streams. `docs/runbooks/observability.md` directs deployed investigation to Vercel function logs; the code does not ship logs to Loki.

## Format and levels

`createLogger` accepts a minimum level, writer, and clock for testing. The shared logger defaults to `info`; debug is suppressed, info goes to stdout, and warn/error go to stderr. There is no `LOG_LEVEL` environment-variable reader.

Each entry has protected `timestamp`, `level`, and `message` fields plus caller fields. Additional fields cannot overwrite the protected keys. JSON serialization escapes multiline messages into a single log line. Dates become ISO strings, BigInts become strings, and circular object references become `[Circular]`.

| Emission path | Message and useful fields |
| --- | --- |
| `app/api/health/route.ts` | `health check`: route, rounded uptime seconds |
| `app/api/orders/route.ts` | `order rejected`: invalid-json reason or validation errors |
| `app/api/orders/route.ts` | `order placed`: route, order id, pickup, line count, total cents |
| `server/telemetry.ts` | `unhandled error`: route, method, Error serialization |
| `server/instrumentation-node.ts` | `profiling unavailable`: native profiler initialization failure |

Order placement intentionally does not log the pickup name or raw body.

## Redaction limits

Sensitive keys are split by camelCase and punctuation; adjacent word pairs and simple plural variants are considered. Matches include password/passwd, secret, token, authorization, cookie, email, card, cvv, ssn, and apikey. Nested objects/arrays are copied with matching values replaced by `[REDACTED]`; `accessToken`, `user_email`, and `x-api-key` match while `discard` does not.

This is key-based redaction only. A field named `name`, arbitrary text in a message, and Error `name`/`message`/`stack` are not scrubbed. Error objects are serialized directly to those three fields. Do not log raw payloads, headers, credentials, or personal data simply because a redactor exists. PostHog exception transmission is a separate path and does not pass through this logger.

`tests/logger.test.ts` exercises formatting, level filtering, protected keys, nested redaction, and special values. See [Security](../security.md) and [Tracing](tracing.md) for privacy and correlation boundaries.
