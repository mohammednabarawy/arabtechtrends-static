#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { OWNER_CHANNELS } from "./merge-youtube-channels.mjs";

const ROOT = join(import.meta.dirname, "..");

for (const ch of OWNER_CHANNELS) {
  console.log(`Fetching ${ch.label}…`);
  const out = join(ROOT, ch.file);
  const result = spawnSync(
    "yt-dlp",
    ["--flat-playlist", "-J", ch.videosUrl],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
  writeFileSync(out, result.stdout, "utf8");
}

import "./merge-youtube-channels.mjs";
