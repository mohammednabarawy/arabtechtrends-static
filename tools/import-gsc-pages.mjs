#!/usr/bin/env node
/**
 * Import top pages from a Google Search Console Performance CSV export.
 * GSC → Performance → Pages → Export → save as CSV.
 *
 * Usage: node tools/import-gsc-pages.mjs [path/to/export.csv]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = join(import.meta.dirname, "../src/data/top-posts.json");
const csvPath = process.argv[2] ?? join(import.meta.dirname, "gsc-pages.csv");

if (!existsSync(csvPath)) {
  console.error(`File not found: ${csvPath}`);
  console.error("Export top pages from GSC Performance and pass the CSV path.");
  process.exit(1);
}

const raw = readFileSync(csvPath, "utf8");
const lines = raw.split(/\r?\n/).filter(Boolean);
if (lines.length < 2) {
  console.error("CSV appears empty.");
  process.exit(1);
}

const header = lines[0].toLowerCase();
const urlIdx = header.includes("top pages")
  ? 0
  : header.split(",").findIndex((h) => h.includes("page") || h.includes("url"));

function parseCsvLine(line) {
  if (!line.includes('"')) return line.split(",");
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  return cells;
}

const slugFromUrl = (url) => {
  try {
    const path = new URL(url.trim()).pathname;
    const m = path.match(/\/posts\/([^/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    const m = url.match(/\/posts\/([^/,\s]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
};

const slugs = [];
const seen = new Set();

for (const line of lines.slice(1)) {
  const cols = parseCsvLine(line);
  const url = cols[urlIdx >= 0 ? urlIdx : 0];
  if (!url || !url.includes("/posts/")) continue;
  const slug = slugFromUrl(url);
  if (!slug || seen.has(slug)) continue;
  seen.add(slug);
  slugs.push(slug);
  if (slugs.length >= 12) break;
}

if (slugs.length === 0) {
  console.error("No /posts/ URLs found in CSV. Check export format.");
  process.exit(1);
}

const payload = {
  updated: new Date().toISOString().slice(0, 10),
  source: "gsc",
  note: "Imported from Google Search Console Performance export.",
  slugs
};

writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${slugs.length} slugs to ${OUT}`);
