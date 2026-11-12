# Tooling

All npm commands are defined in `package.json`; additional Node scripts support reports and optional observability automation. Run commands from the repository root.

## Command reference

| Command | Behavior and configuration |
| --- | --- |
| `npm ci` | Install lockfile versions; lifecycle runs Husky setup |
| `npm run dev` | Next development server |
| `npm run build` / `npm run start` | Build production output / serve existing output |
| `npm test` | Noninteractive Vitest |
| `npm run test:ci` | Coverage, retries and JUnit |
| `npm run test:e2e` | Playwright with managed production server |
| `npm run typecheck` | `tsc --noEmit`; strict options in `tsconfig.json` |
| `npm run lint` | `next lint`; naming, complexity 10, max 400 nonblank/noncomment lines in `.eslintrc.json` |
| `npm run format` / `npm run format:check` | Prettier write / check; `.prettierrc`, `.prettierignore` |
| `npm run prepare` | Install Husky hook |
| `npm run knip` | Unused file/export/dependency analysis, scoped by `knip.json` |
| `npm run dup:check` | jscpd on app, components, lib, server, scripts, e2e, tests; `.jscpd.json` uses 50-token/5-line minimums |
| `npm run size` | Check built client chunks: all JS 330 kB, home chunk 4 kB (`.size-limit.json`); build first |
| `npm run todo:report` | List TODO/FIXME/HACK source comments (`scripts/todo-report.mjs`); report-only |
| `npm run docs:generate` | TypeDoc expands `lib/` into `docs/api/` (`typedoc.json`) |
| `npm run agents:check` | Validate referenced npm commands and relative code-span paths in `AGENTS.md` |

`.husky/pre-commit` runs `npx lint-staged`. `lint-staged.config.mjs` first runs ESLint fixes on staged TypeScript under `app/`, `lib/`, and `components/`, then Prettier with unknown-file ignoring on the staged file set. Sequential tasks avoid overlapping formatter writes. It does not run tests or apply ESLint fixes to every server/test file.

## Supporting scripts

| Repo-root path | Purpose |
| --- | --- |
| `scripts/ci-test-summary.mjs` | Read coverage/JUnit and emit summary tables |
| `scripts/todo-report.mjs` | Walk source extensions, skip generated/dependency/docs directories, print debt markers |
| `scripts/check-agents-md.mjs` | Check command/path existence, not prose correctness or every wiki link |
| `scripts/grafana-sync.mjs` | Write dashboard/folder/rules to configured Grafana |
| `scripts/posthog-error-issues.mjs` | Query recent PostHog exceptions and create/reopen GitHub issues |
| `scripts/grafana-alert-issues.mjs` | Query firing Grafana alerts and create/reopen GitHub issues |
| `scripts/lib/github-issues.mjs` | Shared label creation, marker lookup, and issue upsert |

The last four are external-service automation, not harmless local reports. Missing service credentials make the entry scripts skip; configured runs can write remotely. See [Alerting](../how-to-monitor/alerting.md) before using them.

## Environment and reports

`.github/workflows/droid-wiki-refresh.yml` installs Factory Droid and runs `/wiki` on main pushes except wiki-only changes; it has no npm install step. A separate job publishes a rolling documentation PR, retaining hidden incremental metadata but excluding generated video/images, then requests squash auto-merge without bypassing required checks or reviews. Publication and auto-merge failures have separate nonfatal warnings. See [Wiki refresh](wiki-refresh.md) for the full workflow and credential boundaries.

`.devcontainer/devcontainer.json` supplies Node 20, port 3000, npm install, and VS Code ESLint/Prettier extensions. `.gitignore` excludes `.next/`, installed dependencies, coverage/reports, browser artifacts, generated TypeDoc, and environment files except `.env.example`.

`.github/workflows/analysis.yml` tolerates analysis findings, TypeDoc and size failures, but not install/build failure. See [Development workflow](development-workflow.md) for all workflow triggers and [Dependencies](../reference/dependencies.md) for update constraints.
