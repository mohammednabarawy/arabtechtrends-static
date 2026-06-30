#!/usr/bin/env node
/**
 * Replace broken wp-content image src with blogger.googleusercontent href from the same figure.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join(import.meta.dirname, "../src/content/posts");
const WP = /https?:\/\/(?:www\.)?arabtechtrends\.com\/wp-content\/uploads\/[^"'\s<>]+/i;
const FIGURE_RE =
  /<(?:figure|div)[^>]*>[\s\S]*?<a[^>]+href=["'](https:\/\/blogger\.googleusercontent\.com\/[^"']+)["'][^>]*>[\s\S]*?<img[^>]+src=["'](https?:\/\/(?:www\.)?arabtechtrends\.com\/wp-content\/uploads\/[^"']+)["'][^>]*>[\s\S]*?<\/(?:figure|div)>/gi;

let updated = 0;
let replacements = 0;

for (const file of readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const path = join(POSTS_DIR, file);
  let text = readFileSync(path, "utf8");
  let changed = false;

  text = text.replace(FIGURE_RE, (block, bloggerUrl, wpUrl) => {
    if (!WP.test(wpUrl)) return block;
    changed = true;
    replacements++;
    return block.replace(wpUrl, bloggerUrl);
  });

  // frontmatter image field
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (fm) {
    const imageLine = fm[1].match(/^image:\s*"(https?:\/\/(?:www\.)?arabtechtrends\.com\/wp-content\/uploads\/[^"]+)"/m);
    if (imageLine) {
      const body = text.slice(fm[0].length);
      const blogger = body.match(/https:\/\/blogger\.googleusercontent\.com\/[^"'\s<>]+/);
      if (blogger) {
        text = text.replace(imageLine[0], `image: "${blogger[0]}"`);
        changed = true;
        replacements++;
      }
    }
  }

  if (changed) {
    writeFileSync(path, text, "utf8");
    updated++;
  }
}

console.log(`recover-blogger-images: ${updated} posts updated, ${replacements} URLs swapped`);
