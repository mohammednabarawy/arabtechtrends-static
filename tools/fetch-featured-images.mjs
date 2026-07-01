#!/usr/bin/env node
/**
 * Backfill empty post `image` frontmatter from archived WordPress pages (Wayback).
 * Copies media from local cPanel backup when available.
 *
 * Usage:
 *   node tools/fetch-featured-images.mjs [--dry-run] [--limit=50]
 */
import {
  copyFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { join, dirname } from "node:path";
import { pipeline } from "node:stream/promises";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const DEST_ROOT = join(import.meta.dirname, "../public/uploads/wp");
const MAP_PATH = join(import.meta.dirname, "image-url-map.json");

const dryRun = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
const sourceArg = process.argv.find((a) => a.startsWith("--source="))?.split("=")[1];

const UPLOADS_SOURCES = sourceArg
  ? [sourceArg.replace(/\\/g, "/")]
  : [
      "E:/arabtechtrends.com/arabtechtrends.com/wp-content/uploads",
      "E:/backup-6.30.2026_17-15-39_invodhyo/arabtechtrends.com/wp-content/uploads"
    ].filter((p) => existsSync(p));

const OG_RE =
  /property=["']og:image(?::secure_url)?["']\s+content=["']([^"']+)["']|content=["']([^"']+)["']\s+property=["']og:image(?::secure_url)?["']/gi;
const IMG_RE = /https?:\/\/(?:web\.archive\.org\/web\/\d+im_\/)?(?:www\.)?arabtechtrends\.com\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;

function relFromUrl(url) {
  const clean = url
    .replace(/^https?:\/\/web\.archive\.org\/web\/\d+im_\//, "")
    .split("?")[0]
    .split("#")[0];
  const path = new URL(clean).pathname;
  return decodeURIComponent(path.replace(/^\/wp-content\/uploads\//, "")).replace(/\\/g, "/");
}

function normalizeRemote(url) {
  return url
    .replace(/^https?:\/\/web\.archive\.org\/web\/\d+im_\//, "")
    .replace(/&amp;/g, "&")
    .split("?")[0];
}

function walkFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, files);
    else if (/\.(jpe?g|png|gif|webp|svg)(\.\w+)?$/i.test(entry.name)) files.push(full);
  }
  return files;
}

const byRel = new Map();
const byBase = new Map();
const byPrefix = new Map();

for (const srcRoot of UPLOADS_SOURCES) {
  console.log(`Indexing ${srcRoot}...`);
  for (const file of walkFiles(srcRoot)) {
    const rel = file.slice(srcRoot.length).replace(/^[/\\]/, "").replace(/\\/g, "/");
    byRel.set(rel.toLowerCase(), file);
    const base = rel.split("/").pop().toLowerCase();
    if (!byBase.has(base)) byBase.set(base, file);
    const prefix = base.match(/^(\d+_\d+_)/)?.[1];
    if (prefix && !byPrefix.has(prefix)) byPrefix.set(prefix, file);
  }
}

function findFile(relPath) {
  const rel = relPath.replace(/\\/g, "/");
  const lower = rel.toLowerCase();
  if (byRel.has(lower)) return byRel.get(lower);
  const base = rel.split("/").pop().toLowerCase();
  if (byBase.has(base)) return byBase.get(base);
  const prefix = base.match(/^(\d+_\d+_)/)?.[1];
  if (prefix && byPrefix.has(prefix)) return byPrefix.get(prefix);
  return null;
}

async function waybackPage(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await new Promise((r) => setTimeout(r, attempt * 1500));
      const res = await fetch(
        `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(25000) }
      );
      const data = await res.json();
      const snap = data?.archived_snapshots?.closest;
      if (!snap?.available || !snap.url) return null;
      const pageRes = await fetch(snap.url, {
        signal: AbortSignal.timeout(60000),
        headers: { "User-Agent": "ArabTechTrends-Migration/1.0" }
      });
      if (!pageRes.ok) continue;
      return { html: await pageRes.text(), snapshot: snap.url };
    } catch {
      /* retry */
    }
  }
  return null;
}

async function downloadRemote(remote, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  if (existsSync(dest) && statSync(dest).size > 0) return true;

  const sources = [remote];
  try {
    const res = await fetch(
      `https://archive.org/wayback/available?url=${encodeURIComponent(remote)}`,
      { signal: AbortSignal.timeout(20000) }
    );
    const data = await res.json();
    const snap = data?.archived_snapshots?.closest;
    if (snap?.available && snap.url) {
      sources.unshift(snap.url.replace(/\/web\/(\d+)\//, "/web/$1im_/"));
    }
  } catch {
    /* ignore */
  }

  for (const src of sources) {
    try {
      const response = await fetch(src, {
        signal: AbortSignal.timeout(90000),
        headers: { "User-Agent": "ArabTechTrends-Migration/1.0" },
        redirect: "follow"
      });
      if (!response.ok) continue;
      const type = response.headers.get("content-type") || "";
      if (!type.startsWith("image/") && !type.includes("octet-stream")) continue;
      await pipeline(response.body, createWriteStream(dest));
      return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

function extractFeaturedImage(html) {
  for (const match of html.matchAll(OG_RE)) {
    const raw = match[1] || match[2];
    if (!raw) continue;
    const remote = normalizeRemote(raw);
    if (remote.includes("/wp-content/uploads/")) return remote;
  }
  for (const match of html.matchAll(IMG_RE)) {
    return normalizeRemote(match[0]);
  }
  return null;
}

function copyToPublic(remote) {
  const rel = relFromUrl(remote);
  const local = `/uploads/wp/${rel}`;
  const dest = join(DEST_ROOT, rel);

  const src = findFile(rel);
  if (src) {
    if (!dryRun) {
      mkdirSync(dirname(dest), { recursive: true });
      if (!existsSync(dest) || statSync(dest).size === 0) copyFileSync(src, dest);
    }
    return local;
  }

  if (dryRun) return local;
  return downloadRemote(remote, dest).then((ok) => (ok ? local : null));
}

function setFrontmatterImage(raw, image) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return raw;
  const [, fm, body] = match;
  const escaped = image.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  let newFm;
  if (/^image:/m.test(fm)) {
    newFm = fm.replace(/^image:\s*.*$/m, `image: "${escaped}"`);
  } else {
    newFm = `${fm.trimEnd()}\nimage: "${escaped}"`;
  }
  return `---\n${newFm}\n---\n${body}`;
}

const urlMap = existsSync(MAP_PATH) ? JSON.parse(readFileSync(MAP_PATH, "utf8")) : {};
const candidates = [];

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(POSTS_DIR, file);
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) continue;
  const [, fm] = match;
  const imgVal = fm.match(/^image:\s*["']([^"']*)["']/m)?.[1]?.trim() ?? "";
  if (imgVal) continue;
  const sourceUrl = fm.match(/^sourceUrl:\s*["']([^"']+)["']/m)?.[1];
  if (!sourceUrl) continue;
  candidates.push({ file, path, raw, sourceUrl });
}

console.log(`fetch-featured-images: ${candidates.length} posts without image`);
if (!UPLOADS_SOURCES.length) console.warn("Warning: no local backup uploads folder found; images will not be copied.");

let processed = 0;
let filled = 0;
let missing = 0;
let failed = 0;

async function handle(entry) {
  const result = await waybackPage(entry.sourceUrl);
  if (!result) {
    failed++;
    return;
  }
  const remote = extractFeaturedImage(result.html);
  if (!remote) {
    missing++;
    return;
  }
  const local = await copyToPublic(remote);
  if (!local) {
    missing++;
    return;
  }
  urlMap[remote] = local;
  if (!dryRun) {
    writeFileSync(entry.path, setFrontmatterImage(entry.raw, local), "utf8");
  }
  filled++;
  if (filled % 25 === 0) console.log(`  filled ${filled}...`);
}

const CONCURRENCY = 3;

for (let i = 0; i < Math.min(candidates.length, limit); i += CONCURRENCY) {
  const batch = candidates.slice(i, Math.min(i + CONCURRENCY, limit));
  for (const entry of batch) {
    await handle(entry);
  }
  processed += batch.length;
  if (processed % 30 === 0) console.log(`  progress ${processed}/${Math.min(candidates.length, limit)}...`);
}

if (!dryRun) writeFileSync(MAP_PATH, JSON.stringify(urlMap, null, 2), "utf8");

console.log(
  `fetch-featured-images: processed ${processed}, filled ${filled}, no image in archive ${missing}, fetch failed ${failed}${dryRun ? " (dry run)" : ""}`
);
