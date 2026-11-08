#!/usr/bin/env node
// Verifies that AGENTS.md stays in sync with the repository: every
// `npm run <script>` / `npm <command>` it mentions must exist, and every
// backticked relative file path must point at a real file or directory.
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOC = path.resolve(ROOT, process.argv[2] ?? "AGENTS.md");

// npm commands that do not need a package.json script.
const NPM_BUILTINS = new Set([
  "audit",
  "ci",
  "exec",
  "i",
  "init",
  "install",
  "ls",
  "outdated",
  "pack",
  "uninstall",
  "update",
  "view",
  "x",
]);
// npm shorthands that run the package.json script of the same name.
const SCRIPT_SHORTHANDS = new Map([
  ["test", "test"],
  ["t", "test"],
  ["start", "start"],
  ["stop", "stop"],
  ["restart", "restart"],
]);
const NPM_COMMAND = /\bnpm\s+(?:run(?:-script)?\s+([\w:.-]+)|([a-z][\w-]*))/g;
const NOT_A_PATH = /[\s<>*?{}$|"'`]|:\/\/|^[/@-]|:/;
const FILE_EXTENSION = /\.[A-Za-z][A-Za-z0-9]*$/;

function isDirectory(candidate) {
  return existsSync(candidate) && statSync(candidate).isDirectory();
}

function looksLikePath(token) {
  if (NOT_A_PATH.test(token)) return false;
  if (token.startsWith("./") || token.startsWith("../")) return true;
  if (token.endsWith("/") || FILE_EXTENSION.test(token)) return true;
  // `next/core-web-vitals` is a package name, `.husky/pre-commit` is a path.
  return (
    token.includes("/") && isDirectory(path.join(ROOT, token.split("/")[0]))
  );
}

function codeSnippets(markdown) {
  const snippets = [];
  let inFence = false;
  markdown.split("\n").forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    const lineNumber = index + 1;
    if (inFence) {
      snippets.push({ text: line, lineNumber, inline: false });
      return;
    }
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      snippets.push({ text: match[1].trim(), lineNumber, inline: true });
    }
  });
  return snippets;
}

function checkNpmCommands(snippet, scripts, problems) {
  let checked = 0;
  for (const match of snippet.text.matchAll(NPM_COMMAND)) {
    checked += 1;
    const [, runScript, command] = match;
    const script = runScript ?? SCRIPT_SHORTHANDS.get(command);
    if (script !== undefined && !(script in scripts)) {
      problems.push(
        `line ${snippet.lineNumber}: "${match[0]}" needs a "${script}" script in package.json`
      );
    } else if (script === undefined && !NPM_BUILTINS.has(command)) {
      problems.push(
        `line ${snippet.lineNumber}: "${match[0]}" is not a package.json script or a known npm command`
      );
    }
  }
  return checked;
}

function checkPath(snippet, problems) {
  if (!snippet.inline || !looksLikePath(snippet.text)) return 0;
  if (!existsSync(path.resolve(ROOT, snippet.text))) {
    problems.push(
      `line ${snippet.lineNumber}: path \`${snippet.text}\` does not exist`
    );
  }
  return 1;
}

const packageJson = JSON.parse(
  readFileSync(path.join(ROOT, "package.json"), "utf8")
);
const scripts = packageJson.scripts ?? {};
const problems = [];
let commandCount = 0;
let pathCount = 0;

for (const snippet of codeSnippets(readFileSync(DOC, "utf8"))) {
  commandCount += checkNpmCommands(snippet, scripts, problems);
  pathCount += checkPath(snippet, problems);
}

const docName = path.relative(ROOT, DOC);
if (problems.length > 0) {
  console.error(`${docName} is out of date (${problems.length} problem(s)):`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(
  `${docName} OK: ${commandCount} npm command(s) and ${pathCount} path(s) verified.`
);
