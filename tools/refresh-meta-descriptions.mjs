#!/usr/bin/env node
/**
 * Refresh weak meta descriptions (truncated, too long, or copied from body).
 * Usage: node tools/refresh-meta-descriptions.mjs [--apply] [--limit N]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const apply = process.argv.includes("--apply");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getField(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*["']([^"']*)["']`, "m"));
  return m ? m[1] : "";
}

function setDescription(fm, desc) {
  const escaped = desc.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  if (/^description:\s/m.test(fm)) {
    return fm.replace(/^description:\s*.+$/m, `description: "${escaped}"`);
  }
  return fm.replace(/^(title:\s*.+)$/m, `$1\ndescription: "${escaped}"`);
}

function trimToMeta(text, max = 158) {
  let out = text.replace(/\s+/g, " ").trim();
  if (out.length <= max) return out;
  out = out.slice(0, max - 1);
  const lastSpace = out.lastIndexOf(" ");
  if (lastSpace > 80) out = out.slice(0, lastSpace);
  return `${out}…`;
}

function firstSentence(text) {
  const parts = text.split(/(?<=[.!?؟])\s+/);
  return parts.find((p) => p.length >= 40) ?? text;
}

function needsRefresh(desc, title, bodyPlain) {
  if (!desc || desc.length < 50) return true;
  if (desc.length > 165) return true;
  if (desc.startsWith(title.slice(0, Math.min(title.length, 40)))) return false;
  const probe = bodyPlain.slice(0, Math.min(80, bodyPlain.length));
  if (probe.length >= 40 && desc.startsWith(probe.slice(0, 40))) return true;
  if (desc.endsWith("،") || desc.endsWith(",") || /\sو$/.test(desc)) return true;
  return false;
}

function makeDescription(title, bodyPlain) {
  const sentence = firstSentence(bodyPlain);
  let candidate = sentence.length >= 90 ? sentence : `${title} — ${sentence}`;
  return trimToMeta(candidate);
}

let scanned = 0;
let refreshed = 0;

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  if (refreshed >= limit) break;
  const path = join(POSTS_DIR, file);
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) continue;

  const [, fm, body] = match;
  const title = getField(fm, "title");
  const desc = getField(fm, "description");
  const bodyPlain = plainText(body);
  scanned += 1;

  if (!needsRefresh(desc, title, bodyPlain)) continue;

  const nextDesc = makeDescription(title, bodyPlain);
  if (nextDesc === desc) continue;

  const newFm = setDescription(fm, nextDesc);
  const output = `---\n${newFm}\n---\n${body}`;
  if (apply) writeFileSync(path, output, "utf8");
  refreshed += 1;
}

console.log(
  apply
    ? `refresh-meta: updated ${refreshed} of ${scanned} posts`
    : `refresh-meta: would update ${refreshed} of ${scanned} posts (pass --apply)`
);
