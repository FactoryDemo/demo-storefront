# Security boundaries

This is an unauthenticated demo with mock orders, not a payment or account system. The following describes implemented boundaries and limitations, not a security audit or production-readiness certification.

## Untrusted input and pricing

`app/api/orders/route.ts` parses JSON as unknown and uses `validateOrderRequest` in `lib/orders.ts`. Known products, pickup ids, trimmed name length, and per-input-line quantities are checked before duplicate merge and server-side pricing. Client totals are not authoritative.

The 99-unit limit is not a total-order cap: duplicate valid lines can merge above 99. There is no handler-level maximum line count, request-size limit, rate limiter, authentication, or idempotency. Hosting/platform limits are not defined by this source. See [API](api/index.md).

## Browser storage

`lib/cart.ts` filters stored cart entries but does not cap quantities or merge duplicates. `components/CartProvider.tsx` does not catch storage failures. `components/lastOrder.ts` catches read/write/parse errors but casts parsed JSON to `Order` without schema validation.

The last receipt includes the pickup name in sessionStorage; it is tab-local, editable browser data, not a trusted order database. There is no server-side order history. Use synthetic names when testing.

## Secrets and telemetry privacy

`AGENTS.md` prohibits committing environment files or secrets. `.gitignore` excludes `.env*` except the placeholder `.env.example`. The PostHog project key is public by design; personal API keys, Grafana tokens, OTLP authorization, and profiler credentials must not be placed in `NEXT_PUBLIC_*` variables.

`lib/analytics.ts` intentionally omits the pickup name from order event properties. The order route logs selected facts, not the request body. `server/logger.ts` recursively redacts sensitive **keys** (password, token, cookie, email, card and related forms). It does not scrub arbitrary strings, `name`, log messages, or Error messages/stacks. It is not a general PII filter.

`components/posthog.ts` disables session recording, enables exception capture, uses identified-only person profiles, and sends correlation headers to the current hostname. This is not a guarantee that SDK-generated events, exceptions, URLs, or stacks cannot contain personal data. `server/telemetry.ts` sends exceptions directly to PostHog, outside logger redaction.

## Automation and supply chain

`.github/workflows/ci.yml` extracts and executes Finance tests supplied by a trusted secret archive; those contents are not reviewable from the checked-in suite. Droid review and mention workflows use a secret key and write-capable permissions; `@droid` invocation is limited to PR comments, not ordinary issues. The Factory action tracks `main`, rather than an immutable commit.

`.github/workflows/droid-wiki-refresh.yml` separates generation (`GITHUB_TOKEN` with `contents: read`) from publication (`contents: write`, `pull-requests: write`). The generator reads source and restored rolling-branch documentation and receives `FACTORY_API_KEY`; read-only GitHub permissions do not sandbox the CLI or prevent external writes such as enabled Factory cloud upload. Its installer executes the remote Factory CLI install script.

The publisher uses the narrowly scoped optional `FACTORY_WIKI_PR_TOKEN`, falling back to its built-in token; fallback-created PRs do not trigger other workflows. The PR action is pinned to `5f6978faf089d4d20b00c7766989d076bb2fc7f1` (v8.1.1). With a returned PR number, the same token requests squash auto-merge through GitHub CLI; this respects required checks, reviews, and branch protection, without an admin bypass. The handoff includes hidden wiki metadata, excludes video/images, and expires after one day. Publication and auto-merge failures are annotated rather than made fatal, so workflow success alone proves neither that the PR was updated nor that it merged. Wiki-only pushes are excluded to prevent refresh loops. See [Wiki refresh](how-to-contribute/wiki-refresh.md) and [Configuration](reference/configuration.md).

`.github/workflows/dast.yml` builds locally and runs ZAP baseline weekly on Monday at 06:00 UTC or manually, with `fail_action: false` and issue writing disabled. This is advisory scanning; install/build/start failures can still fail the workflow. Automated deep/security review runs independently of CI; its configuration is not proof of completed review.

Dependabot updates and compatibility exclusions are described in [Dependencies](reference/dependencies.md).

## Recommendations, not implemented policy

Before real order intake, evaluate authenticated/abuse-resistant access as appropriate, aggregate quantity/body limits, validated receipt storage, durable persistence and idempotency, telemetry data minimization, and immutable action pinning. These are suggested hardening areas, not current features or mandated repository policies. See [Logging](how-to-monitor/logging.md) for redaction details.
