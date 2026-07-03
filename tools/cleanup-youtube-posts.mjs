#!/usr/bin/env node
/**
 * Rebuild YouTube-imported posts with عرب تك identity (strip old YT boilerplate).
 * Usage: node tools/cleanup-youtube-posts.mjs [--apply]
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildIntro,
  buildPostBody,
  extractTags,
  trimMeta,
  yaml
} from "./youtube-post-content.mjs";

const ROOT = join(import.meta.dirname, "..");
const POSTS_DIR = join(ROOT, "src/content/posts");
const YT_JSON = join(ROOT, "tools/youtube-all-channels.json");
const YT_JSON_FALLBACK = join(ROOT, "tools/youtube-full.json");
const apply = process.argv.includes("--apply");

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  return { fm: match[1], body: match[2] };
}

function getField(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*(.+)$`, "m"));
  if (!m) return "";
  const raw = m[1].trim();
  if (raw.startsWith("[")) return raw;
  return raw.replace(/^["']|["']$/g, "");
}

function setField(fm, name, value) {
  const line = `${name}: ${typeof value === "string" && !value.startsWith("[") ? yaml(value) : value}`;
  if (new RegExp(`^${name}:`, "m").test(fm)) {
    return fm.replace(new RegExp(`^${name}:.*$`, "m"), line);
  }
  return `${fm}\n${line}`;
}

function videoIdFromPost(fm, body) {
  const source = getField(fm, "sourceUrl");
  let m = source.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  m = body.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function main() {
  if (!existsSync(YT_JSON) && !existsSync(YT_JSON_FALLBACK)) {
    console.error(`Missing ${YT_JSON}`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(existsSync(YT_JSON) ? YT_JSON : YT_JSON_FALLBACK, "utf8"));
  const byId = new Map(
    (data.entries || [])
      .filter((e) => e.id)
      .map((e) => [e.id, e])
  );

  let matched = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of readdirSync(POSTS_DIR)) {
    if (!file.endsWith(".md")) continue;
    const path = join(POSTS_DIR, file);
    const content = readFileSync(path, "utf8");
    const parsed = parseFrontmatter(content);
    if (!parsed) continue;

    const sourceUrl = getField(parsed.fm, "sourceUrl");
    if (!sourceUrl.includes("youtube.com/watch")) continue;

    const videoId = videoIdFromPost(parsed.fm, parsed.body);
    if (!videoId) {
      skipped++;
      continue;
    }

    const video = byId.get(videoId);
    if (!video) {
      console.warn(`No metadata for ${videoId} (${file})`);
      skipped++;
      continue;
    }

    matched++;
    const image = getField(parsed.fm, "image") || `/uploads/youtube/${videoId}.jpg`;
    const title = getField(parsed.fm, "title") || video.title;
    const intro = buildIntro(title, video.description);
    let fm = parsed.fm;
    fm = setField(fm, "description", trimMeta(intro));
    fm = setField(fm, "tags", JSON.stringify(extractTags(title, video.description)));
    fm = setField(fm, "author", "Arab Tech Trends");

    const newContent = `---\n${fm}\n---\n\n${buildPostBody({ ...video, title })}`;

    if (newContent !== content) {
      if (apply) writeFileSync(path, newContent, "utf8");
      updated++;
    }
  }

  console.log(`YouTube posts found: ${matched}`);
  console.log(`${apply ? "Updated" : "Would update"}: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  if (!apply && updated) console.log("\nRe-run with --apply to write changes.");
}

main();
