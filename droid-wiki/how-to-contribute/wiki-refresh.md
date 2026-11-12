# Wiki refresh

`.github/workflows/droid-wiki-refresh.yml` generates documentation after pushes to `main` that change files outside `droid-wiki/`, then opens or updates one rolling PR and requests squash auto-merge. It does not build or deploy the storefront.

## Generation and incremental state

The workflow uses repository-wide concurrency group `droid-wiki-refresh` with `cancel-in-progress: false`: the active run is not cancelled, and newer pushes replace the pending run rather than generating wikis in parallel.

The push trigger uses `paths-ignore: ["droid-wiki/**"]`. A push containing only generated wiki changes does not start another refresh, so merging the documentation PR cannot create a refresh loop. A push that also changes files outside that directory still qualifies.

The `wiki-refresh` job:

1. Checks out the triggering revision with `fetch-depth: 0`, retaining history for comparison with the previous wiki's recorded commit.
2. Fetches `factory/droid-wiki` and restores only `droid-wiki/` from that rolling branch without switching the source checkout. This preserves incremental state even before the wiki PR is merged. If the fetch or restore fails, the step logs that there is no previous wiki; a first run generates the full wiki.
3. Installs Factory Droid using `curl -fsSL https://app.factory.ai/cli | sh`, then runs `droid exec --auto high "/wiki"` with the `FACTORY_API_KEY` Actions secret. There is no npm install step in this workflow.
4. Uploads a `droid-wiki` artifact with one-day retention. Hidden files are included so `droid-wiki/.wiki-meta.json` survives; `droid-wiki/video/**` and `droid-wiki/images/**` are excluded. Missing artifact files fail the step.

The generation job inherits only `contents: read` for its built-in `GITHUB_TOKEN`. That limits this GitHub credential, not every possible side effect of the CLI: it also receives a Factory credential, and cloud upload can occur when wiki cloud sync is enabled. See [Security](../security.md).

## Separate PR publication

The dependent `wiki-publish` job checks out the repository, downloads the artifact into `droid-wiki/`, and gives its built-in token `contents: write` and `pull-requests: write`. Both artifact handoff and publication exclude PR event contexts; the configured trigger is currently only a main push.

Publication uses `peter-evans/create-pull-request` pinned to `5f6978faf089d4d20b00c7766989d076bb2fc7f1` (v8.1.1). It updates the fixed `factory/droid-wiki` branch against the repository's default branch, with commit/title `docs: refresh wiki` and label `droid-wiki`. Only `droid-wiki/**` is selected, with the same video/image exclusions. Merging the PR updates the versioned wiki on the default branch.

When the PR action returns a nonempty `pull-request-number`, the publisher runs `gh pr merge "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --squash --auto`. This requests auto-merge when repository requirements are met; it does not bypass required checks, reviews, or branch protection. The step uses the same token as PR creation. No PR number means no auto-merge attempt.

The action selects `FACTORY_WIKI_PR_TOKEN` when present, otherwise `github.token`. The optional secret should have only repository `contents: write` and `pull-requests: write` access. PRs opened with the built-in-token fallback do not trigger other workflows, so required checks will not run on that wiki PR. Token scope alone also cannot override repository branch rules or PR-creation restrictions. See [Configuration](../reference/configuration.md).

## Failures and recovery

The PR action and auto-merge step each use `continue-on-error: true`, with separate warning annotations. A failed push or PR operation asks operators to check rolling-branch rules and token permissions. A failed auto-merge request asks them to check repository auto-merge settings, squash-merge availability, and token permissions; the PR remains available for manual review and merge. Generation or artifact failures are not similarly tolerated.

A successful workflow does not prove the PR merged. Required checks or reviews can still be pending, and the built-in-token fallback cannot trigger the other workflows needed for required PR checks. Verify the PR's state separately when investigating publication; the workflow does not wait for checks or merge completion.

If publication fails, generated pages may still have reached Factory cloud when that sync is enabled. The next run can restore only the state actually available on the rolling branch: without a previous successful publication there is no rolling wiki to restore; an existing branch may instead retain older state. The one-day artifact is a short-lived handoff, not durable storage. Fix the permissions/rules before a subsequent main push refresh; this workflow defines no manual-dispatch trigger.

## Three different publishing destinations

- **Factory cloud upload:** an optional `/wiki` operation during generation, independent of whether the later GitHub PR succeeds.
- **GitHub wiki sync:** publication to GitHub's separate wiki repository. This workflow has no explicit clone or sync step for that destination; the versioned PR is not GitHub wiki sync.
- **Versioned wiki PR:** the explicit artifact-to-rolling-branch process above, storing Markdown and hidden metadata in the source repository after review and merge.

These documentation flows are separate from app hosting and tag releases; see [Deployment](../deployment.md). Local contribution rules still apply as described in [Development workflow](development-workflow.md); automation details complement, rather than replace, [Tooling](tooling.md).
