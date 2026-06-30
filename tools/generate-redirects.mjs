#!/usr/bin/env node
/**
 * Build redirect map from WordPress sourceUrl paths and slug renames.
 * Output: tools/redirect-map.json (consumed by astro.config.mjs)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const RENAMES_PATH = join(import.meta.dirname, "slug-renames.json");
const OUT_PATH = join(import.meta.dirname, "redirect-map.json");

function isValidPath(path) {
  if (!path || path === "/") return false;
  try {
    decodeURIComponent(path);
    return !path.includes("%") || /^[\w\-/.%]+$/i.test(path);
  } catch {
    return false;
  }
}

function canonicalFrom(path) {
  const trimmed = path.replace(/\/+$/, "") || "/";
  if (!isValidPath(trimmed)) return null;
  return trimmed;
}

function targetPath(slug) {
  return `/posts/${slug}/`;
}

const redirects = {};

function addRedirect(from, to) {
  const fromKey = canonicalFrom(from);
  if (!fromKey || fromKey === canonicalFrom(to)) return;
  if (fromKey.startsWith("/posts/") && fromKey === canonicalFrom(to)) return;
  if (!redirects[fromKey]) redirects[fromKey] = to;
}

const renames = existsSync(RENAMES_PATH) ? JSON.parse(readFileSync(RENAMES_PATH, "utf8")) : [];
for (const { oldSlug, newSlug } of renames) {
  addRedirect(`/posts/${oldSlug}`, targetPath(newSlug));
}

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const slug = file.replace(/\.md$/, "");
  const target = targetPath(slug);
  const raw = readFileSync(join(POSTS_DIR, file), "utf8");

  const sourceMatch = raw.match(/^sourceUrl:\s*("([^"]*)"|'([^']*)')/m);
  const sourceUrl = sourceMatch?.[2] || sourceMatch?.[3];
  if (sourceUrl) {
    try {
      const wpPath = new URL(sourceUrl).pathname;
      if (isValidPath(wpPath)) {
        addRedirect(wpPath, target);
      }
      // WordPress often used underscore utm params in URLs
      const decoded = decodeURIComponent(wpPath);
      if (decoded !== wpPath && isValidPath(decoded)) {
        addRedirect(decoded, target);
      }
    } catch {
      /* invalid sourceUrl */
    }
  }

  // Plain slug at site root (legacy WordPress permalink)
  if (isValidPath(`/${slug}`)) {
    addRedirect(`/${slug}`, target);
  }
}

writeFileSync(OUT_PATH, JSON.stringify(redirects, null, 2), "utf8");
console.log(`generate-redirects: ${Object.keys(redirects).length} redirect rules written`);
