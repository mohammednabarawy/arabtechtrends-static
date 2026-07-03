#!/usr/bin/env node
/**
 * Create blog posts from YouTube channel export (mmbesar-style tutorial pages).
 *
 * Prereq: yt-dlp full playlist JSON
 *   npm run fetch:youtube
 *
 * Usage:
 *   node tools/import-youtube-posts.mjs [--apply] [--limit N] [--fetch-thumbs]
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { buildFullPost } from "./youtube-post-content.mjs";

const ROOT = join(import.meta.dirname, "..");
const POSTS_DIR = join(ROOT, "src/content/posts");
const YT_JSON = join(ROOT, "tools/youtube-full.json");
const THUMBS_DIR = join(ROOT, "public/uploads/youtube");

const apply = process.argv.includes("--apply");
const fetchThumbs = process.argv.includes("--fetch-thumbs");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

function slugify(value) {
  return (
    String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "video"
  );
}

function normalizeTitle(title) {
  return String(title || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectExistingVideoIds() {
  const ids = new Set();
  const titles = new Map();

  for (const file of readdirSync(POSTS_DIR)) {
    if (!file.endsWith(".md")) continue;
    const content = readFileSync(join(POSTS_DIR, file), "utf8");

    for (const m of content.matchAll(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/g)) {
      ids.add(m[1]);
    }
    for (const m of content.matchAll(/youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/g)) {
      ids.add(m[1]);
    }
    for (const m of content.matchAll(/youtu\.be\/([A-Za-z0-9_-]{11})/g)) {
      ids.add(m[1]);
    }

    const titleMatch = content.match(/^title:\s*["'](.+?)["']/m);
    if (titleMatch) {
      titles.set(normalizeTitle(titleMatch[1]), file);
    }
  }

  return { ids, titles };
}

function uniqueSlug(base, videoId, usedSlugs) {
  let slug = base;
  if (usedSlugs.has(slug)) slug = `${base}-${videoId.toLowerCase()}`;
  if (usedSlugs.has(slug)) slug = `yt-${videoId.toLowerCase()}`;
  usedSlugs.add(slug);
  return slug;
}

function downloadThumb(videoId) {
  const out = join(THUMBS_DIR, `${videoId}.jpg`);
  if (existsSync(out)) return `/uploads/youtube/${videoId}.jpg`;

  mkdirSync(THUMBS_DIR, { recursive: true });
  const url = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const result = spawnSync("curl", ["-fsSL", url, "-o", out], { stdio: "pipe", shell: true });

  if (result.status === 0 && existsSync(out)) {
    return `/uploads/youtube/${videoId}.jpg`;
  }
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function main() {
  if (!existsSync(YT_JSON)) {
    console.error(`Missing ${YT_JSON}`);
    console.error("Run: npm run fetch:youtube");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(YT_JSON, "utf8"));
  const videos = (data.entries || []).filter((e) => e.id && e._type !== "url");
  const { ids: existingIds, titles: existingTitles } = collectExistingVideoIds();
  const usedSlugs = new Set(
    readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
  );

  let created = 0;
  let skipped = 0;
  const planned = [];

  for (const video of videos.slice(0, limit)) {
    const { id, title } = video;

    if (existingIds.has(id)) {
      skipped++;
      continue;
    }

    if (existingTitles.has(normalizeTitle(title))) {
      skipped++;
      continue;
    }

    const slug = uniqueSlug(slugify(title), id, usedSlugs);
    const file = join(POSTS_DIR, `${slug}.md`);

    if (existsSync(file)) {
      skipped++;
      continue;
    }

    const imagePath =
      fetchThumbs && apply ? downloadThumb(id) : `/uploads/youtube/${id}.jpg`;

    const content = buildFullPost(video, imagePath);
    planned.push({ slug, id, title });

    if (apply) {
      writeFileSync(file, content, "utf8");
      created++;
    }
  }

  console.log(`Videos in export: ${videos.length}`);
  console.log(`Skipped (already covered): ${skipped}`);
  console.log(`${apply ? "Created" : "Would create"}: ${apply ? created : planned.length}`);

  if (!apply && planned.length) {
    console.log("\nDry run — first 10 posts:");
    for (const p of planned.slice(0, 10)) {
      console.log(`  ${p.slug}.md  (${p.id})  ${p.title.slice(0, 60)}`);
    }
    console.log("\nRe-run with --apply to write files. Add --fetch-thumbs to save thumbnails locally.");
  }
}

main();
