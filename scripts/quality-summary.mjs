#!/usr/bin/env node
// Prints a Markdown summary of coverage (coverage/coverage-summary.json) and
// test durations (reports/junit.xml) for $GITHUB_STEP_SUMMARY.
import { existsSync, readFileSync } from "node:fs";

const COVERAGE_SUMMARY = "coverage/coverage-summary.json";
const JUNIT_REPORT = "reports/junit.xml";
const METRICS = ["statements", "branches", "functions", "lines"];
const SLOWEST_COUNT = 5;

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  if (!match) return "";
  return match[1]
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function cell(value) {
  return String(value).replace(/\|/g, "\\|");
}

function seconds(value) {
  return `${Number(value || 0).toFixed(3)}s`;
}

function coverageSection() {
  const lines = ["### Coverage (lib/)", ""];
  if (!existsSync(COVERAGE_SUMMARY)) {
    return [...lines, `_No ${COVERAGE_SUMMARY} found._`];
  }
  const { total } = JSON.parse(readFileSync(COVERAGE_SUMMARY, "utf8"));
  lines.push("| Metric | Covered | Total | % |", "| --- | --- | --- | --- |");
  for (const metric of METRICS) {
    const { covered, total: count, pct } = total[metric];
    lines.push(`| ${metric} | ${covered} | ${count} | ${pct}% |`);
  }
  return lines;
}

function testSection() {
  const lines = ["### Test durations", ""];
  if (!existsSync(JUNIT_REPORT)) {
    return [...lines, `_No ${JUNIT_REPORT} found._`];
  }
  const xml = readFileSync(JUNIT_REPORT, "utf8");
  const root = xml.match(/<testsuites\b[^>]*>/)?.[0] ?? "";
  const suites = [...xml.matchAll(/<testsuite\s[^>]*>/g)].map(([tag]) => tag);
  const cases = [...xml.matchAll(/<testcase\s[^>]*>/g)].map(([tag]) => ({
    file: attribute(tag, "classname"),
    name: attribute(tag, "name"),
    time: Number(attribute(tag, "time") || 0),
  }));

  lines.push(
    `${attribute(root, "tests")} tests, ${attribute(root, "failures")} failures, ` +
      `${seconds(attribute(root, "time"))} total`,
    "",
    "| File | Tests | Failures | Time |",
    "| --- | --- | --- | --- |"
  );
  for (const suite of suites) {
    lines.push(
      `| ${cell(attribute(suite, "name"))} | ${attribute(suite, "tests")} | ` +
        `${attribute(suite, "failures")} | ${seconds(attribute(suite, "time"))} |`
    );
  }

  const slowest = [...cases]
    .sort((a, b) => b.time - a.time)
    .slice(0, SLOWEST_COUNT);
  lines.push(
    "",
    `Slowest ${slowest.length} tests:`,
    "",
    "| Test | File | Time |",
    "| --- | --- | --- |"
  );
  for (const test of slowest) {
    lines.push(
      `| ${cell(test.name)} | ${cell(test.file)} | ${seconds(test.time)} |`
    );
  }
  return lines;
}

console.log(
  ["## Quality", "", ...coverageSection(), "", ...testSection(), ""].join("\n")
);
