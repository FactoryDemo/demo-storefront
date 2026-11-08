#!/usr/bin/env node
// Lists TODO, FIXME, and HACK comments in source files that git tracks (or
// would track), so technical debt stays visible. Report-only: exits 0.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SOURCE_FILE = /\.(?:[cm]?[jt]sx?|css)$/;
const SKIPPED_DIRS = new Set([".git", ".next", "node_modules", "coverage"]);
const MARKER = /(?:\/\/|\/\*|^\s*\*)\s*(TODO|FIXME|HACK)\b(.*)$/;

function listWithGit() {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
  );
  return output.split("\n").filter(Boolean);
}

function listByWalking(dir = ".") {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!SKIPPED_DIRS.has(name)) files.push(...listByWalking(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function listSourceFiles() {
  let files;
  try {
    files = listWithGit();
  } catch {
    files = listByWalking();
  }
  return files.filter((file) => SOURCE_FILE.test(file) && existsSync(file));
}

function findMarkers(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  const found = [];
  lines.forEach((line, index) => {
    const match = MARKER.exec(line);
    if (match) {
      const note = match[2]
        .replace(/\*\/\s*$/, "")
        .replace(/^[\s:-]+/, "")
        .trim();
      found.push({ file, line: index + 1, marker: match[1], note });
    }
  });
  return found;
}

const markers = listSourceFiles().flatMap(findMarkers);
const counts = { TODO: 0, FIXME: 0, HACK: 0 };
for (const { marker } of markers) counts[marker] += 1;

const fileCount = new Set(markers.map((m) => m.file)).size;
console.log(
  `Tech debt markers: ${markers.length} in ${fileCount} file(s) ` +
    `(TODO ${counts.TODO}, FIXME ${counts.FIXME}, HACK ${counts.HACK})`
);
for (const { file, line, marker, note } of markers) {
  console.log(`  ${file}:${line}  ${marker}  ${note}`);
}
