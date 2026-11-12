# Deployment and releases

Vercel deployment and GitHub release creation are separate flows. The repository records successful production deploys; its Deploy workflow does not build or publish the application itself (`.github/workflows/deploy.yml`).

## Build and hosting

Locally, use `npm ci`, `npm run build`, then `npm run start`. `next.config.mjs` enables instrumentation and keeps the native Pyroscope/pprof packages external, explicitly tracing Linux x64 profiler binaries and supporting files into server output.

The Deploy workflow describes Vercel's GitHub app as building/deploying main pushes. It listens for commit statuses, and records only context `Vercel`, state `success`, with a branch named `main`. It has per-SHA concurrency, not a persistent deduplication lookup.

For a matching status it:

1. Creates a GitHub deployment for the SHA in environment `Production`, then marks it successful.
2. Uses `PRODUCTION_URL` for the environment link, falling back to the status target URL.
3. Posts a Grafana deploy annotation when `GRAFANA_URL` is set, tagged with `deploy`, service, repo slug, and short SHA.
4. Posts a PostHog project annotation when its personal key is set. This step is `continue-on-error`; missing annotation scope must not obscure the existing deploy record.

Grafana annotation failure is not similarly marked `continue-on-error`. Missing optional markers do not mean the earlier Vercel deployment failed. `docs/runbooks/observability.md` recommends Vercel dashboard rollback when a deploy causes an incident; no rollback automation is implemented here.

## Tag releases

`.github/workflows/release.yml` runs on pushed tags matching `v*`: install, unit tests, production build, then `gh release create` with generated notes. It does not run Finance tests, coverage, lint, typecheck as a separate command, or E2E. It does not publish an npm package (`package.json` is private).

`.github/release.yml` excludes PRs labeled `skip-changelog` and categorizes notes into Features, Fixes, Dependencies, and Other changes. Creating/pushing tags is a consequential publishing action, not part of ordinary local verification.

## Operations configuration

Application telemetry variables belong in the hosting environment; browser `NEXT_PUBLIC_*` values are bundled at build time. Workflow service credentials and variables are separate; see [Configuration](reference/configuration.md). `.github/workflows/observability.yml` applies dashboard/rule changes on matching main pushes or manual dispatch, and `.github/workflows/error-issues.yml` polls optional services every 30 minutes. Neither stores customer orders.

See [Development workflow](how-to-contribute/development-workflow.md) for PR checks and [Monitoring](how-to-monitor/index.md) for deploy correlation.

## Documentation publication

`.github/workflows/droid-wiki-refresh.yml` runs on main pushes except wiki-only changes, generates the wiki with a read-only GitHub token, and hands a one-day artifact to a separate write-scoped job that updates `factory/droid-wiki` and its PR. When a PR number is returned, the publisher requests squash auto-merge subject to required checks and reviews; failure produces a warning and leaves manual review and merge available. Merging that PR updates versioned `droid-wiki/` without triggering another refresh; it is neither an app deployment nor a tag release. Optional Factory cloud upload during generation and GitHub's separate wiki destination are distinct from this PR flow. See [Wiki refresh](how-to-contribute/wiki-refresh.md) for destinations, incremental state, and publication failures.
