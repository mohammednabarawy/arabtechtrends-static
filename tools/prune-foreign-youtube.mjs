#!/usr/bin/env node
/**
 * Remove YouTube-imported posts not on owner channels; strip embeds from others.
 * Usage: node tools/prune-foreign-youtube.mjs [--apply]
 */
import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { OWNER_CHANNEL_IDS } from "./merge-youtube-channels.mjs";

const ROOT = join(import.meta.dirname, "..");
const POSTS_DIR = join(ROOT, "src/content/posts");
const THUMBS_DIR = join(ROOT, "public/uploads/youtube");
const ALL_JSON = join(ROOT, "tools/youtube-all-channels.json");
const LEGACY_JSON = join(ROOT, "tools/youtube-full.json");
const apply = process.argv.includes("--apply");

const IMPORT_RE =
  /sourceUrl:\s*["']https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})["']/;
const EMBED_BLOCK_RE =
  /<figure[^>]*wp-block-embed[^>]*youtube[\s\S]*?<\/figure>\s*/gi;
const IFRAME_RE =
  /<iframe[^>]*youtube\.com\/embed\/([A-Za-z0-9_-]{11})[^>]*>[\s\S]*?<\/iframe>\s*/gi;

function loadOwnerVideoIds() {
  const path = existsSync(ALL_JSON) ? ALL_JSON : LEGACY_JSON;
  if (!existsSync(path)) {
    console.error("Missing tools/youtube-all-channels.json — run: npm run fetch:youtube");
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(path, "utf8"));
  const ids = new Set();
  for (const entry of data.entries || []) {
    if (!entry.id) continue;
    if (entry.channel_id && !OWNER_CHANNEL_IDS.has(entry.channel_id)) continue;
    ids.add(entry.id);
  }
  return ids;
}

function stripForeignEmbeds(content, ownerIds) {
  let next = content;
  let changed = false;

  const stripFromHtml = (html) => {
    for (const id of extractEmbedIds(html)) {
      if (ownerIds.has(id)) continue;
      return "";
    }
    return html;
  };

  next = next.replace(EMBED_BLOCK_RE, (block) => {
    const cleaned = stripFromHtml(block);
    if (cleaned !== block) changed = true;
    return cleaned;
  });

  next = next.replace(IFRAME_RE, (block) => {
    const cleaned = stripFromHtml(block);
    if (cleaned !== block) changed = true;
    return cleaned;
  });

  return { content: next, changed };
}

function extractEmbedIds(html) {
  const ids = [];
  const re = /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/g;
  let m;
  while ((m = re.exec(html))) ids.push(m[1]);
  return ids;
}

function main() {
  const ownerIds = loadOwnerVideoIds();
  const deleteImports = [];
  const stripEmbeds = [];

  for (const file of readdirSync(POSTS_DIR)) {
    if (!file.endsWith(".md")) continue;
    const path = join(POSTS_DIR, file);
    const content = readFileSync(path, "utf8");
    const importMatch = content.match(IMPORT_RE);

    if (importMatch) {
      const videoId = importMatch[1];
      if (!ownerIds.has(videoId)) {
        deleteImports.push({ file, path, videoId });
      }
      continue;
    }

    if (!/youtube\.com\/embed\//.test(content)) continue;
    const foreign = extractEmbedIds(content).filter((id) => !ownerIds.has(id));
    if (foreign.length) {
      stripEmbeds.push({ file, path, foreign });
    }
  }

  console.log(`Owner channel videos: ${ownerIds.size}`);
  console.log(`Import posts to delete: ${deleteImports.length}`);
  console.log(`Articles to strip foreign embeds: ${stripEmbeds.length}`);

  for (const item of deleteImports) {
    console.log(`  delete post  ${item.videoId}  ${item.file}`);
    if (apply) {
      unlinkSync(item.path);
      const thumb = join(THUMBS_DIR, `${item.videoId}.jpg`);
      if (existsSync(thumb)) unlinkSync(thumb);
    }
  }

  for (const item of stripEmbeds) {
    console.log(`  strip embed  ${item.foreign.join(",")}  ${item.file}`);
    if (apply) {
      const { content, changed } = stripForeignEmbeds(readFileSync(item.path, "utf8"), ownerIds);
      if (changed) writeFileSync(item.path, content, "utf8");
    }
  }

  if (!apply && (deleteImports.length || stripEmbeds.length)) {
    console.log("\nRe-run with --apply to apply changes.");
  }
}

main();
