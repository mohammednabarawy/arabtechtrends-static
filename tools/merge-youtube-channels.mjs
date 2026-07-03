#!/usr/bin/env node
/**
 * Merge flat-playlist exports from all owner YouTube channels.
 * Output: tools/youtube-all-channels.json
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "tools/youtube-all-channels.json");

export const OWNER_CHANNELS = [
  {
    key: "arabtechtrends",
    label: "عرب تك",
    url: "https://www.youtube.com/@arabtechtrends",
    videosUrl: "https://www.youtube.com/@arabtechtrends/videos",
    file: "tools/yt-arabtechtrends.json"
  },
  {
    key: "invoices-reader",
    label: "قارئ الفواتير",
    url: "https://www.youtube.com/channel/UC_ZB9oGAXykxhe9ZzTKBkag",
    videosUrl: "https://www.youtube.com/channel/UC_ZB9oGAXykxhe9ZzTKBkag/videos",
    file: "tools/yt-invoices-reader.json"
  },
  {
    key: "elnabarawi",
    label: "elnabarawi",
    url: "https://www.youtube.com/@elnabarawi",
    videosUrl: "https://www.youtube.com/@elnabarawi/videos",
    file: "tools/yt-elnabarawi.json"
  }
];

export const OWNER_CHANNEL_IDS = new Set([
  "UChrliFvWW35aSvkcMkbjJhA",
  "UC_ZB9oGAXykxhe9ZzTKBkag",
  "UC8CyTYo_qz4T5onLKjhLhMg"
]);

function main() {
  const channels = [];
  const entries = [];
  const seen = new Set();

  for (const ch of OWNER_CHANNELS) {
    const path = join(ROOT, ch.file);
    if (!existsSync(path)) {
      console.warn(`Skip missing ${ch.file} — run npm run fetch:youtube`);
      continue;
    }
    const data = JSON.parse(readFileSync(path, "utf8"));
    channels.push({
      key: ch.key,
      label: ch.label,
      url: ch.url,
      channel_id: data.channel_id || data.id,
      video_count: data.entries?.length ?? 0
    });
    for (const entry of data.entries || []) {
      if (!entry.id || seen.has(entry.id)) continue;
      seen.add(entry.id);
      entries.push({
        ...entry,
        owner_channel: ch.key,
        owner_label: ch.label
      });
    }
  }

  const payload = {
    updated: new Date().toISOString().slice(0, 10),
    channels,
    entries
  };

  writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Merged ${entries.length} videos from ${channels.length} channel(s) → ${OUT}`);
  for (const ch of channels) {
    console.log(`  ${ch.label}: ${ch.video_count}`);
  }
}

main();
