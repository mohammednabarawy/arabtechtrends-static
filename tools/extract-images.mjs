#!/usr/bin/env node
/**
 * Extract first image URL from post body into frontmatter `image` field.
 * Usage: node tools/extract-images.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const dryRun = process.argv.includes("--dry-run");
const IMG_RE = /<img[^>]+src=["']([^"']+)["']/i;

let updated = 0;
let skipped = 0;

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(POSTS_DIR, file);
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) continue;

  const [, frontmatter, body] = match;
  if (/^image:\s*["'][^"']+["']/m.test(frontmatter)) {
    skipped++;
    continue;
  }

  const imgMatch = body.match(IMG_RE);
  if (!imgMatch?.[1]) {
    skipped++;
    continue;
  }

  const image = imgMatch[1].replace(/\\"/g, '"');
  const newFrontmatter = frontmatter.replace(/^image:\s*["']?["']?\s*$/m, `image: "${image.replace(/"/g, '\\"')}"`);
  const finalFm = /^image:/m.test(newFrontmatter)
    ? newFrontmatter
    : `${newFrontmatter.trimEnd()}\nimage: "${image.replace(/"/g, '\\"')}"`;

  const output = `---\n${finalFm}\n---\n${body}`;
  if (!dryRun) writeFileSync(path, output, "utf8");
  updated++;
}

console.log(`extract-images: updated ${updated}, skipped ${skipped}${dryRun ? " (dry run)" : ""}`);
