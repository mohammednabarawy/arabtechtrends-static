#!/usr/bin/env node
/**
 * Normalize post tags: split mega-tags, auto-fill empty tags from titles.
 * Usage: node tools/normalize-tags.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const dryRun = process.argv.includes("--dry-run");

const BRANDS = [
  "سامسونج",
  "Samsung",
  "galaxy",
  "جالكسي",
  "آيفون",
  "ايفون",
  "iPhone",
  "واتساب",
  "WhatsApp",
  "شاومي",
  "Xiaomi",
  "هواوي",
  "Huawei",
  "أندرويد",
  "Android",
  "iOS",
  "ChatGPT",
  "جيميني",
  "Gemini",
  "One UI",
  "HyperOS",
  "ColorOS",
  "Windows",
  "ويندوز",
  "PlayStation",
  "بلايستيشن",
  "realme",
  "ريلمي",
  "OPPO",
  "أوبو",
  "vivo",
  "فيفو",
  "Honor",
  "هونر",
  "OnePlus",
  "ون بلس"
];

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  return { fm: match[1], body: match[2] };
}

function parseTags(fm) {
  const line = fm.match(/^tags:\s*(.+)$/m);
  if (!line) return [];
  const value = line[1].trim();
  if (value === "[]") return [];
  try {
    const json = JSON.parse(value.replace(/'/g, '"'));
    if (Array.isArray(json)) return json.map(String);
  } catch {
    /* fall through */
  }
  return [];
}

function serializeTags(tags) {
  const unique = [...new Set(tags.map((t) => t.trim()).filter(Boolean))].slice(0, 6);
  if (unique.length === 0) return "tags: []";
  const encoded = unique.map((t) => JSON.stringify(t)).join(", ");
  return `tags: [${encoded}]`;
}

function splitMegaTag(tag) {
  if (tag.length <= 40) return [tag];
  const parts = tag
    .split(/[,،|]/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 2 && p.length <= 40);
  if (parts.length > 1) return parts.slice(0, 6);
  return tag
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .reduce((acc, word) => {
      const last = acc[acc.length - 1];
      if (last && `${last} ${word}`.length <= 35) {
        acc[acc.length - 1] = `${last} ${word}`;
      } else {
        acc.push(word);
      }
      return acc;
    }, [])
    .slice(0, 5);
}

function tagsFromTitle(title) {
  const found = [];
  const lower = title.toLowerCase();
  for (const brand of BRANDS) {
    if (lower.includes(brand.toLowerCase()) && !found.includes(brand)) {
      found.push(brand);
    }
  }
  if (found.length >= 2) return found.slice(0, 5);
  const words = title
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  return [...new Set([...found, ...words])].slice(0, 5);
}

function normalizeTags(existing, title) {
  let tags = existing.flatMap(splitMegaTag).map((t) => t.trim()).filter(Boolean);
  tags = [...new Set(tags)].filter((t) => t.length <= 40);
  if (tags.length === 0) tags = tagsFromTitle(title);
  return tags.slice(0, 6);
}

function getTitle(fm) {
  const m = fm.match(/^title:\s*["'](.+?)["']\s*$/m);
  return m ? m[1] : "";
}

let updated = 0;

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(POSTS_DIR, file);
  const raw = readFileSync(path, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) continue;

  const title = getTitle(parsed.fm);
  const before = parseTags(parsed.fm);
  const after = normalizeTags(before, title);
  if (before.join("|") === after.join("|")) continue;

  const newFm = parsed.fm.replace(/^tags:\s*.+$/m, serializeTags(after));
  const next = `---\n${newFm}\n---\n${parsed.body}`;
  if (!dryRun) writeFileSync(path, next, "utf8");
  updated += 1;
}

console.log(dryRun ? `Would update ${updated} posts` : `Updated ${updated} posts`);
