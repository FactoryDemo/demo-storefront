# By the numbers

Data collected on **2026-11-13**, beginning at **15:56:34 UTC**, at `411198d7052c4cc6a341372ec019dac8fffc673b` (`HEAD` and `origin/main`). These are repository measurements, not production usage or individual performance statistics. See [Architecture](overview/architecture.md) for the boundaries and [Lore](lore.md) for the changes behind them.

Inventory, language totals, and activity were recomputed from current committed Git blobs and reachable default-branch metadata. Since the previous snapshot at `838675d3faf02f07fbc7a486afc232041f2641ed`, 33 files gained 1,551 lines with no deletions: 31 wiki Markdown pages, wiki metadata, and four policy lines in `AGENTS.md`. An empty `git diff --name-only` between those revisions for `app/`, `components/`, `lib/`, `server/`, `scripts/`, `tests/`, `e2e/`, and `instrumentation.ts` confirms those scopes are unchanged. Their source/test counts, directory sizes, import depth, and exports are carried forward.

## Inventory and counting rules

`git ls-tree -r -z --name-only origin/main` lists **140 tracked files**. Excluding the generated `package-lock.json` and `next-env.d.ts` leaves **138**:

| Category | Files | Scope |
| --- | ---: | --- |
| Source | 41 | Everything in `app/`, `components/`, `lib/`, `server/`, `scripts/`, plus `instrumentation.ts`; includes CSS |
| Tests | 8 | Seven files in `tests/`, one in `e2e/` |
| Configuration and automation | 35 | Remaining non-Markdown, non-asset files: root tool configs, `.github/` workflows/settings, `.devcontainer/devcontainer.json`, `.husky/pre-commit`, `.env.example`, and `observability/grafana/` JSON |
| Handwritten documentation | 9 | Non-wiki Markdown, including issue/PR templates, `AGENTS.md`, and `.factory/skills/storefront-qa/SKILL.md` |
| Committed wiki documentation | 31 | Markdown pages in `droid-wiki/`, counted separately from handwritten documentation |
| Wiki metadata | 1 | `droid-wiki/.wiki-meta.json`, separate from the 35 configuration/automation files above |
| Assets | 13 | JPEGs in `public/products/` |
| **Total** | **138** | Mutually exclusive categories |

The measurement includes the committed wiki but excludes uncommitted wiki edits, installed dependencies, build output, coverage, generated API documentation, reports, Playwright artifacts, and TypeScript build caches. Current revision blobs, not dirty worktree content, supply text totals; no historical implementation blobs were read. None of the excluded artifact directories contributes committed files at this revision. Environment-file contents were not read; `.env.example` is counted by path only.

There are **40 source modules**: each `.ts`, `.tsx`, or `.mjs` file in the source scope above counts once. This is a file-level metric, not 40 packages or deployable services. The repository has one application package, not a monorepo. The remaining source file is `app/globals.css`; root executable configuration files and tests are not source modules here.

## Language lines

Physical lines include blank lines and comments. A newline terminates one line; a nonempty final unterminated line counts once, and a trailing newline does not create an extra line. This is not executable SLOC, coverage, or a complexity score.

The table covers all retained text except environment files: **124 files, 7,935 lines**. It includes tests, documentation, and configuration, not just application code. Markdown comprises **590 handwritten-documentation lines** and **1,490 committed-wiki lines**; wiki metadata adds **57 JSON lines**. Excluding the committed wiki and its metadata leaves **6,388 lines**. `.prettierrc` is classified as JSON; extensionless ignore/ownership/hook files are “Other text.”

| Language | Files | Physical lines |
| --- | ---: | ---: |
| TypeScript (`.ts`) | 27 | 1,903 |
| JSON | 12 | 915 |
| TSX (`.tsx`) | 16 | 817 |
| CSS | 1 | 756 |
| JavaScript (`.mjs`) | 9 | 734 |
| Markdown | 40 | 2,080 |
| YAML | 15 | 701 |
| Other text | 4 | 29 |

```mermaid
xychart-beta horizontal
    title "Tracked text physical lines"
    x-axis ["TypeScript", "JSON", "TSX", "CSS", "JavaScript", "Markdown", "YAML", "Other"]
    y-axis "Lines" 0 --> 2200
    bar [1903, 915, 817, 756, 734, 2080, 701, 29]
```

The source category has **3,342 physical lines**; tests have **776**. This does not claim every source module has a corresponding test. See [Testing](how-to-contribute/testing.md) for the actual test boundaries.

## Average source-file sizes

Arithmetic means use UTF-8 bytes and the same physical-line definition, grouped by top-level source directory. Nested `scripts/lib/github-issues.mjs` belongs to `scripts/`. Binary assets and tests are outside this table.

| Source location | Files | Total bytes | Mean bytes/file | Total lines | Mean lines/file |
| --- | ---: | ---: | ---: | ---: | ---: |
| `app/` | 9 | 16,919 | 1,879.9 | 954 | 106.0 |
| `components/` | 12 | 22,890 | 1,907.5 | 796 | 66.3 |
| `lib/` | 8 | 14,977 | 1,872.1 | 548 | 68.5 |
| `scripts/` | 7 | 20,934 | 2,990.6 | 686 | 98.0 |
| `server/` | 4 | 10,555 | 2,638.8 | 341 | 85.3 |
| Root: `instrumentation.ts` | 1 | 575 | 575.0 | 17 | 17.0 |

`app/globals.css` contributes 756 of `app/`'s 954 lines, so that average should not be interpreted as the typical route-handler size.

## Recent Git activity

Counts use commits reachable from local `origin/main`, including merges, with **committer dates in America/New_York** and calendar windows ending on November 13. No remote fetch was performed for this measurement. November is partial; there is no history before November 1 in this reachable graph.

| Weekly window, inclusive | Commits |
| --- | ---: |
| 2026-10-17–2026-10-23 | 0 |
| 2026-10-24–2026-10-30 | 0 |
| 2026-10-31–2026-11-06 | 6 |
| 2026-11-07–2026-11-13 | 28 |

| Calendar month | Commits |
| --- | ---: |
| September 2026 | 0 |
| October 2026 | 0 |
| November 2026, through November 13 | 34 |

### Ninety-day churn

The inclusive window is **2026-08-16–2026-11-13**. Select commits by their committer timestamp converted to America/New_York, then sum numeric additions/deletions from each non-merge commit using `git diff-tree --root --no-commit-id --numstat -r --no-renames -z <commit>`. Retain historical paths even if later deleted, with the same generated-file exclusions as the inventory. All 29 reachable non-merge commits fall inside the window. Root-commit additions count; merge commits do not, avoiding double-counting their branch patches. Binary entries have no numeric line count. Environment contents and historical patch bodies are never read; history contributes only numeric change counts.

| Scope | Added lines | Deleted lines | Churn: added + deleted |
| --- | ---: | ---: | ---: |
| Retained repository text | 9,217 | 1,258 | 10,475 |
| Source subset | 3,868 | 526 | 4,394 |
| Test subset | 931 | 155 | 1,086 |
| Committed wiki and metadata subset | 1,547 | 0 | 1,547 |

There are also **13 binary file-change entries**, excluded from line churn. The five largest file hotspots are:

| File, repository-root path | Added | Deleted | Churn |
| --- | ---: | ---: | ---: |
| `app/globals.css` | 821 | 65 | 886 |
| `observability/grafana/dashboard.json` | 522 | 0 | 522 |
| `tests/logger.test.ts` | 283 | 131 | 414 |
| `server/logger.ts` | 243 | 96 | 339 |
| `docs/architecture.md` | 213 | 80 | 293 |

The five largest directory hotspots aggregate all retained historical paths recursively by their top-level directory:

| Directory, repository-root path | Added | Deleted | Churn |
| --- | ---: | ---: | ---: |
| `droid-wiki/` | 1,547 | 0 | 1,547 |
| `.github/` | 1,027 | 259 | 1,286 |
| `scripts/` | 927 | 241 | 1,168 |
| `app/` | 1,028 | 74 | 1,102 |
| `components/` | 888 | 92 | 980 |

Churn measures edits, including formatting and initial creation, not effort or defect risk. The newly committed wiki is the largest directory hotspot; it does not indicate application growth. Across the window, `.github/workflows/droid-wiki-refresh.yml` contributes 141 additions and no deletions, unchanged since the previous snapshot.

### Explicit bot attribution: a lower bound

**20 of 34 commits (58.8%)** have explicit bot attribution: two have a `[bot]` author identity and 18 additional commits have a `Co-authored-by:` trailer containing `[bot]`. A commit matching both would count only once. Match author name/email and case-insensitive trailer lines in the full commit message; use the same reachable graph and 90-day date window as above, including merges.

This is a **lower bound on bot-associated commits**, not a measure of generated lines or autonomous work. A human-authored commit can carry bot coauthorship; unmarked automation is not inferred from wording, and the GitHub committer identity alone is not treated as a bot. No personal rankings are calculated.

## Internal import depth

The longest discovered simple path has **9 import edges across 10 source modules**:

```text
app/page.tsx
  → components/Storefront.tsx
  → components/ProductCard.tsx
  → components/CartProvider.tsx
  → components/posthog.ts
  → lib/analytics.ts
  → lib/orders.ts
  → lib/pricing.ts
  → lib/products.ts
  → lib/types.ts
```

Method: scan literal relative imports, including `import type` and literal dynamic `import()`, resolve exact paths or `.ts`/`.tsx`/`.mjs` and index variants against the 40 source modules, then enumerate directed paths without repeating a module. External packages, CSS, tests, and config files are excluded. Ties may exist; this is one maximum-length path. It includes type-only edges (for example `lib/analytics.ts` → `lib/orders.ts` and `lib/products.ts` → `lib/types.ts`), so it is **not** a runtime call stack or bundle-loading depth.

## Exported symbols per module

Metric: count each top-level exported declaration name once, including types and constants; count a default export as one exported binding. Do not count object members or local helpers. Inspection of the current source found direct declarations only: the scan matches line-start `export default`, `export [async] function`, `export const`, and exported type/interface/class/enum declarations. There are no re-export lists or destructured exported declarations needing expansion in this scope.

**98 exported bindings / 40 source modules = 2.45 per module.** Zero-export executable scripts remain in the denominator. These counts describe module surfaces, not an external public API.

| Module, repository-root path | Exports |
| --- | ---: |
| `app/api/health/route.ts` | 2 |
| `app/api/orders/route.ts` | 2 |
| `app/checkout/page.tsx` | 2 |
| `app/error.tsx` | 1 |
| `app/global-error.tsx` | 1 |
| `app/layout.tsx` | 2 |
| `app/orders/[id]/page.tsx` | 2 |
| `app/page.tsx` | 1 |
| `components/Analytics.tsx` | 1 |
| `components/CartDrawer.tsx` | 1 |
| `components/CartProvider.tsx` | 2 |
| `components/Checkout.tsx` | 1 |
| `components/MenuAnnouncement.tsx` | 1 |
| `components/OrderConfirmation.tsx` | 1 |
| `components/OrderLines.tsx` | 1 |
| `components/ProductCard.tsx` | 1 |
| `components/SiteHeader.tsx` | 1 |
| `components/Storefront.tsx` | 1 |
| `components/lastOrder.ts` | 2 |
| `components/posthog.ts` | 4 |
| `instrumentation.ts` | 1 |
| `lib/analytics.ts` | 10 |
| `lib/cart.ts` | 4 |
| `lib/currency.ts` | 1 |
| `lib/orders.ts` | 11 |
| `lib/pricing.ts` | 5 |
| `lib/products.ts` | 4 |
| `lib/promotions.ts` | 3 |
| `lib/types.ts` | 6 |
| `scripts/check-agents-md.mjs` | 0 |
| `scripts/ci-test-summary.mjs` | 0 |
| `scripts/grafana-alert-issues.mjs` | 0 |
| `scripts/grafana-sync.mjs` | 0 |
| `scripts/lib/github-issues.mjs` | 3 |
| `scripts/posthog-error-issues.mjs` | 0 |
| `scripts/todo-report.mjs` | 0 |
| `server/instrumentation-node.ts` | 1 |
| `server/logger.ts` | 10 |
| `server/release.ts` | 2 |
| `server/telemetry.ts` | 7 |

To refresh, use `git ls-tree -r -z origin/main` for current tracked paths and blob IDs, apply the exclusions and categories above, and pass only current-revision non-environment text blob IDs to `git cat-file blob <blob-id>`. Count physical lines without printing file bodies. Do not read historical implementation blobs or patches. Rerun export/import scans only when their source scope changes; otherwise confirm an empty scoped `git diff --name-only <previous-snapshot> origin/main` and retain those measurements. Use `git log origin/main --format='%H %ct %P'` for commit hashes, committer timestamps, and parent counts; convert timestamps before selecting calendar windows. Inspect full commit messages for bot trailers without publishing author emails, and use the numeric-only `git diff-tree` command above for non-merge churn. Recheck paths and export syntax if the tree changes.
