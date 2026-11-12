# Configuration

The storefront runs with all telemetry variables unset. `.env.example` contains optional names and placeholders only; copying its placeholder values unchanged can enable attempted exports rather than configure a working service.

## Application variables

| Variable | Consumer and meaning |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | Browser/server PostHog project key; absent disables clients; public by design |
| `NEXT_PUBLIC_POSTHOG_HOST` | Browser ingestion host defaults to `https://us.i.posthog.com`; server passes the optional value to its SDK |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Enables Node OTLP metric reader and configures export destination |
| `OTEL_EXPORTER_OTLP_HEADERS` | OTLP authorization/header string consumed by exporters; keep private |
| `PYROSCOPE_SERVER_ADDRESS` | Enables optional profiler |
| `PYROSCOPE_BASIC_AUTH_USER` | Optional profiler auth username |
| `PYROSCOPE_BASIC_AUTH_PASSWORD` | Optional profiler auth password/token; private |

Consumers are `components/posthog.ts`, `server/telemetry.ts`, and `server/instrumentation-node.ts`. Public variables are browser-bundled at build time; non-public credentials must never use the public prefix. No environment variable sets the shared logger level.

`server/release.ts` reads `VERCEL_GIT_REPO_SLUG`, `VERCEL_GIT_COMMIT_SHA`, and `VERCEL_ENV`. Browser release metadata reads corresponding `NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG`, `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`, and `NEXT_PUBLIC_VERCEL_ENV`. `lib/analytics.ts` falls back to `local`, `dev`, and `development`; SHA is shortened to seven characters. `NEXT_RUNTIME` selects instrumentation registration, and `CI` changes Playwright behavior.

## Workflow and script inputs

| Name | Use |
| --- | --- |
| `FINANCE_RULES` | CI secret: base64 gzipped test archive; required by `.github/workflows/ci.yml` |
| `FACTORY_API_KEY` | Droid review and PR-comment action secret; also passed to `/wiki` generation in `.github/workflows/droid-wiki-refresh.yml` |
| `FACTORY_WIKI_PR_TOKEN` | Optional Actions secret for wiki PR publication and squash auto-merge, scoped to this repository's contents/write and pull-requests/write permissions; falls back to `github.token` |
| `WIKI_BRANCH` | Fixed workflow env value `factory/droid-wiki` in `.github/workflows/droid-wiki-refresh.yml`, used for previous-wiki restoration and rolling PR publication |
| `GRAFANA_URL`, `GRAFANA_SERVICE_ACCOUNT_TOKEN` | Optional Grafana sync, deploy annotations, alert issue polling |
| `POSTHOG_PERSONAL_API_KEY` | Optional exception-query/deploy-annotation credential; not the public project key |
| `POSTHOG_PROJECT_ID` | Actions variable for PostHog project/query target |
| `POSTHOG_HOST` | Actions/script API host, defaults to `https://us.posthog.com`, distinct from ingestion host |
| `PRODUCTION_URL` | Actions variable overriding successful deployment environment link |
| `LOOKBACK_HOURS` | Exception issue script lookback, defaults 24, clamped 1–168; dispatch input is `lookback_hours` |
| `GITHUB_TOKEN`, `GITHUB_REPOSITORY` | Runner-provided issue API credential and owner/repo |
| `GH_TOKEN` | GitHub CLI credential in release/deploy steps and the wiki auto-merge step; the latter uses `FACTORY_WIKI_PR_TOKEN` or `github.token` |
| `PR_NUMBER` | Step-local wiki auto-merge input from the PR action's `pull-request-number` output; not an app variable or repository secret |

Deploy steps also derive `SHA` and `TARGET_URL` from the status event. `GITHUB_REF_NAME` supplies the release tag; `GITHUB_STEP_SUMMARY` and `RUNNER_TEMP` hold workflow reports/intermediate files. These runner variables are not app setup requirements.

The wiki workflow's built-in GitHub token is read-only for generation and write-scoped only in the separate publish job. PRs opened with its `github.token` fallback do not trigger other workflows, so required checks will not run on that PR. `FACTORY_API_KEY` is a generation secret, not an app variable; `WIKI_BRANCH` is declared in the workflow, not a required repository secret. See [Wiki refresh](../how-to-contribute/wiki-refresh.md) for artifact retention, hidden metadata, and publication recovery.

The auto-merge request in `.github/workflows/droid-wiki-refresh.yml` requires repository settings that permit auto-merge and squash merging, plus a token allowed to merge the PR. Required checks and reviews still apply. If the request fails, the workflow emits a warning and the PR can be reviewed and merged manually. Pushes changing only `droid-wiki/**` do not trigger another refresh.

`.env.example` lists Grafana credentials and the PostHog personal key for scripts/workflows, but does not enumerate every Actions or platform variable above. Do not assume standalone Node scripts load `.env.local`: these `.mjs` scripts read `process.env` directly.

## Repository config

`tsconfig.json` enables strict no-emit TypeScript; `next.config.mjs` enables instrumentation and native profiling packaging. `vitest.config.ts`, `playwright.config.ts`, `.eslintrc.json`, `.prettierrc`, `.prettierignore`, `knip.json`, `.jscpd.json`, `.size-limit.json`, `typedoc.json`, and `lint-staged.config.mjs` configure checks described in [Tooling](../how-to-contribute/tooling.md).

Never print or commit real credentials. See [Security](../security.md), [Deployment](../deployment.md), and [Monitoring](../how-to-monitor/index.md).
