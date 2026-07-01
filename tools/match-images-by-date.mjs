#!/usr/bin/env node
/**
 * Match featured images by WordPress upload timestamp prefix (1759317195_172_*.jpg)
 * when pubDate is close to the file timestamp and no image is set yet.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const DEST_ROOT = join(import.meta.dirname, "../public/uploads/wp");
const sourceArg = process.argv.find((a) => a.startsWith("--source="))?.split("=")[1];
const UPLOADS_ROOT = (sourceArg ?? "E:/arabtechtrends.com/arabtechtrends.com/wp-content/uploads").replace(/\\/g, "/");
const dryRun = process.argv.includes("--dry-run");
const WINDOW_SEC = 72 * 3600;

if (!existsSync(UPLOADS_ROOT)) {
  console.error(`match-images-by-date: uploads root not found: ${UPLOADS_ROOT}`);
  process.exit(1);
}

function walkFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, files);
    else if (/^\d+_\d+_.+\.(jpe?g|png|webp|gif)(\.\w+)?$/i.test(entry.name)) files.push(full);
  }
  return files;
}

const files = walkFiles(UPLOADS_ROOT);
const byMonth = new Map();

for (const file of files) {
  const rel = file.slice(UPLOADS_ROOT.length).replace(/^[/\\]/, "").replace(/\\/g, "/");
  const parts = rel.split("/");
  if (parts.length < 3) continue;
  const key = `${parts[0]}/${parts[1]}`;
  const ts = Number(parts[2].match(/^(\d+)_/)?.[1]);
  if (!ts) continue;
  if (!byMonth.has(key)) byMonth.set(key, []);
  byMonth.get(key).push({ rel, ts, file });
}

function setFrontmatterImage(raw, image) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return raw;
  const [, fm, body] = match;
  const escaped = image.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const newFm = /^image:/m.test(fm)
    ? fm.replace(/^image:\s*.*$/m, `image: "${escaped}"`)
    : `${fm.trimEnd()}\nimage: "${escaped}"`;
  return `---\n${newFm}\n---\n${body}`;
}

let matched = 0;
let skipped = 0;

for (const name of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(POSTS_DIR, name);
  const raw = readFileSync(path, "utf8");
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) continue;
  const fm = fmMatch[1];
  const imgVal = fm.match(/^image:\s*["']([^"']*)["']/m)?.[1]?.trim() ?? "";
  if (imgVal) {
    skipped++;
    continue;
  }

  const pubDate = fm.match(/^pubDate:\s*["']([^"']+)["']/m)?.[1];
  if (!pubDate) continue;
  const pubTs = Math.floor(new Date(pubDate).getTime() / 1000);
  const d = new Date(pubDate);
  const monthKey = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  const candidates = byMonth.get(monthKey) ?? [];
  if (!candidates.length) continue;

  const near = candidates
    .map((c) => ({ ...c, diff: Math.abs(c.ts - pubTs) }))
    .filter((c) => c.diff <= WINDOW_SEC)
    .sort((a, b) => a.diff - b.diff);

  if (!near.length) continue;

  const best = near[0];
  const sameDay = near.filter((c) => c.diff <= 6 * 3600);
  if (sameDay.length > 3) continue;

  const local = `/uploads/wp/${best.rel}`;
  const dest = join(DEST_ROOT, best.rel);
  if (!dryRun) {
    mkdirSync(dirname(dest), { recursive: true });
    if (!existsSync(dest) || statSync(dest).size === 0) copyFileSync(best.file, dest);
    writeFileSync(path, setFrontmatterImage(raw, local), "utf8");
  }
  matched++;
}

console.log(`match-images-by-date: matched ${matched}, skipped ${skipped}${dryRun ? " (dry run)" : ""}`);
