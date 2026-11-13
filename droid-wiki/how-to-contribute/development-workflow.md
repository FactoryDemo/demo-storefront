# Development workflow

Local checks precede a PR; CI and automated review then run independently. These are repository instructions and workflow behavior, not a claim about configured branch-protection requirements.

## Local change to PR

`AGENTS.md` asks for branches from `main` named `feature/<slug>`, lowercase imperative commit subjects without a prefix, and a PR explaining what, why, and test coverage. Example subject: `apply bulk discount per cart line, not per cart`.

Use `npm ci`, implement the change with matching `tests/` coverage, then run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run format:check`. Add browser verification when UI behavior changes; see [Testing](testing.md).

Implement from the request and current code, not an earlier attempt. `AGENTS.md` prohibits reading, reusing, or reverting reverted commits, closed or merged PR implementations, and `Rehearsal-*` commits. Do not run `git show`, `git log -p`, or `git revert` on those attempts. See [Patterns and conventions](patterns-and-conventions.md#current-code-implementations).

Opening the PR ends the task. Do not run CI watch/poll commands afterward. If explicitly assigned a failing check, read its results, push the correction to the same PR, and stop again (`AGENTS.md`).

## Checks and review

| Workflow source | Trigger and behavior |
| --- | --- |
| `.github/workflows/ci.yml` | Main pushes and selected PR events: typecheck, unit tests, then secret-injected Finance tests |
| `.github/workflows/lint.yml` | Main pushes and PRs: lint, formatting, `agents:check` |
| `.github/workflows/quality.yml` | Main pushes and PRs: coverage thresholds, retries, JUnit, summary and artifacts |
| `.github/workflows/e2e.yml` | Main pushes and PRs: Chromium against the production-build test server |
| `.github/workflows/analysis.yml` | Main pushes and PRs: advisory analysis, generated API docs, timed build and bundle-size report |
| `.github/workflows/droid.yml` | Selected PR events: deep code and security review, alongside CI rather than waiting for it |
| `.github/workflows/droid-wiki-refresh.yml` | Main pushes except wiki-only changes: read-only GitHub-token wiki generation, then separate write-scoped rolling-PR publication and protected squash auto-merge request |

Auto review skips draft PRs and PRs authored by `dependabot[bot]`; newer runs cancel older reviews for the same PR. It uses `Factory-AI/droid-action@main` and `FACTORY_API_KEY`, with `allowed_bots: factory-droid`. This automation is not evidence that a security audit has been completed.

`.github/workflows/droid-tag.yml` runs Droid only when `@droid` occurs in a newly created PR conversation comment or PR review comment. Ordinary issue comments do not qualify; comments without the mention may start a workflow whose job skips.

The Analysis summary says “report-only,” but its `npm ci` and timed `npm run build` are not `continue-on-error`; build failure can fail the job. Knip, duplication, TODO, TypeDoc, and size steps are advisory.

## Delivery and optional automation

`.github/workflows/droid-wiki-refresh.yml` restores incremental wiki state from `factory/droid-wiki`, updates a documentation PR against the default branch, and requests squash auto-merge when a PR number is returned. It respects required checks and reviews; auto-merge failure produces a warning and leaves the PR for manual handling. Wiki-only pushes are ignored to prevent refresh loops. It does not deploy the app. See [Wiki refresh](wiki-refresh.md) for token permissions, artifact handoff, and the built-in-token limitation on triggering PR checks.

[Deployment](../deployment.md) covers Vercel status records and tag releases. `.github/workflows/observability.yml` syncs checked-in Grafana configuration; `.github/workflows/error-issues.yml` converts optional service signals into issues; `.github/workflows/dast.yml` runs scheduled ZAP baseline scanning. These are distinct from the PR unit-test gate. See [Alerting](../how-to-monitor/alerting.md) and [Security](../security.md).
