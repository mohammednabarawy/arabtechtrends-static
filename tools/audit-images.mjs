#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const PUBLIC = join(import.meta.dirname, "../public");
const IMG_RE = /<img[^>]+src=["']([^"']+)["']/gi;

const stats = {
  total: 0,
  emptyFm: 0,
  localFm: 0,
  remoteFm: 0,
  bodyImg: 0,
  noImage: 0,
  brokenLocal: 0,
  remoteBody: 0,
  hasSourceUrl: 0,
  emptyWithSource: 0
};

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  stats.total++;
  const raw = readFileSync(join(POSTS_DIR, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) continue;
  const [, fm, body] = match;

  const imgLine = fm.match(/^image:\s*["']([^"']*)["']/m);
  const imgVal = imgLine?.[1]?.trim() ?? "";
  const sourceUrl = fm.match(/^sourceUrl:\s*["']([^"']+)["']/m)?.[1];

  if (sourceUrl) stats.hasSourceUrl++;
  if (!imgVal) stats.emptyFm++;
  else if (imgVal.startsWith("/uploads/")) stats.localFm++;
  else if (/^https?:/.test(imgVal)) stats.remoteFm++;

  if (!imgVal && sourceUrl) stats.emptyWithSource++;

  const bodyImgs = [...body.matchAll(IMG_RE)].map((m) => m[1]);
  if (bodyImgs.length) stats.bodyImg++;

  const cardImg = imgVal || bodyImgs[0];
  if (!cardImg) {
    stats.noImage++;
    continue;
  }

  if (cardImg.startsWith("/uploads/")) {
    const disk = join(PUBLIC, cardImg.split("?")[0].replace(/^\//, ""));
    if (!existsSync(disk)) stats.brokenLocal++;
  } else if (/arabtechtrends\.com\/wp-content/.test(cardImg)) {
    stats.remoteBody++;
  }
}

console.log(JSON.stringify(stats, null, 2));
