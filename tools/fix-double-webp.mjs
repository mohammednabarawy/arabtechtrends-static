#!/usr/bin/env node
/**
 * Fix double .webp.webp extensions in uploads and post references.
 * Usage: node tools/fix-double-webp.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync, renameSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const UPLOADS = join(ROOT, "public/uploads");
const POSTS = join(ROOT, "src/content/posts");
const dryRun = process.argv.includes("--dry-run");

let renamed = 0;
let postsUpdated = 0;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else if (entry.name.endsWith(".webp.webp")) files.push(path);
  }
  return files;
}

const doubleWebp = walk(UPLOADS);
const renames = new Map();

for (const oldPath of doubleWebp) {
  const newPath = oldPath.replace(/\.webp\.webp$/, ".webp");
  if (existsSync(newPath) && oldPath !== newPath) continue;
  const from = oldPath.slice(ROOT.length).replace(/\\/g, "/");
  const to = newPath.slice(ROOT.length).replace(/\\/g, "/");
  renames.set(from, to);
  if (!dryRun) {
    renameSync(oldPath, newPath);
    renamed += 1;
  }
}

for (const file of readdirSync(POSTS).filter((f) => f.endsWith(".md"))) {
  const path = join(POSTS, file);
  let content = readFileSync(path, "utf8");
  let changed = false;
  for (const [from, to] of renames) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (content.includes(".webp.webp")) {
    const next = content.replace(/\.webp\.webp/g, ".webp");
    if (next !== content) {
      content = next;
      changed = true;
    }
  }
  if (changed) {
    if (!dryRun) writeFileSync(path, content, "utf8");
    postsUpdated += 1;
  }
}

console.log(
  dryRun
    ? `Would rename ${doubleWebp.length} files, update ${postsUpdated} posts`
    : `Renamed ${renamed} files, updated ${postsUpdated} posts`
);
