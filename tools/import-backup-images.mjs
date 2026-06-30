#!/usr/bin/env node
/**
 * Copy images from extracted cPanel backup into public/uploads/wp/
 * Searches multiple partial extraction directories.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const sourceArg = process.argv.find((a) => a.startsWith("--source="))?.split("=")[1];
const BACKUP_ROOT = process.argv.find((a) => a.startsWith("--backup-dir="))?.split("=")[1]?.replace(/\\/g, "/")
  ?? "E:/backup-6.30.2026_17-15-39_invodhyo";

const UPLOADS_SOURCES = sourceArg
  ? [sourceArg.replace(/\\/g, "/")]
  : [
      "E:/arabtechtrends.com/arabtechtrends.com/wp-content/uploads",
      `${BACKUP_ROOT}/python-extract`,
      `${BACKUP_ROOT}/python-extract-public/arabtechtrends.com`,
      `${BACKUP_ROOT}/backup-6.30.2026_17-15-39_invodhyo/homedir/arabtechtrends.com/wp-content/uploads`,
      `${BACKUP_ROOT}/backup-6.30.2026_17-15-39_invodhyo/homedir/public_html/wp-content/uploads`,
      `${BACKUP_ROOT}/wp-content/uploads`,
      `${BACKUP_ROOT}/arabtechtrends.com/wp-content/uploads`
    ].filter((p) => existsSync(p));

if (!UPLOADS_SOURCES.length) {
  console.error("import-backup-images: no extracted uploads folders found.");
  process.exit(1);
}

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const DEST_ROOT = join(import.meta.dirname, "../public/uploads/wp");
const MAP_PATH = join(import.meta.dirname, "image-url-map.json");

const URL_RE = /https?:\/\/(?:www\.)?arabtechtrends\.com\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;

function relFromUrl(url) {
  const path = new URL(url.split("?")[0].split("#")[0]).pathname;
  return decodeURIComponent(path.replace(/^\/wp-content\/uploads\//, "")).replace(/\\/g, "/");
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

// Build lookup indexes from all sources
const byRel = new Map();
const byBase = new Map();
const byPrefix = new Map();

for (const srcRoot of UPLOADS_SOURCES) {
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

const urlSet = new Set();
for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  for (const match of readFileSync(join(POSTS_DIR, file), "utf8").matchAll(URL_RE)) {
    urlSet.add(match[0].replace(/&amp;/g, "&").split("?")[0]);
  }
}

const urlMap = existsSync(MAP_PATH) ? JSON.parse(readFileSync(MAP_PATH, "utf8")) : {};
let copied = 0;
let missing = 0;

for (const url of urlSet) {
  const rel = relFromUrl(url);
  const src = findFile(rel);
  if (!src) {
    missing++;
    continue;
  }

  const dest = join(DEST_ROOT, rel);
  mkdirSync(dirname(dest), { recursive: true });
  if (!existsSync(dest) || statSync(dest).size === 0) {
    copyFileSync(src, dest);
    copied++;
  }
  urlMap[url] = `/uploads/wp/${rel}`;
}

writeFileSync(MAP_PATH, JSON.stringify(urlMap, null, 2), "utf8");

let filesUpdated = 0;
const sorted = Object.keys(urlMap).sort((a, b) => b.length - a.length);
for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(POSTS_DIR, file);
  let text = readFileSync(path, "utf8");
  let changed = false;
  for (const remote of sorted) {
    const local = urlMap[remote];
    if (!local) continue;
    const variants = [remote, remote.replace(/&/g, "&amp;"), `${remote}?v=1751968976`];
    for (const v of variants) {
      if (text.includes(v)) {
        text = text.split(v).join(local);
        changed = true;
      }
    }
  }
  if (changed) {
    writeFileSync(path, text, "utf8");
    filesUpdated++;
  }
}

console.log(`import-backup-images: indexed ${byRel.size} files from ${UPLOADS_SOURCES.length} sources`);
console.log(`  ${urlSet.size} URLs referenced, ${copied} copied, ${missing} missing, ${filesUpdated} posts updated`);
