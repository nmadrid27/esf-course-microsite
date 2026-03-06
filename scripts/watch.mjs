#!/usr/bin/env node
/**
 * Course File Watcher
 *
 * Watches the course folder for markdown changes and
 * re-runs the compiler. Vite picks up the JSON change via HMR.
 *
 * Supports both ESF Faculty Toolkit and Obsidian vault layouts.
 *
 * Usage:
 *   node scripts/watch.mjs [course-path]
 */

import fs from "node:fs";
import { watch } from "chokidar";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPILE_SCRIPT = path.join(__dirname, "compile.mjs");

const VAULT_PATH =
  process.argv[2] ||
  process.env.COURSE_VAULT_PATH ||
  null;

if (!VAULT_PATH) {
  console.error(
    "Error: No course path provided.\n" +
    "Usage: node scripts/watch.mjs /path/to/your/course/folder\n" +
    "   or: COURSE_VAULT_PATH=/path/to/course node scripts/watch.mjs"
  );
  process.exit(1);
}

// Auto-detect layout and watch the right directories
const isToolkit =
  fs.existsSync(path.join(VAULT_PATH, "briefs")) ||
  fs.existsSync(path.join(VAULT_PATH, "materials")) ||
  fs.existsSync(path.join(VAULT_PATH, "syllabus.md"));

const WATCH_DIRS = isToolkit
  ? [
      path.join(VAULT_PATH, "materials"),
      path.join(VAULT_PATH, "briefs"),
      path.join(VAULT_PATH, "syllabus.md"),
    ].filter((d) => fs.existsSync(d))
  : [
      path.join(VAULT_PATH, "modules"),
      path.join(VAULT_PATH, "projects"),
      path.join(VAULT_PATH, "planning/syllabus"),
    ].filter((d) => fs.existsSync(d));

let debounceTimer = null;
let compiling = false;

function recompile(changedPath) {
  if (compiling) return;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    compiling = true;
    const relative = path.relative(VAULT_PATH, changedPath);
    console.log(`\n[watch] Changed: ${relative}`);
    console.log("[watch] Recompiling...");

    try {
      execFileSync("node", [COMPILE_SCRIPT, VAULT_PATH], {
        stdio: "inherit",
      });
      console.log("[watch] Done. Vite will hot-reload.\n");
    } catch (err) {
      console.error("[watch] Compile error:", err.message);
    }

    compiling = false;
  }, 500);
}

console.log("[watch] Watching vault for changes:");
for (const dir of WATCH_DIRS) {
  console.log(`  ${dir}`);
}
console.log("");

const watcher = watch(WATCH_DIRS, {
  ignored: [
    /(^|[/\\])\./,           // dotfiles
    /README\.md$/,            // README files
    /node_modules/,
  ],
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100,
  },
});

watcher.on("change", recompile);
watcher.on("add", recompile);
watcher.on("unlink", recompile);
