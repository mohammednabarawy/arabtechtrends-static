#!/usr/bin/env node
/**
 * Clean WordPress HTML leftovers from imported posts.
 * Usage: node tools/cleanup-posts.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const dryRun = process.argv.includes("--dry-run");

const ENTITY_MAP = {
  "&#8220;": '"',
  "&#8221;": '"',
  "&#8216;": "'",
  "&#8217;": "'",
  "&#8230;": "…",
  "&#8211;": "–",
  "&#8212;": "—",
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"'
};

function decodeEntities(text) {
  let out = text;
  for (const [entity, char] of Object.entries(ENTITY_MAP)) {
    out = out.split(entity).join(char);
  }
  return out.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function cleanBody(body) {
  let out = body;

  // Remove ad blocks and ez-toc containers
  out = out.replace(/<div[^>]*itemtype="https:\/\/schema\.org\/WPAdBlock"[^>]*>[\s\S]*?<\/div>/gi, "");
  out = out.replace(/<div[^>]*id="ez-toc-container"[^>]*>[\s\S]*?<\/div>/gi, "");

  // Strip outer wrapper div if it's the only wrapper
  out = out.replace(/^<div>\s*([\s\S]*?)\s*<\/div>\s*$/i, "$1");

  // Normalize wp-block headings
  out = out.replace(/<h([1-6])[^>]*class="[^"]*wp-block-heading[^"]*"[^>]*>/gi, "<h$1>");

  // Remove broken data attributes on images
  out = out.replace(/\s+data-lazyloaded="[^"]*"/gi, "");
  out = out.replace(/\s+data-recalc-dims="[^"]*"/gi, "");
  out = out.replace(/\s+data-\/?>/gi, ">");
  out = out.replace(/\s+border="0"/gi, "");
  out = out.replace(/\s+decoding="async"/gi, "");

  // Fix double-closed paragraphs
  out = out.replace(/<\/p>\s*<\/p>/gi, "</p>");

  // Decode HTML entities in text
  out = decodeEntities(out);

  // Collapse excessive blank lines
  out = out.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

  return out;
}

function cleanDescription(desc) {
  return decodeEntities(desc)
    .replace(/\s+/g, " ")
    .trim();
}

let updated = 0;

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(POSTS_DIR, file);
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) continue;

  let [, frontmatter, body] = match;
  const cleanedBody = cleanBody(body);
  const cleanedFm = frontmatter.replace(
    /^(description:\s*")([^"]*)(")/m,
    (_, pre, desc, post) => `${pre}${cleanDescription(desc)}${post}`
  );

  if (cleanedBody === body && cleanedFm === frontmatter) continue;

  const output = `---\n${cleanedFm}\n---\n${cleanedBody}`;
  if (!dryRun) writeFileSync(path, output, "utf8");
  updated++;
}

console.log(`cleanup-posts: updated ${updated} files${dryRun ? " (dry run)" : ""}`);
