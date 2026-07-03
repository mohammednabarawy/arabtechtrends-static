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

function cleanHeading(match, level, inner) {
  const idMatch = inner.match(/\bid="([^"]+)"/i) ?? inner.match(/id='([^']+)'/i);
  const spanId = inner.match(/<span[^>]*\bid=["']([^"']+)["']/i);
  const id = idMatch?.[1] ?? spanId?.[1];
  const text = inner
    .replace(/<span class="ez-toc-section"[^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/<span class="ez-toc-section-end"><\/span>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
  if (!text) return match;
  return id ? `<h${level} id="${id}">${text}</h${level}>` : `<h${level}>${text}</h${level}>`;
}

function cleanBody(body) {
  let out = body;

  out = out.replace(/<div[^>]*itemtype="https:\/\/schema\.org\/WPAdBlock"[^>]*>[\s\S]*?<\/div>/gi, "");
  out = out.replace(/<div[^>]*id="ez-toc-container"[^>]*>[\s\S]*?<\/div>/gi, "");
  out = out.replace(/<nav>[\s\S]*?ez-toc-list[\s\S]*?<\/nav>/gi, "");
  out = out.replace(/<div[^>]*class="[^"]*lwptoc[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
  out = out.replace(/<div[^>]*class="[^"]*duzxlygivn[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");

  out = out.replace(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>/gi, "");
  out = out.replace(/<div[^>]*class="[^"]*single-post-content[^"]*"[^>]*>/gi, "");
  out = out.replace(/<div[^>]*class="[^"]*clearfix[^"]*"[^>]*>/gi, "");

  out = out.replace(/\s+data-path-to-node="[^"]*"/gi, "");
  out = out.replace(/\s+data-type="[^"]*"/gi, "");
  out = out.replace(/\s+data-id="[^"]*"/gi, "");
  out = out.replace(/\s+data-lazyloaded="[^"]*"/gi, "");
  out = out.replace(/\s+data-recalc-dims="[^"]*"/gi, "");
  out = out.replace(/\s+data-\/?>/gi, ">");
  out = out.replace(/\s+border="0"/gi, "");
  out = out.replace(/\s+decoding="async"/gi, "");

  out = out.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, cleanHeading);

  out = out.replace(/<h([1-6])[^>]*class="[^"]*wp-block-heading[^"]*"[^>]*>/gi, "<h$1>");
  out = out.replace(/<figure[^>]*class="[^"]*wp-block-image[^"]*"[^>]*>/gi, "<figure>");
  out = out.replace(/\s+class="wp-image-\d+"/gi, "");
  out = out.replace(/<p([^>]*)\s+class="[^"]*"([^>]*)>/gi, "<p$1$2>");

  out = out.replace(/<\/p>\s*<\/p>/gi, "</p>");
  out = out.replace(/<\/div>\s*<p>/gi, "<p>");
  out = out.replace(/<p>\s*<\/div>/gi, "<p>");

  for (let i = 0; i < 6; i++) {
    out = out.replace(/<div>\s*<\/div>/gi, "");
  }

  out = out.replace(/^<div>\s*([\s\S]*?)\s*<\/div>\s*$/i, "$1");

  out = decodeEntities(out);
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
