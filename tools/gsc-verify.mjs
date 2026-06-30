#!/usr/bin/env node
/**
 * Write Google Search Console verification file from env var.
 * Set GOOGLE_SITE_VERIFICATION to the content value from GSC (e.g. google-site-verification: googleabc123.html)
 * Or set GSC_VERIFICATION_TOKEN to just the token part.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const publicDir = join(import.meta.dirname, "../public");
const token = process.env.GSC_VERIFICATION_TOKEN || process.env.GOOGLE_SITE_VERIFICATION;

if (!token) {
  console.log("gsc-verify: skipped (set GSC_VERIFICATION_TOKEN in GitHub Actions secrets)");
  process.exit(0);
}

const clean = token
  .replace(/^google-site-verification:\s*/i, "")
  .replace(/\.html$/i, "")
  .trim();

const filename = token.includes(".html") ? token.replace(/^google-site-verification:\s*/i, "").trim() : `google${clean}.html`;
const content = `google-site-verification: ${filename}`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, filename), content, "utf8");
console.log(`gsc-verify: wrote public/${filename}`);
