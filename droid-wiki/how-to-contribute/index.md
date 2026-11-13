# Contributing

Make small, typed changes with tests around business-rule boundaries. `AGENTS.md` is the contributor contract; the app needs no accounts or external services to develop.

## Before changing code

Read [Architecture](../overview/architecture.md) and the affected [Feature](../features/index.md). Keep pure rules in `lib/`, UI in `app/` and `components/`, and server I/O in `server/`. Prices and totals cross boundaries as cents.

Use the request and current code as the basis for implementation. `AGENTS.md` prohibits reading, reusing, or reverting earlier attempts from Git history, including reverted commits, closed or merged PRs, and `Rehearsal-*` commits. See [Patterns and conventions](patterns-and-conventions.md#current-code-implementations) for the command restrictions.

## Working checklist

1. Follow [Development workflow](development-workflow.md) for branches, commits, and PRs.
2. Follow [Patterns and conventions](patterns-and-conventions.md) for validation, naming, and privacy.
3. Run the four required checks in [Testing](testing.md): tests, typecheck, lint, and formatting.
4. Describe what changed, why, and the tests in the PR (`AGENTS.md`, `.github/pull_request_template.md`).
5. Stop after opening the PR; do not wait for or poll CI unless explicitly tasked with fixing a failing check.

The pre-commit hook is not a test runner. See [Tooling](tooling.md) for its exact scope and [Debugging](debugging.md) when local checks or checkout fail.
