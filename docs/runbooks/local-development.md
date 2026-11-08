# Runbook: local development

How to get Bean & Byte running locally and fix the failures people hit
most often.

## Setup

1. Use Node.js 20 or newer (CI runs Node 20).
2. Install exact dependencies from the lockfile:

   ```bash
   npm ci
   ```

   This also installs the Husky pre-commit hook, which runs lint-staged
   (ESLint `--fix` and Prettier) on staged files.

3. Start the dev server and open http://localhost:3000:

   ```bash
   npm run dev
   ```

No environment variables, accounts, or external services are needed.

## Check that the app is healthy

```bash
curl -i http://localhost:3000/api/health
```

Expect `HTTP/1.1 200 OK` and the body `{"status":"ok"}`. The server log
shows a matching JSON line:

```json
{"timestamp":"...","level":"info","message":"health check","traceId":"...","spanId":"...","route":"/api/health","status":"ok"}
```

If curl cannot connect, the server is not running or is on another port.

## Common failures

### Port 3000 is already in use

Symptom: `Error: listen EADDRINUSE: address already in use :::3000`.

1. Find the process: `lsof -i :3000`.
2. Stop it if it is a stale dev server (`kill <pid>`), or run on another
   port: `npm run dev -- -p 3001`.

Playwright (`npm run test:e2e`) expects port 3000. Locally it reuses a
server that is already running there, so make sure that server is this app.

### Stale `.next` build output

Symptoms: `Cannot find module './NNN.js'`, missing chunk errors, old styles
or pages after switching branches, or a production server that serves an
older build.

1. Stop the dev or production server.
2. Delete the build cache: `rm -rf .next`.
3. Restart with `npm run dev`, or rebuild with `npm run build`.

### Lockfile drift

Symptom: `npm ci` fails with "`npm ci` can only install packages when your
package.json and package-lock.json are in sync", or the app behaves
differently than in CI.

1. If you changed dependencies on purpose, run `npm install` to update
   `package-lock.json`, then commit both files together.
2. If you did not, restore both files from `main` and run `npm ci` again.
3. Never edit `package-lock.json` by hand.

### Playwright cannot find a browser

Symptom: `Executable doesn't exist` when running `npm run test:e2e`.
Install Chromium once with `npx playwright install chromium`.

### Pre-commit hook rejects a commit

The hook runs ESLint `--fix` and Prettier on staged files only. Run
`npm run lint` and `npm run format` to see and fix the problem, stage the
result, and commit again.

### `npm run test:ci` fails on coverage

Coverage of `lib/` must stay at or above the thresholds in
`vitest.config.ts`. Add tests for the new code rather than lowering them.
Open `coverage/index.html` to see uncovered lines.
