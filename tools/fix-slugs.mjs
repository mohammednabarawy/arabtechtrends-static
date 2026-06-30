#!/usr/bin/env node
/**
 * Rename corrupted post slugs and record redirect mappings.
 * Usage: node tools/fix-slugs.mjs [--dry-run]
 */
import { readFileSync, renameSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const REDIRECTS_PATH = join(import.meta.dirname, "slug-renames.json");
const dryRun = process.argv.includes("--dry-run");

function slugify(value) {
  let decoded = value || "";
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    decoded = String(value || "");
  }
  return (
    decoded
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || `post-${Date.now()}`
  );
}

function isCorruptedSlug(slug) {
  if (slug.startsWith("utm-sourcerss") || slug.includes("utm-sourcerssutm")) return true;
  if (/^d8-[a-f0-9-]{30,}$/i.test(slug)) return true;
  if (/^d9-[a-f0-9-]{30,}$/i.test(slug)) return true;
  return false;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const titleLine = match[1].match(/^title:\s*(.+)$/m)?.[1];
  let title = null;
  if (titleLine) {
    try {
      title = JSON.parse(titleLine);
    } catch {
      title = titleLine.replace(/^["']|["']$/g, "");
    }
  }
  return { frontmatter: match[1], body: match[2], title };
}

const existing = new Set(readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")));
const renames = [];
const used = new Set(existing);

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const slug = file.replace(/\.md$/, "");
  if (!isCorruptedSlug(slug)) continue;

  const raw = readFileSync(join(POSTS_DIR, file), "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed?.title) continue;

  let newSlug = slugify(parsed.title);
  let suffix = 2;
  while (used.has(newSlug) && newSlug !== slug) {
    newSlug = `${slugify(parsed.title).slice(0, 110)}-${suffix}`;
    suffix++;
  }
  if (newSlug === slug) continue;

  used.delete(slug);
  used.add(newSlug);
  renames.push({ oldSlug: slug, newSlug, title: parsed.title });

  if (!dryRun) {
    renameSync(join(POSTS_DIR, file), join(POSTS_DIR, `${newSlug}.md`));
  }
}

if (!dryRun) {
  writeFileSync(REDIRECTS_PATH, JSON.stringify(renames, null, 2), "utf8");
}

console.log(`fix-slugs: renamed ${renames.length} posts${dryRun ? " (dry run)" : ""}`);
