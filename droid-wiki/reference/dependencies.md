# Dependencies

`package.json` declares 11 runtime and 19 development dependencies: 30 direct packages, excluding npm scripts and transitive lockfile entries. `package-lock.json` pins the install resolved by `npm ci`; the ranges below are declarations, not claims about every installed version.

## Runtime packages

| Package | Declared version | Role |
| --- | --- | --- |
| `next` | `14.2.35` | App Router, rendering, build/server |
| `react`, `react-dom` | `^18.3.1` each | UI/runtime |
| `posthog-js` | `^1.447.4` | Lazy browser events, flags, exceptions |
| `posthog-node` | `^5.63.2` | API exception capture |
| `@opentelemetry/api` | `~1.9.0` | Metrics/tracing interfaces |
| `@opentelemetry/exporter-metrics-otlp-proto` | `^0.223.0` | OTLP metric exporter |
| `@opentelemetry/sdk-metrics` | `^2.12.0` | Periodic metric reader |
| `@vercel/otel` | `^2.3.0` | Framework telemetry registration |
| `@vercel/functions` | `^3.11.0` | `waitUntil` for request-finalization flush |
| `@pyroscope/nodejs` | `^0.6.5` | Optional native CPU profiler |

Optional telemetry still has installed runtime packages; “optional” describes configuration/use, not `optionalDependencies`. Next's native profiler packaging includes transitive `@datadog/pprof` paths (`next.config.mjs`).

## Development packages

| Group | Packages and declared versions |
| --- | --- |
| Browser tests | `@playwright/test ^1.64.1` |
| Unit tests/coverage | `vitest ^2.0.5`, `@vitest/coverage-v8 2.1.9` |
| Types/compiler | `typescript ^5.5.4`, `@types/node ^20.14.0`, `@types/react ^18.3.3`, `@types/react-dom ^18.3.0` |
| Lint | `eslint ^8.57.1`, `eslint-config-next 14.2.35`, `@typescript-eslint/eslint-plugin ^8.72.1`, `@typescript-eslint/parser ^8.72.1` |
| Formatting/hooks | `prettier ^3.9.10`, `husky ^9.1.7`, `lint-staged ^16.4.0` |
| Analysis/docs | `knip ^6.44.1`, `jscpd ^5.4.2`, `typedoc ^0.28.20` |
| Bundle size | `size-limit ^12.1.0`, `@size-limit/file ^12.1.0` |

CI and `.devcontainer/devcontainer.json` use Node 20. `package.json` does not declare an `engines` constraint.

## Updates and constraints

`.github/dependabot.yml` groups npm and GitHub Actions updates separately, monthly, with a seven-day cooldown and one open PR per ecosystem. Semver-major updates are ignored. Additional npm exclusions record compatibility reasons:

- `@opentelemetry/api >=1.10.0`: peer requirements from resources/sdk-logs.
- `@opentelemetry/exporter-metrics-otlp-proto >=0.300.0`: `@vercel/otel` peer range.
- `@pyroscope/nodejs >=0.7.0`: newer profiler requires Node at least 22.23.4, while workflows use 20.

These comments document current constraints, not a security assessment or an exemption from future upgrades. Intentional dependency changes should update both manifest and lockfile and run the [Testing](../how-to-contribute/testing.md) checks. For build/report tools, see [Tooling](../how-to-contribute/tooling.md).
