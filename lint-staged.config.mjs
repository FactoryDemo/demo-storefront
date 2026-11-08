import path from "node:path";

const ESLINT_TARGET = /^(?:app|lib|components)\/.*\.tsx?$/;

function quote(files) {
  return files.map((file) => `"${file}"`).join(" ");
}

function relative(file) {
  return path.relative(process.cwd(), file).split(path.sep).join("/");
}

/** @type {import("lint-staged").Configuration} */
const config = {
  // A single glob keeps the tasks sequential: lint-staged runs separate globs
  // in parallel, and ESLint and Prettier must not rewrite the same file at
  // once. Prettier runs last so its formatting wins.
  "*": (files) => {
    const lintable = files.filter((file) => ESLINT_TARGET.test(relative(file)));
    const tasks =
      lintable.length > 0 ? [`eslint --fix ${quote(lintable)}`] : [];
    return [...tasks, `prettier --write --ignore-unknown ${quote(files)}`];
  },
};

export default config;
