#!/usr/bin/env node
/**
 * Download images into public/uploads/ and rewrite post URLs.
 * Sources: blogger.googleusercontent.com (live) + wp-content via Wayback Machine fallback.
 */
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  createWriteStream
} from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const MAP_PATH = join(import.meta.dirname, "image-url-map.json");
const dryRun = process.argv.includes("--dry-run");

const URL_PATTERNS = [
  /https?:\/\/(?:www\.)?arabtechtrends\.com\/wp-content\/uploads\/[^\s"'<>\\)]+/gi,
  /https:\/\/blogger\.googleusercontent\.com\/[^\s"'<>\\)]+/gi
];

function hashName(url) {
  const u = new URL(url.split("?")[0]);
  const base = decodeURIComponent(u.pathname.split("/").pop() || "image");
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : ".jpg";
  const hash = createHash("md5").update(url).digest("hex").slice(0, 12);
  const safe = base
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return `${hash}-${safe || "image"}${safe.includes(".") ? "" : ext}`;
}

function localUrlFor(remote) {
  if (remote.includes("blogger.googleusercontent.com")) {
    return `/uploads/blogger/${hashName(remote)}`;
  }
  const parsed = new URL(remote.split("?")[0]);
  const rel = parsed.pathname.replace(/^\/wp-content\/uploads\//, "");
  const parts = rel.split("/");
  parts[parts.length - 1] = hashName(remote);
  return `/uploads/wp/${parts.join("/")}`;
}

function diskPath(localUrl) {
  return join(import.meta.dirname, "../public", localUrl.replace(/^\//, ""));
}

async function waybackUrl(url) {
  try {
    const res = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(15000)
    });
    const data = await res.json();
    const snap = data?.archived_snapshots?.closest;
    if (snap?.available && snap.url) return snap.url;
  } catch {
    /* ignore */
  }
  return null;
}

async function download(url, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  if (existsSync(dest)) return true;

  const sources = [url];
  if (url.includes("arabtechtrends.com/wp-content")) {
    const archived = await waybackUrl(url);
    if (archived) sources.push(archived);
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

const urlSet = new Set();
for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const text = readFileSync(join(POSTS_DIR, file), "utf8");
  for (const re of URL_PATTERNS) {
    for (const match of text.matchAll(re)) {
      urlSet.add(match[0].replace(/&amp;/g, "&"));
    }
  }
}

const urls = [...urlSet];
const urlMap = existsSync(MAP_PATH) ? JSON.parse(readFileSync(MAP_PATH, "utf8")) : {};
let downloaded = 0;
let failed = 0;

const CONCURRENCY = 8;
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY);
  await Promise.all(
    batch.map(async (url) => {
      if (urlMap[url] && existsSync(diskPath(urlMap[url]))) return;
      const local = localUrlFor(url);
      const dest = diskPath(local);
      if (dryRun) {
        urlMap[url] = local;
        return;
      }
      const ok = await download(url, dest);
      if (ok) {
        urlMap[url] = local;
        downloaded++;
        if (downloaded % 25 === 0) console.log(`  downloaded ${downloaded}...`);
      } else {
        failed++;
      }
    })
  );
}

let filesUpdated = 0;
if (!dryRun) {
  writeFileSync(MAP_PATH, JSON.stringify(urlMap, null, 2), "utf8");
  const sorted = Object.keys(urlMap).sort((a, b) => b.length - a.length);
  for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
    const path = join(POSTS_DIR, file);
    let text = readFileSync(path, "utf8");
    let changed = false;
    for (const remote of sorted) {
      const local = urlMap[remote];
      if (!local) continue;
      if (text.includes(remote)) {
        text = text.split(remote).join(local);
        changed = true;
      }
      const amp = remote.replace(/&/g, "&amp;");
      if (text.includes(amp)) {
        text = text.split(amp).join(local);
        changed = true;
      }
    }
    if (changed) {
      writeFileSync(path, text, "utf8");
      filesUpdated++;
    }
  }
}

console.log(
  `migrate-images: ${urls.length} unique URLs, ${downloaded} downloaded, ${failed} failed, ${filesUpdated} posts updated`
);
